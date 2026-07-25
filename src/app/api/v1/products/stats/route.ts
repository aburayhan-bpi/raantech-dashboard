import dbConnect from '@/lib/mongoose';
import Product from '@/models/Product';
import { ApiResponse } from '@/lib/apiResponse';
import { verifyAuth } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await verifyAuth('products:view');
    if (!auth) {
      return ApiResponse.error('Unauthorized', 401);
    }

    await dbConnect();

    const stats = await Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] }
          },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', '$alertQuantity'] }] },
                1,
                0
              ]
            }
          },
          totalInventoryValue: {
            $sum: { $multiply: ['$buyingPrice', '$stock'] }
          },
          totalRetailValue: {
            $sum: { $multiply: ['$sellingPrice', '$stock'] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      activeProducts: 0,
      outOfStock: 0,
      lowStock: 0,
      totalInventoryValue: 0,
      totalRetailValue: 0
    };

    return ApiResponse.success(result, 'Product stats retrieved successfully');
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
