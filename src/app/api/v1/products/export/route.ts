import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import * as xlsx from 'xlsx';

export async function GET() {
  try {
    const auth = await verifyAuth("products:view");
    if (!auth) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await dbConnect();

    const products = await Product.find({ isDeleted: false })
      .populate('category', 'name')
      .lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportData = products.map((p: any) => ({
      'Product Name': p.name || '',
      'Category': p.category?.name || '',
      'Brand': p.brand || '',
      'Buying Price': p.buyingPrice || 0,
      'Selling Price': p.sellingPrice || 0,
      'Discount Price': p.discountPrice || 0,
      'Tax (%)': p.tax || 0,
      'Stock Quantity': p.stock || 0,
      'Alert Quantity': p.alertQuantity || 0,
      'Unit': p.unit || 'pcs',
      'SKU': p.sku || '',
      'Barcode': p.barcode || '',
      'Status': p.status || 'ACTIVE',
      'Warranty Type': p.warrantyType || '',
      'Warranty Period': p.warrantyPeriod || '',
      'Returnable': p.isReturnable ? 'Yes' : 'No',
      'Return Window': p.returnWindow || '',
      'Meta Title': p.metaTitle || '',
      'Meta Description': p.metaDescription || '',
      'Meta Keywords': p.metaKeywords || '',
      'Tags': Array.isArray(p.tags) ? p.tags.join(',') : '',
      'Description': p.description || '',
    }));

    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buf = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Disposition': 'attachment; filename="products_export.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('[PRODUCTS_EXPORT]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
