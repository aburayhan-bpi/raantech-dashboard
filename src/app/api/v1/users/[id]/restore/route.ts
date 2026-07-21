import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const { id } = await params;
    
    await dbConnect();

    const restoredUser = await User.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null, status: 'ACTIVE' } },
      { new: true }
    ).select('-password -__v');

    if (!restoredUser) {
      return ApiResponse.error('User not found or is not deleted', 404);
    }

    return ApiResponse.success(restoredUser, 'User restored successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
