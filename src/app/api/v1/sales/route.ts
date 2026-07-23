import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Customer from '@/models/Customer';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';

const CreateSaleSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  customerId: z.string().min(1, 'Customer ID is required'),
  serialNumber: z.string().optional(),
  salePrice: z.number().min(0, 'Sale price must be valid'),
});

export async function GET() {
  try {
    const auth = await verifyAuth('sales:view');
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    const sales = await Sale.find({})
      .populate('product', 'name price')
      .populate('customer', 'name phone')
      .populate('soldBy', 'name')
      .sort({ createdAt: -1 });
      
    return ApiResponse.success(sales);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth('sales:create');
    if (!auth) return ApiResponse.unauthorized();

    const body = await req.json();
    const validatedData = CreateSaleSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    const { productId, customerId, serialNumber, salePrice } = validatedData.data;

    await dbConnect();

    // 1. Verify Product & Stock
    const product = await Product.findById(productId);
    if (!product) return ApiResponse.error('Product not found', 404);
    if (product.stock <= 0) return ApiResponse.error('Product is out of stock', 400);

    // 2. Verify Customer
    const customer = await Customer.findById(customerId);
    if (!customer) return ApiResponse.error('Customer not found', 404);

    // 3. Create Sale
    const newSale = await Sale.create({
      product: productId,
      customer: customerId,
      serialNumber,
      salePrice,
      soldBy: auth.userId,
    });

    // 4. Update Stock
    product.stock -= 1;
    await product.save();

    // 5. Update Customer Purchase Count
    customer.totalPurchases += 1;
    await customer.save();

    // 6. Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'SALE',
      details: `Sold product ${product.name} to ${customer.name} for ${salePrice} TK`,
    });

    return ApiResponse.success(newSale, 'Sale created successfully', 201);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
