import { z } from 'zod';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import { ApiResponse } from '@/lib/apiResponse';
import { sendTemplateEmail } from '@/lib/email';

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
    await sendTemplateEmail(
      'forgot-password',
      { name: user.name, email: user.email, resetUrl },
      user.email,
      'Reset Your Password - Raantech Dashboard'
    );

    return ApiResponse.success(
      { email },
      'If an account with this email exists, a password reset link has been sent.'
    );
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
