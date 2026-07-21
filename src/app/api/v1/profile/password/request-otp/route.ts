import { z } from 'zod';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

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
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div style="background-color: #0089A7; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Password Change Request</h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Hello ${user.name},</h2>
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px; font-size: 16px;">You recently requested to change your password for your Raantech Dashboard account. Please use the verification code below to complete the process. This code will expire in <strong style="color: #0089A7;">10 minutes</strong>.</p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #0089A7; padding: 25px 20px; text-align: center; border-radius: 8px; margin: 35px 0;">
              <p style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #0089A7; margin: 0;">${otpCode}</p>
            </div>
            
            <p style="font-weight: 600; color: #dc2626; margin-top: 30px; line-height: 1.5;">If you did not request a password change, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">This is an automated security notification from Raantech Dashboard. Please do not reply to this email.</p>
            <p style="margin: 0; margin-top: 10px; color: #94a3b8; font-size: 13px;">&copy; ${new Date().getFullYear()} Raantech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Your Password Change Verification Code',
      html: emailHtml,
    });

    return ApiResponse.success(null, 'OTP sent to your email successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
