import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    await dbConnect();
    const user = await User.findById(auth.userId).select('-password');
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(user, 'Profile fetched successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  profileImage: z.string().url().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
});

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = UpdateProfileSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();

    const updatedUser = await User.findByIdAndUpdate(
      auth.userId,
      { $set: validatedData.data },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return ApiResponse.error('User not found', 404);
    }

    return ApiResponse.success(updatedUser, 'Profile updated successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
