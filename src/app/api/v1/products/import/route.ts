import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import Category from '@/models/Category';
import * as xlsx from 'xlsx';
import { generateSlug } from '@/lib/slugify';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth("products:create");
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
      const name = row['Product Name'];
      const catName = row['Category'];

      if (!name || !catName) {
        errors.push(`Row ${i + 2}: Missing required fields (Name or Category)`);
        skipped++;
        continue;
      }

      // Find or create category
      let category = await Category.findOne({ name: { $regex: new RegExp(`^${catName}$`, 'i') } });
      if (!category) {
        category = await Category.create({
          name: catName,
          slug: generateSlug(catName) || Math.random().toString(36).substring(2, 10),
          createdBy: auth.userId,
        });
      }

      const tags = typeof row['Tags'] === 'string' ? row['Tags'].split(',').map((t: string) => t.trim()).filter(Boolean) : [];

      const productData = {
        name,
        category: category._id,
        brand: row['Brand'] || '',
        buyingPrice: Number(row['Buying Price']) || 0,
        sellingPrice: Number(row['Selling Price']) || 0,
        discountPrice: Number(row['Discount Price']) || 0,
        tax: Number(row['Tax (%)']) || 0,
        stock: Number(row['Stock Quantity']) || 0,
        alertQuantity: Number(row['Alert Quantity']) || 5,
        unit: row['Unit'] || 'pcs',
        sku: row['SKU']?.toString() || undefined,
        barcode: row['Barcode']?.toString() || undefined,
        status: row['Status'] || 'ACTIVE',
        warrantyType: row['Warranty Type'] || undefined,
        warrantyPeriod: row['Warranty Period'] || undefined,
        isReturnable: row['Returnable']?.toString().toLowerCase() === 'yes',
        returnWindow: row['Return Window'] || undefined,
        metaTitle: row['Meta Title'] || undefined,
        metaDescription: row['Meta Description'] || undefined,
        metaKeywords: row['Meta Keywords'] || undefined,
        tags,
        description: row['Description'] || '',
        createdBy: auth.userId,
      };

      try {
        if (productData.sku) {
          // Update if SKU exists
          const existing = await Product.findOne({ sku: productData.sku });
          if (existing) {
            await Product.updateOne({ _id: existing._id }, productData);
            imported++;
            continue;
          }
        }
        
        await Product.create(productData);
        imported++;
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
    console.error('[PRODUCTS_IMPORT]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
