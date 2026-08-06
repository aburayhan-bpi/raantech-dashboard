import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function GET() {
  console.log("Testing email via API route...");
  const user = process.env.CONTACT_EMAIL_USER || "MISSING";
  const pass = process.env.CONTACT_EMAIL_APP_PASSWORD || "MISSING";
  
  const debugInfo = {
    user: user !== "MISSING" ? user : "MISSING",
    passLength: pass.length,
    passFirst4: pass.substring(0, 4),
    passLast4: pass.substring(pass.length - 4),
    hasSpaces: pass.includes(" "),
    hasQuotes: pass.includes('"')
  };

  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email from API',
    html: '<h1>Test Email</h1>'
  });
  console.log("Email result:", result);
  return NextResponse.json({ success: result, debug: debugInfo });
}
