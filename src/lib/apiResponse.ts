import { NextResponse } from 'next/server';

type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

type ErrorResponse = {
  success: false;
  error: string;
};

export class ApiResponse {
  static success<T>(data: T, message?: string, status = 200) {
    const response: SuccessResponse<T> = { success: true, data };
    if (message) response.message = message;
    return NextResponse.json(response, { status });
  }

  static error(error: string, status = 400) {
    const response: ErrorResponse = { success: false, error };
    return NextResponse.json(response, { status });
  }

  static serverError(error: unknown) {
    console.error('[SERVER_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }

  static unauthorized(message = 'Unauthorized') {
    return NextResponse.json(
      { success: false, error: message },
      { status: 401 }
    );
  }
}
