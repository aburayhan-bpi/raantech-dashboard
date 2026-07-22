import dbConnect from '@/lib/mongoose';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.unauthorized('Only Super Admin can view activity logs');
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { entityType: { $regex: search, $options: 'i' } },
      ];
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .populate('user', 'name role email profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return ApiResponse.success(logs, "Activity logs retrieved successfully", {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
