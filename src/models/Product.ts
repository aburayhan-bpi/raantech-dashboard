import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';
import { 
  PRODUCT_STATUSES, 
  PRODUCT_UNITS, 
  ProductStatus, 
  ProductUnit,
  DEFAULT_PRODUCT_STATUS,
  DEFAULT_PRODUCT_UNIT
} from '@/types/backend';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  category: mongoose.Types.ObjectId;
  brand?: string;
  
  // Pricing & Profit
  buyingPrice: number;
  sellingPrice: number;
  discountPrice?: number;
  tax: number;
  
  // Inventory
  stock: number;
  alertQuantity: number;
  unit?: ProductUnit;
  
  // Identifiers
  sku?: string;
  barcode?: string;
  
  // Media
  images: string[];
  
  // Metadata & Status
  status: ProductStatus;
  tags: string[];
  
  // Security & Auditing
  isDeleted: boolean;
  deletedAt: Date | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String },
    
    buyingPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discountPrice: { type: Number },
    tax: { type: Number, default: 0 },
    
    stock: { type: Number, required: true, min: 0 },
    alertQuantity: { type: Number, default: 5 },
    unit: { type: String, enum: PRODUCT_UNITS, default: DEFAULT_PRODUCT_UNIT },
    
    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String, unique: true, sparse: true },
    
    images: [{ type: String }],
    
    status: { type: String, enum: PRODUCT_STATUSES, default: DEFAULT_PRODUCT_STATUS },
    tags: [{ type: String }],
    
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    const baseSlug = slugify(this.name, { lower: true, strict: true });
    
    // Ensure slug uniqueness
    const ProductModel = mongoose.models.Product || mongoose.model('Product', ProductSchema);
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    while (await ProductModel.findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = uniqueSlug;
  }
});

ProductSchema.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
