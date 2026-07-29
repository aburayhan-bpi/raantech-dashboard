import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Supplier from '@/models/Supplier';
import * as xlsx from 'xlsx';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth("suppliers:create");
    if (!auth) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 });
    }

    await dbConnect();
    
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const name = row['Name'];
      const phone = row['Phone']?.toString();

      if (!name || !phone) {
        errors.push(`Row ${i + 2}: Missing required fields (Name or Phone)`);
        skipped++;
        continue;
      }

      const supplierData = {
        name,
        company: row['Company'] || '',
        phone,
        email: row['Email'] || '',
        address: row['Address'] || '',
        status: row['Status'] || 'ACTIVE',
        totalDue: Number(row['Total Due']) || 0,
      };

      try {
        const existing = await Supplier.findOne({ phone: supplierData.phone });
        if (existing) {
          await Supplier.updateOne({ _id: existing._id }, supplierData);
          imported++;
        } else {
          await Supplier.create(supplierData);
          imported++;
        }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        skipped++;
        errors.push(`Row ${i + 2}: ${err.message || 'Validation error'}`);
      }
    }

    return NextResponse.json({
      message: `Import complete. ${imported} imported/updated, ${skipped} skipped.`,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[SUPPLIERS_IMPORT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
