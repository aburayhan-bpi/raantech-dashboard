import { cookies, headers } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function GET() {
  try {
    // 1. Get token from Authorization header or cookie
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth_token');
      if (authCookie) token = authCookie.value;
    }

    if (!token) {
      return ApiResponse.error('Not authenticated', 401);
    }

    // 2. Verify Token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return ApiResponse.error('Invalid or expired token', 401);
    }

    // 3. Get User from Database
    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    // 4. Return Profile
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      profileImage: user.profileImage || null,
      status: user.status || 'ACTIVE',
      createdAt: user.createdAt,
    };

    return ApiResponse.success(userProfile, 'Profile retrieved successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
