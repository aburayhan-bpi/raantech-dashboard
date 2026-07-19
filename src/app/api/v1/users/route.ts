import { z } from 'zod';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
  permissions: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    await dbConnect();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    return ApiResponse.success(users, 'Users retrieved successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const body = await req.json();
    const validatedData = CreateUserSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    const { name, email, role, permissions } = validatedData.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return ApiResponse.error('User with this email already exists', 409);
    }

    // Generate random secure password
    const rawPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      permissions: permissions || [],
    });

    // Send Invitation Email
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Raantech Dashboard!</h2>
        <p>Hello ${name},</p>
        <p>You have been invited by the Super Admin to join the Raantech Dashboard as a <strong>${role}</strong>.</p>
        <p>Here are your login credentials:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 10px 0 0 0;"><strong>Password:</strong> ${rawPassword}</p>
        </div>
        <p>Please log in and remember to keep these credentials secure.</p>
        <br/>
        <p>Best regards,<br/>The Raantech Team</p>
      </div>
    `;

    const emailSent = await sendEmail({
      to: email,
      subject: 'Invitation to join Raantech Dashboard',
      html: emailHtml,
    });

    const userData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    return ApiResponse.success({
      user: userData,
      emailSent
    }, 'User created and invitation sent successfully');

  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
