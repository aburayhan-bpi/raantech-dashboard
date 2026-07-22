import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';

const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Invalid email address').optional(),
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
    
    const user = await User.findOne({ _id: id, isDeleted: false }).select('-password -__v');
    if (!user) {
      return ApiResponse.error('User not found or deleted', 404);
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

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: validatedData.data },
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return ApiResponse.error('User not found', 404);
    }

    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'UPDATED',
      entityType: 'USER',
      details: `Updated user: ${updatedUser.email}`,
    });

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
    const deletedUser = await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date(), status: 'INACTIVE' } },
      { new: true }
    );

    if (!deletedUser) {
      return ApiResponse.error('User not found or already deleted', 404);
    }

    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'DELETED',
      entityType: 'USER',
      details: `Deleted user: ${deletedUser.email}`,
    });

    return ApiResponse.success(null, 'User deleted successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
