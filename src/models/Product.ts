import mongoose, { Schema, Document } from 'mongoose';
import { generateSlug } from '@/lib/slugify';
import { 
  PRODUCT_STATUSES, 
  PRODUCT_UNITS, 
  WARRANTY_TYPES,
  ProductStatus, 
  ProductUnit,
  WarrantyType,
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
  
  // Warranty & Policy
  warrantyType?: WarrantyType;
  warrantyPeriod?: string;
  isReturnable: boolean;
  returnWindow?: string;
  
  // Metadata & Status
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
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
    
    // Warranty & Policy
    warrantyType: { type: String, enum: WARRANTY_TYPES },
    warrantyPeriod: { type: String },
    isReturnable: { type: Boolean, default: true },
    returnWindow: { type: String },
    
    // SEO Metadata
    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.pre('save', async function () {
  if (this.isModified('name') || !this.slug) {
    let baseSlug = generateSlug(this.name);
    if (!baseSlug) {
      baseSlug = Math.random().toString(36).substring(2, 10);
    }
    
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

// Clear mongoose model cache in development for HMR support
if (process.env.NODE_ENV !== 'production' && mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
