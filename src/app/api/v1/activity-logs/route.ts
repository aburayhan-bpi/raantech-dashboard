import dbConnect from '@/lib/mongoose';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.unauthorized('Only Super Admin can view activity logs');
    }

    await dbConnect();
    const logs = await ActivityLog.find({})
      .populate('user', 'name role')
      .sort({ createdAt: -1 })
      .limit(100); // Limit to last 100 activities for performance
      
    return ApiResponse.success(logs);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
