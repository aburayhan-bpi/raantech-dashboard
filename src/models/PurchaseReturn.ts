import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPurchaseReturnItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface IPurchaseReturn extends Document {
  purchase: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  items: IPurchaseReturnItem[];
  
  subTotal: number;
  tax: number;
  totalAmount: number;
  
  returnDate: Date;
  note?: string;
  
  createdBy: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const purchaseReturnItemSchema = new Schema<IPurchaseReturnItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: [0.01, "Quantity must be greater than 0"] },
  unitCost: { type: Number, required: true, min: [0, "Unit cost cannot be negative"] },
  total: { type: Number, required: true, min: [0, "Total cannot be negative"] },
});

const purchaseReturnSchema = new Schema<IPurchaseReturn>(
  {
    purchase: { type: Schema.Types.ObjectId, ref: "Purchase", required: true },
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: { 
      type: [purchaseReturnItemSchema], 
      required: true, 
      validate: [(v: IPurchaseReturnItem[]) => v.length > 0, "At least one item is required"] 
    },
    
    subTotal: { type: Number, required: true, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    
    returnDate: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true },
    
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.PurchaseReturn;
}

const PurchaseReturn: Model<IPurchaseReturn> = mongoose.models.PurchaseReturn || mongoose.model<IPurchaseReturn>("PurchaseReturn", purchaseReturnSchema);

export default PurchaseReturn;
