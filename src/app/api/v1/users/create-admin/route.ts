import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';
import { sendTemplateEmail } from '@/lib/email';

const CreateAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  permissions: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth) {
      return ApiResponse.unauthorized();
    }
    if (auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const body = await req.json();
    const validatedData = CreateAdminSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    const { name, email, permissions } = validatedData.data;

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
      role: 'ADMIN', // Hardcoded as ADMIN for this specific API
      status: 'ACTIVE',
      permissions: permissions || [],
    });

    try {
      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const loginUrl = `${origin}/login`;
      
      await sendTemplateEmail(
        'welcome',
        { name, email, password: rawPassword, loginUrl },
        email,
        'Welcome to Raantech Dashboard - Your Admin Credentials'
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // We still return success even if email fails, but log it
    }

    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'USER',
      details: `Created new admin: ${email}`,
    });

    const userObj = newUser.toJSON();
    delete userObj.password;

    return ApiResponse.success(userObj, 'Admin created successfully', 201);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
