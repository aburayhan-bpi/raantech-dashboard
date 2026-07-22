import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';
import ActivityLog from '@/models/ActivityLog';

const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category ID is required'),
  image: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().min(0, 'Stock must be positive'),
  warrantyPeriod: z.number().min(0, 'Warranty period must be valid'),
});

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    // Populate category details
    const products = await Product.find({}).populate('category', 'name').sort({ createdAt: -1 });
    return ApiResponse.success(products);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN')) {
      return ApiResponse.unauthorized('Only Admins can add products');
    }

    const body = await req.json();
    const validatedData = CreateProductSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    const newProduct = await Product.create(validatedData.data);
    
    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'PRODUCT',
      details: `Created new product: ${validatedData.data.name}`,
    });

    return ApiResponse.success(newProduct, 'Product created successfully', 201);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
