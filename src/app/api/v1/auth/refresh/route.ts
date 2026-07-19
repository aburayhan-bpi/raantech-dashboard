import { z } from 'zod';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { ApiResponse } from '@/lib/apiResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_key';

const RefreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = RefreshSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    const { refreshToken } = validatedData.data;

    // Verify Refresh Token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      return ApiResponse.error('Invalid or expired refresh token', 401);
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return ApiResponse.error('User not found', 404);
    }

    // Generate new Access Token
    const newAccessToken = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']) || '7d' }
    );

    // Optionally generate a new refresh token to rotate it
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']) || '30d' }
    );

    const responseData = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    const response = ApiResponse.success(responseData, 'Token refreshed successfully');

    response.cookies.set({
      name: 'auth_token',
      value: newAccessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.JWT_ACCESS_COOKIE_MAX_AGE) || 604800,
      path: '/',
    });
    
    response.cookies.set({
      name: 'refresh_token',
      value: newRefreshToken,
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
