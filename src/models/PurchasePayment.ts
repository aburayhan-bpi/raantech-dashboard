import mongoose, { Document, Model, Schema } from "mongoose";
import { PurchasePaymentMethod, PURCHASE_PAYMENT_METHODS } from "@/types/backend";

export interface IPurchasePayment extends Document {
  purchase: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: PurchasePaymentMethod;
  paymentDate: Date;
  note?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchasePaymentSchema = new Schema<IPurchasePayment>(
  {
    purchase: { type: Schema.Types.ObjectId, ref: "Purchase", required: true },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    paymentMethod: {
      type: String,
      enum: PURCHASE_PAYMENT_METHODS,
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    note: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const PurchasePayment: Model<IPurchasePayment> =
  mongoose.models.PurchasePayment || mongoose.model<IPurchasePayment>("PurchasePayment", purchasePaymentSchema);
