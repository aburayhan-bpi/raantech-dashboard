import { z } from 'zod';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import Otp from '@/models/Otp';

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
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

    // Verify OTP
    const otpRecord = await Otp.findOne({ userId: user._id });
    if (!otpRecord) {
      return ApiResponse.error('OTP expired or not requested', 400);
    }

    const isOtpValid = await bcrypt.compare(validatedData.data.otp, otpRecord.otp);
    if (!isOtpValid) {
      return ApiResponse.error('Invalid OTP', 400);
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    await Otp.deleteOne({ _id: otpRecord._id });

    // Send Password Change Notification Email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background-color: #eab308; padding: 30px 40px; text-align: center; } /* Yellow/Warning theme for security alert */
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px; }
          .content h2 { margin-top: 0; color: #111827; font-size: 22px; }
          .content p { line-height: 1.6; color: #4b5563; margin-bottom: 24px; font-size: 16px; }
          .alert-box { background-color: #fefce8; border-left: 4px solid #eab308; padding: 20px; border-radius: 4px 8px 8px 4px; margin-bottom: 30px; }
          .alert-box p { margin: 0; color: #854d0e; font-size: 15px; font-weight: 500; }
          .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; color: #94a3b8; font-size: 13px; }
          .footer a { color: #0089A7; text-decoration: none; font-weight: 500; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Security Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${user.name},</h2>
            <p>We are writing to inform you that the password for your Raantech Dashboard account (<strong>${user.email}</strong>) was recently changed.</p>
            
            <div class="alert-box">
              <p>Timestamp: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}</p>
            </div>
            
            <p>If you made this change, you can safely ignore this email.</p>
            <p style="font-weight: 600; color: #dc2626;">If you did not request this change, please contact your Super Admin immediately to secure your account.</p>
          </div>
          <div class="footer">
            <p>This is an automated security notification from Raantech Dashboard. Please do not reply to this email.</p>
            <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Raantech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Security Alert: Your password was changed',
      html: emailHtml,
    });

    return ApiResponse.success(null, 'Password changed successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
