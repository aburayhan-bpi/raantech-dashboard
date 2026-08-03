import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  console.log("Testing email via API route...");
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email from API',
    html: '<h1>Test Email</h1>'
  });
  console.log("Email result:", result);
  return NextResponse.json({ success: result });
}
