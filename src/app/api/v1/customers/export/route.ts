import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Customer from '@/models/Customer';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    const auth = await verifyAuth("customers:view");
    if (!auth) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const customers = await Customer.find().lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportData = customers.map((c: any) => ({
      'Name': c.name || '',
      'Phone': c.phone || '',
      'Email': c.email || '',
      'Alternate Phone': c.alternatePhone || '',
      'Address': c.address || '',
      'Total Purchases': c.totalPurchases || 0,
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Customers');

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Disposition': 'attachment; filename="customers_export.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('[CUSTOMERS_EXPORT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
