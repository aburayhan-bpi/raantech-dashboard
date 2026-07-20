import { z } from 'zod';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function PUT(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = ChangePasswordSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    const { currentPassword, newPassword } = validatedData.data;

    await dbConnect();

    const user = await User.findById(auth.userId);
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return ApiResponse.error('Incorrect current password', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return ApiResponse.success(null, 'Password changed successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
