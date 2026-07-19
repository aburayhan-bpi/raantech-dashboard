import dbConnect from '@/lib/mongoose';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    const auth = await verifyAuth();
    if (!auth || (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN')) {
      return ApiResponse.unauthorized('Only Admins can view stats');
    }

    await dbConnect();

    // 1. Calculate Total Revenue
    const sales = await Sale.find({});
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.salePrice || 0), 0);

    // 2. Calculate Total Expenses
    const expenses = await Expense.find({});
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // 3. Calculate Net Profit
    const netProfit = totalRevenue - totalExpenses;

    // 4. Staff Leaderboard (Aggregate sales by user)
    const leaderboardRaw = await Sale.aggregate([
      {
        $group: {
          _id: '$soldBy',
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          totalRevenue: 1,
          name: '$user.name',
          role: '$user.role'
        }
      }
    ]);

    const stats = {
      totalRevenue,
      totalExpenses,
      netProfit,
      totalSalesCount: sales.length,
      leaderboard: leaderboardRaw
    };

    return ApiResponse.success(stats);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
