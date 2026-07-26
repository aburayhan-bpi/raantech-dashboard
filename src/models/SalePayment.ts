import mongoose, { Document, Schema } from "mongoose";
import { SalePaymentMethod, SALE_PAYMENT_METHODS } from "@/types/backend";

export interface ISalePayment extends Document {
  sale: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: SalePaymentMethod;
  paymentDate: Date;
  note?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const salePaymentSchema = new Schema<ISalePayment>(
  {
    sale: { type: Schema.Types.ObjectId, ref: "Sale", required: true },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    paymentMethod: {
      type: String,
      enum: SALE_PAYMENT_METHODS,
      required: true,
    },
    paymentDate: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.SalePayment;
}
export default mongoose.models.SalePayment || mongoose.model<ISalePayment>("SalePayment", salePaymentSchema);
