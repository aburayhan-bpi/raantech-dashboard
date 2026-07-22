import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';
import ActivityLog from '@/models/ActivityLog';

const UpdateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN')) {
      return ApiResponse.unauthorized();
    }

    const resolvedParams = await params;
    const categoryId = resolvedParams.id;
    const body = await req.json();
    const validatedData = UpdateCategorySchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    const existingCategory = await Category.findById(categoryId);
    
    if (!existingCategory) {
      return ApiResponse.error('Category not found', 404);
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: validatedData.data },
      { new: true, runValidators: true }
    );

    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'UPDATED',
      entityType: 'CATEGORY',
      details: `Updated category: ${updatedCategory.name}`,
    });

    return ApiResponse.success(updatedCategory, 'Category updated successfully');
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      return ApiResponse.error('Category with this name already exists', 400);
    }
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN')) {
      return ApiResponse.unauthorized();
    }

    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    await dbConnect();

    // Check if category is linked to products
    const productsCount = await Product.countDocuments({ category: categoryId });
    if (productsCount > 0) {
      return ApiResponse.error(
        `Cannot delete category because it is linked to ${productsCount} product(s). Please reassign or delete them first.`,
        400
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(categoryId);
    
    if (!deletedCategory) {
      return ApiResponse.error('Category not found', 404);
    }

    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'DELETED',
      entityType: 'CATEGORY',
      details: `Deleted category: ${deletedCategory.name}`,
    });

    return ApiResponse.success(null, 'Category deleted successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
