import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  alternatePhone?: string;
  totalPurchases: number;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema: Schema = new Schema(
  {
    phone: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    alternatePhone: { type: String },
    totalPurchases: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
