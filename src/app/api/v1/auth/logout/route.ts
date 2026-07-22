import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';
import ActivityLog from '@/models/ActivityLog';

export async function POST() {
  try {
    const auth = await verifyAuth();
    
    if (auth) {
      await ActivityLog.create({
        user: auth.userId,
        action: 'LOGOUT',
        entityType: 'AUTH',
        details: 'User logged out',
      });
    }

    const response = ApiResponse.success(null, 'Logout successful');

    // Clear the HTTP-Only cookies
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    
    // Also clear these in case they were set by frontend or older versions
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    response.cookies.delete('authUser');

    return response;
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
