import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import { ApiResponse } from '@/lib/apiResponse';
import { sendEmail } from '@/lib/email';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = ForgotPasswordSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    const { email } = validatedData.data;

    await dbConnect();

    const user = await User.findOne({ email, isDeleted: { $ne: true } });
    
    // We always return success even if user not found to prevent email enumeration attacks
    if (!user) {
      return ApiResponse.success(
        { email }, 
        'If an account with this email exists, a password reset link has been sent.'
      );
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token using sha256 before storing in DB (searchable and secure)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Delete any existing reset tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Save hashed token to DB
    await ResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt
    });

    // Create reset URL (pointing to the frontend reset password page)
    // We pass the raw unhashed token in the URL.
    // The frontend should be running on the origin domain.
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${origin}/reset-password?token=${resetToken}`;

    // Send the email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <div style="background-color: #0089A7; padding: 30px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">Password Reset Request</h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="margin-top: 0; color: #111827; font-size: 22px;">Hello ${user.name},</h2>
            <p style="line-height: 1.6; color: #4b5563; margin-bottom: 24px; font-size: 16px;">We received a request to reset the password for your Raantech Dashboard account (<strong style="color: #0089A7;">${user.email}</strong>).</p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="background-color: #0089A7; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">Reset Password</a>
            </div>

            <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 4px 8px 8px 4px; margin-bottom: 20px; font-size: 14px; color: #854d0e;">
              This link is valid for exactly <strong>15 minutes</strong>. If you don't use it by then, you will need to request a new one.
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; line-height: 1.5;">
              If the button above doesn't work, copy and paste this URL into your browser:<br>
              <a href="${resetUrl}" style="word-break: break-all; color: #0089A7; text-decoration: underline;">${resetUrl}</a>
            </p>
            
            <p style="font-weight: 600; color: #dc2626; margin-top: 20px;">If you did not request a password reset, please safely ignore this email.</p>
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
      subject: 'Reset Your Password - Raantech Dashboard',
      html: emailHtml,
    });

    return ApiResponse.success(
      { email },
      'If an account with this email exists, a password reset link has been sent.'
    );
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
