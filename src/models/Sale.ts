import mongoose, { Document, Model, Schema } from "mongoose";
import { 
  SalePaymentStatus, SALE_PAYMENT_STATUSES, DEFAULT_SALE_PAYMENT_STATUS,
  SalePaymentMethod, SALE_PAYMENT_METHODS, DEFAULT_SALE_PAYMENT_METHOD,
  SaleStatus, SALE_STATUSES, DEFAULT_SALE_STATUS
} from "@/types/backend";

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ISale extends Document {
  saleNo: string;
  customer: mongoose.Types.ObjectId;
  items: ISaleItem[];
  
  subTotal: number;
  discount: number;
  tax: number;
  shippingCharge: number;
  totalAmount: number;
  
  paidAmount: number;
  dueAmount: number;
  
  paymentStatus: SalePaymentStatus;
  paymentMethod: SalePaymentMethod;
  
  saleDate: Date;
  courierDetails?: string;
  note?: string;
  status: SaleStatus;
  
  createdBy: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: [0.01, "Quantity must be greater than 0"] },
  unitPrice: { type: Number, required: true, min: [0, "Unit price cannot be negative"] },
  total: { type: Number, required: true, min: [0, "Total cannot be negative"] },
});

const saleSchema = new Schema<ISale>(
  {
    saleNo: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [saleItemSchema], required: true, validate: [(v: ISaleItem[]) => v.length > 0, "At least one item is required"] },
    
    subTotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shippingCharge: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    
    paymentStatus: {
      type: String,
      enum: SALE_PAYMENT_STATUSES,
      default: DEFAULT_SALE_PAYMENT_STATUS,
    },
    paymentMethod: {
      type: String,
      enum: SALE_PAYMENT_METHODS,
      default: DEFAULT_SALE_PAYMENT_METHOD,
    },
    
    saleDate: { type: Date, required: true, default: Date.now },
    courierDetails: { type: String, trim: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: SALE_STATUSES,
      default: DEFAULT_SALE_STATUS,
    },
    
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

// Auto-generate saleNo if not provided
saleSchema.pre("validate", async function () {
  if (!this.saleNo) {
    try {
      // Find the last sale to get the number
      const lastSale = await (this.constructor as Model<ISale>).findOne({}, "saleNo").sort({ createdAt: -1 });
      
      let nextNumber = 1;
      if (lastSale && lastSale.saleNo) {
        // e.g., ORD-2026-00001
        const parts = lastSale.saleNo.split("-");
        if (parts.length === 3) {
          const lastNum = parseInt(parts[2], 10);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      }
      
      const currentYear = new Date().getFullYear();
      this.saleNo = `ORD-${currentYear}-${nextNumber.toString().padStart(5, "0")}`;
    } catch (error) {
      console.error("Error generating saleNo:", error);
      throw error;
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  delete mongoose.models.Sale;
}
export default mongoose.models.Sale || mongoose.model<ISale>("Sale", saleSchema);
