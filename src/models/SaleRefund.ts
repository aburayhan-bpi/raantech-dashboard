import mongoose, { Document, Schema } from "mongoose";
import { SaleRefundMethod, SALE_REFUND_METHODS } from "@/types/backend";

export interface ISaleRefund extends Document {
  sale: mongoose.Types.ObjectId;
  amount: number;
  refundMethod: SaleRefundMethod;
  refundDate: Date;
  note?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleRefundSchema = new Schema<ISaleRefund>(
  {
    sale: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    refundMethod: {
      type: String,
      enum: SALE_REFUND_METHODS,
      required: true,
    },
    refundDate: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.SaleRefund;
}
export default mongoose.models.SaleRefund || mongoose.model<ISaleRefund>("SaleRefund", saleRefundSchema);
