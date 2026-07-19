import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ createdAt: -1 });
    return ApiResponse.success(categories);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authorization
    const auth = await verifyAuth();
    if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN')) {
      return ApiResponse.unauthorized();
    }

    // 2. Parse and Validate Request
    const body = await req.json();
    const validatedData = CreateCategorySchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    // 3. Database Operation
    await dbConnect();
    const { name, description } = validatedData.data;
    const newCategory = await Category.create({ name, description });
    
    // 4. Return Success
    return ApiResponse.success(newCategory, 'Category created successfully', 201);

  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      return ApiResponse.error('Category with this name already exists', 400);
    }
    return ApiResponse.serverError(error);
  }
}
