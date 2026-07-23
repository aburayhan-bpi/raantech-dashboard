import { z } from 'zod';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';
import { sendEmail } from '@/lib/email'; // assuming it exists from previous

const CreateAdminSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  permissions: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
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

    // Send welcome email with credentials
    const emailHtml = `
      <h2>Welcome to Raantech Dashboard</h2>
      <p>Hello ${name},</p>
      <p>An ADMIN account has been created for you.</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${rawPassword}</p>
      <p>Please login and change your password immediately.</p>
    `;

    try {
      await sendEmail({
        to: email,
        subject: 'Your Raantech Admin Account Credentials',
        html: emailHtml,
      });
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
