import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: Request) {
  try {
    // 1. Validate Request Body
    const body = await req.json();
    const validatedData = LoginSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    // 2. Database Operation
    await dbConnect();
    const { email, password } = validatedData.data;

    const user = await User.findOne({ email });
    if (!user) {
      return ApiResponse.error('Invalid credentials', 401);
    }

    // 3. Verify Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return ApiResponse.error('Invalid credentials', 401);
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) || '7d' }
    );
    
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';
    const refreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '30d' }
    );

    // 5. Construct Response with Cookie
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    const responseData = {
      accessToken: token,
      refreshToken: refreshToken,
      user: userData,
    };

    const response = ApiResponse.success(responseData, 'Login successful');

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.JWT_ACCESS_COOKIE_MAX_AGE) || 604800, 
      path: '/',
    });
    
    response.cookies.set({
      name: 'refresh_token',
      value: refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.JWT_REFRESH_COOKIE_MAX_AGE) || 2592000,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
