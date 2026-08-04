import { z } from 'zod';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import { sendTemplateEmail } from '@/lib/email';

const RequestOtpSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = RequestOtpSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    const { currentPassword } = validatedData.data;

    await dbConnect();

    const user = await User.findById(auth.userId);
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    // Verify current password before sending OTP
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return ApiResponse.error('Incorrect current password', 400);
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the OTP before saving to DB
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);

    // Delete any existing OTPs for this user
    await Otp.deleteMany({ userId: user._id });

    // Save new OTP with 10 minutes expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await Otp.create({
      userId: user._id,
      otp: hashedOtp,
      expiresAt
    });

    // Send OTP via Email
    await sendTemplateEmail(
      'otp',
      { name: user.name, otp: otpCode },
      user.email,
      'Your Password Change Verification Code'
    );

    return ApiResponse.success(null, 'OTP sent to your email successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
