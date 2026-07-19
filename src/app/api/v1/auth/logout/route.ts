import { ApiResponse } from '@/lib/apiResponse';

export async function POST() {
  try {
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
