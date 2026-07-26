import mongoose, { Document, Model, Schema } from "mongoose";
import { 
  PurchasePaymentStatus, PURCHASE_PAYMENT_STATUSES, DEFAULT_PURCHASE_PAYMENT_STATUS,
  PurchasePaymentMethod, PURCHASE_PAYMENT_METHODS, DEFAULT_PURCHASE_PAYMENT_METHOD,
  PurchaseStatus, PURCHASE_STATUSES, DEFAULT_PURCHASE_STATUS
} from "@/types/backend";

export interface IPurchaseItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchase extends Document {
  purchaseNo: string;
  supplier: mongoose.Types.ObjectId;
  items: IPurchaseItem[];
  
  subTotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  
  paidAmount: number;
  dueAmount: number;
  
  paymentStatus: PurchasePaymentStatus;
  paymentMethod: PurchasePaymentMethod;
  
  purchaseDate: Date;
  note?: string;
  status: PurchaseStatus;
  
  createdBy: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: [0.01, "Quantity must be greater than 0"] },
  unitCost: { type: Number, required: true, min: [0, "Unit cost cannot be negative"] },
  total: { type: Number, required: true, min: [0, "Total cannot be negative"] },
});

const purchaseSchema = new Schema<IPurchase>(
  {
    purchaseNo: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: { type: [purchaseItemSchema], required: true, validate: [(v: IPurchaseItem[]) => v.length > 0, "At least one item is required"] },
    
    subTotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    
    paymentStatus: {
      type: String,
      enum: PURCHASE_PAYMENT_STATUSES,
      default: DEFAULT_PURCHASE_PAYMENT_STATUS,
    },
    paymentMethod: {
      type: String,
      enum: PURCHASE_PAYMENT_METHODS,
      default: DEFAULT_PURCHASE_PAYMENT_METHOD,
    },
    
    purchaseDate: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: PURCHASE_STATUSES,
      default: DEFAULT_PURCHASE_STATUS,
    },
    
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Auto-generate purchaseNo if not provided
purchaseSchema.pre("validate", async function () {
  if (!this.purchaseNo) {
    try {
      // Find the last purchase to get the number
      const lastPurchase = await (this.constructor as Model<IPurchase>).findOne({}, "purchaseNo").sort({ createdAt: -1 });
      
      let nextNumber = 1;
      if (lastPurchase && lastPurchase.purchaseNo) {
        // e.g., PUR-2026-00001
        const parts = lastPurchase.purchaseNo.split("-");
        if (parts.length === 3) {
          const lastNum = parseInt(parts[2], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }
      
      const year = new Date().getFullYear();
      this.purchaseNo = `PUR-${year}-${nextNumber.toString().padStart(5, "0")}`;
    } catch (err: unknown) {
      throw err;
    }
  }
});

const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>("Purchase", purchaseSchema);

export default Purchase;
