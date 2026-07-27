import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';

// Ensure Category schema is registered for populate
void Category;

import { PRODUCT_STATUSES, PRODUCT_UNITS } from '@/types/backend';
import { parsePaginationParams, getPaginationMeta } from '@/lib/pagination';

const ProductCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  
  buyingPrice: z.number().min(0, 'Buying price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  discountPrice: z.number().optional(),
  tax: z.number().optional().default(0),
  
  stock: z.number().min(0, 'Stock must be positive'),
  alertQuantity: z.number().optional().default(5),
  unit: z.enum([...PRODUCT_UNITS] as [string, ...string[]]).optional().default('pcs'),
  
  sku: z.string().optional(),
  barcode: z.string().optional(),
  
  images: z.array(z.string()).optional().default([]),
  
  status: z.enum([...PRODUCT_STATUSES] as [string, ...string[]]).optional().default('ACTIVE'),
  tags: z.array(z.string()).optional().default([]),
});

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth('products:create');
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = ProductCreateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    
    // Check SKU/Barcode uniqueness if provided
    const { sku, barcode } = validatedData.data;
    if (sku || barcode) {
      const existingProduct = await Product.findOne({
        $or: [
          ...(sku ? [{ sku }] : []),
          ...(barcode ? [{ barcode }] : [])
        ]
      });
      
      if (existingProduct) {
        if (existingProduct.sku === sku) return ApiResponse.error('SKU already exists', 409);
        if (existingProduct.barcode === barcode) return ApiResponse.error('Barcode already exists', 409);
      }
    }

    const productData = { ...validatedData.data };
    if (productData.sku === "") productData.sku = undefined;
    if (productData.barcode === "") productData.barcode = undefined;

    const newProduct = await Product.create({
      ...productData,
      createdBy: auth.userId,
    });

    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'PRODUCT',
      entityId: newProduct._id,
      details: `Created product: ${newProduct.name}`,
    });

    return ApiResponse.success(newProduct, 'Product created successfully', 201);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth('products:view');
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parsePaginationParams(searchParams);
    
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const isDeleted = searchParams.get('isDeleted') === 'true';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isDeleted };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    const meta = getPaginationMeta(total, page, limit);

    return ApiResponse.success(products, 'Products retrieved successfully', meta, 200);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
