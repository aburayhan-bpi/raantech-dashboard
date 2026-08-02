import mongoose, { Document, Model, Schema } from "mongoose";
import { SupplierStatus, SUPPLIER_STATUSES, DEFAULT_SUPPLIER_STATUS } from "@/types/backend";

export interface ISupplier extends Document {
  name: string;
  company?: string;
  phone: string;
  email?: string;
  address?: string;
  status: SupplierStatus;
  totalDue: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: SUPPLIER_STATUSES,
      default: DEFAULT_SUPPLIER_STATUS,
    },
    totalDue: {
      type: Number,
      default: 0,
      min: [0, "Total due cannot be negative"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", supplierSchema);

export default Supplier;
