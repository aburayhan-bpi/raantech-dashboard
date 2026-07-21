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

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return ApiResponse.error('Forbidden: Super Admin access required', 403);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    const searchTerm = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const isDeletedQuery = searchParams.get('isDeleted') === 'true'; // Allow fetching deleted users for restore UI

    await dbConnect();
    
    // Build query
    const query: Record<string, unknown> = { 
      isDeleted: isDeletedQuery ? true : { $ne: true } 
    };
    
    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      // Frontend might pass "active", "inactive"
      query.status = status.toUpperCase();
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    return ApiResponse.success(users, 'Users retrieved successfully', {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    });
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

    // Determine the base URL dynamically based on the request
    const host = req.headers.get("host");
    const protocol = req.headers.get("x-forwarded-proto") || (host?.includes('localhost') ? 'http' : 'https');
    const origin = req.headers.get("origin") || (host ? `${protocol}://${host}` : null);
    const appUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Send Invitation Email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px; color: #1f2937; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
          .header { background-color: #0089A7; padding: 30px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.5px; }
          .content { padding: 40px; }
          .content h2 { margin-top: 0; color: #111827; font-size: 22px; }
          .content p { line-height: 1.6; color: #4b5563; margin-bottom: 24px; font-size: 16px; }
          .credentials { background-color: #f8fafc; border-left: 4px solid #0089A7; padding: 20px; border-radius: 4px 8px 8px 4px; margin-bottom: 30px; }
          .credentials p { margin: 0 0 10px 0; color: #1f2937; font-size: 15px; }
          .credentials p:last-child { margin: 0; }
          .label { font-weight: 600; color: #64748b; display: inline-block; width: 85px; }
          .btn-container { text-align: center; margin-top: 35px; margin-bottom: 10px; }
          .btn { display: inline-block; background-color: #0089A7; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
          .btn:hover { background-color: #007B96; }
          .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { margin: 0; color: #94a3b8; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Raantech Dashboard</h1>
          </div>
          <div class="content">
            <h2>Welcome aboard, ${name}!</h2>
            <p>You have been successfully invited by the Super Admin to join the Raantech Dashboard. Your account has been provisioned with <strong>${role}</strong> access.</p>
            
            <div class="credentials">
              <p><span class="label">Email:</span> <strong>${email}</strong></p>
              <p><span class="label">Password:</span> <strong>${rawPassword}</strong></p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; background-color: #f1f5f9; padding: 12px 16px; border-radius: 6px;">For your security, we strongly recommend changing this password immediately after your first login.</p>
            
            <div class="btn-container">
              <a href="${appUrl}/login" class="btn">Log In to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Raantech. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
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
