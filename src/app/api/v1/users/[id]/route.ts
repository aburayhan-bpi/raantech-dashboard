import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';

const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  permissions: z.array(z.string()).optional(),
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const { id } = await params;
    await dbConnect();
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(user, 'User fetched successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const { id } = await params;
    
    // Prevent updating oneself via this endpoint to avoid accidental role demotion
    if (auth.userId === id) {
      return ApiResponse.error('You cannot modify your own Super Admin role here', 400);
    }

    const body = await req.json();
    const validatedData = UpdateUserSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: validatedData.data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(updatedUser, 'User updated successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const { id } = await params;

    // Prevent deleting oneself
    if (auth.userId === id) {
      return ApiResponse.error('You cannot delete your own account', 400);
    }

    await dbConnect();
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(null, 'User deleted successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
