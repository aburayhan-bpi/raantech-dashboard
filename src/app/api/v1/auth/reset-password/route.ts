import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import { ApiResponse } from '@/lib/apiResponse';
import ActivityLog from '@/models/ActivityLog';

const ResetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = ResetPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    const { resetToken, newPassword } = validatedData.data;

    // Hash the received token to find it in the DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await dbConnect();

    // Find valid unexpired token
    const tokenRecord = await ResetToken.findOne({ 
      token: hashedToken,
      expiresAt: { $gt: new Date() } // Must not be expired
    });

    if (!tokenRecord) {
      return ApiResponse.error('Invalid or expired password reset token', 400);
    }

    // Find the associated user
    const user = await User.findById(tokenRecord.userId);
    if (!user || user.isDeleted) {
      return ApiResponse.error('User not found', 404);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete the used token (and any others for this user to be safe)
    await ResetToken.deleteMany({ userId: user._id });

    // Log Activity
    await ActivityLog.create({
      user: user._id,
      action: 'PASSWORD_CHANGE',
      entityType: 'AUTH',
      details: 'User reset their password via email link',
    });

    return ApiResponse.success(null, 'Password has been reset successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
