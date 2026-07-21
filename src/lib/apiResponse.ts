import { NextResponse } from 'next/server';



type ErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
};

export class ApiResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static success<T>(data: T, message: string = 'Success', meta?: any, status = 200) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = { success: true, statusCode: status, message };
    if (meta) response.meta = meta;
    response.data = data;
    return NextResponse.json(response, { status });
  }

  static error(error: string, status = 400) {
    const response: ErrorResponse = { success: false, statusCode: status, message: error, error };
    return NextResponse.json(response, { status });
  }

  static serverError(error: unknown) {
    console.error('[SERVER_ERROR]', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, statusCode: 500, message: errorMessage, error: errorMessage },
      { status: 500 }
    );
  }

  static unauthorized(message = 'Unauthorized') {
    return NextResponse.json(
      { success: false, statusCode: 401, message, error: message },
      { status: 401 }
    );
  }
}
