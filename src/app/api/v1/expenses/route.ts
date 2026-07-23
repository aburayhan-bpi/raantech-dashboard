import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Expense from '@/models/Expense';
import ActivityLog from '@/models/ActivityLog';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';

const CreateExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  date: z.string().optional(),
});

export async function GET() {
  try {
    const auth = await verifyAuth('expenses:view');
    if (!auth) {
      return ApiResponse.unauthorized('Only Admins or authorized staff can view expenses');
    }

    await dbConnect();
    const expenses = await Expense.find({})
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });
      
    return ApiResponse.success(expenses);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth('expenses:create');
    if (!auth) {
      return ApiResponse.unauthorized('Only Admins or authorized staff can add expenses');
    }

    const body = await req.json();
    const validatedData = CreateExpenseSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    
    const newExpense = await Expense.create({
      ...validatedData.data,
      date: validatedData.data.date ? new Date(validatedData.data.date) : new Date(),
      addedBy: auth.userId,
    });

    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'EXPENSE',
      details: `Added expense: ${validatedData.data.description} (${validatedData.data.amount} TK)`,
    });

    return ApiResponse.success(newExpense, 'Expense added successfully', 201);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
