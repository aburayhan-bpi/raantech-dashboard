import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import ActivityLog from '@/models/ActivityLog';
import puppeteer from 'puppeteer';

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'csv';

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
      ];
    }
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (format === 'pdf') {
      // PDF GENERATION (Limit to 1000 records to prevent memory issues)
      const logs = await ActivityLog.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean();

      let tableRows = '';
      logs.forEach((log) => {
        const date = new Date(log.createdAt).toLocaleString();
        const userObj = log.user as { name?: string; email?: string } | undefined;
        const userName = userObj?.name || 'System';
        const actionText = log.action || '';
        const entityText = log.entityType || '';
        const detailsText = log.details || '';
        tableRows += `
          <tr>
            <td>${date}</td>
            <td>${userName}</td>
            <td>${actionText}</td>
            <td>${entityText}</td>
            <td>${detailsText}</td>
          </tr>
        `;
      });

      const htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; }
              h1 { text-align: center; color: #0089A7; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8fafc; color: #1e293b; font-weight: 600; }
              tr:nth-child(even) { background-color: #f9fafb; }
            </style>
          </head>
          <body>
            <h1>Activity Logs Report</h1>
            <p style="text-align:center; font-size: 12px; color: #64748b;">Generated on ${new Date().toLocaleString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'load' });
      const pdfUint8Array = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' } });
      await browser.close();

      const pdfBuffer = Buffer.from(pdfUint8Array);

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="activity_logs_${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });
    } else {
      // CSV GENERATION (STREAMING)
      const cursor = ActivityLog.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .cursor();

      const stream = new ReadableStream({
        async start(controller) {
          // CSV Header
          controller.enqueue(
            new TextEncoder().encode('Date,User Name,User Email,Action,Entity Type,Details\n')
          );

          // Fetch document by document
          for await (const log of cursor) {
            const date = new Date(log.createdAt).toISOString();
            const userObj = log.user as { name?: string; email?: string } | undefined;
            const userName = userObj?.name || 'System';
            const userEmail = userObj?.email || 'N/A';
            const actionText = log.action || '';
            const entityText = log.entityType || '';
            // Escape quotes in details
            const detailsText = `"${(log.details || '').replace(/"/g, '""')}"`;

            const row = `${date},${userName},${userEmail},${actionText},${entityText},${detailsText}\n`;
            controller.enqueue(new TextEncoder().encode(row));
          }

          controller.close();
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="activity_logs_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }
  } catch (error) {
    console.error('[EXPORT_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
