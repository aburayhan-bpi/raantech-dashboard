import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';
import ActivityLog from '@/models/ActivityLog';
import { getPaginationParams } from '@/utils/backendPagination';

const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return ApiResponse.unauthorized();
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    
    // Check if it's a paginated request or just fetching all for dropdowns
    const isPaginated = searchParams.has('page') || searchParams.has('limit');

    const query: Record<string, unknown> = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (isPaginated) {
      const { page, limit, skip } = getPaginationParams(req);
      const [categories, total] = await Promise.all([
        Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Category.countDocuments(query),
      ]);
      return ApiResponse.success(categories, "Categories retrieved successfully", {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      });
    } else {
      const categories = await Category.find(query).sort({ createdAt: -1 }).lean();
      return ApiResponse.success(categories);
    }
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
    const { name, description, image } = validatedData.data;
    const newCategory = await Category.create({ name, description, image });
    
    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'CATEGORY',
      details: `Created new category: ${name}`,
    });

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
