import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Supplier from '@/models/Supplier';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    const auth = await verifyAuth("suppliers:view");
    if (!auth) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const suppliers = await Supplier.find().lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportData = suppliers.map((s: any) => ({
      'Name': s.name || '',
      'Company': s.company || '',
      'Phone': s.phone || '',
      'Email': s.email || '',
      'Address': s.address || '',
      'Status': s.status || 'ACTIVE',
      'Total Due': s.totalDue || 0,
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Disposition': 'attachment; filename="suppliers_export.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('[SUPPLIERS_EXPORT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
