import { z } from 'zod';
import dbConnect from '@/lib/mongoose';
import Customer from '@/models/Customer';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';
import ActivityLog from '@/models/ActivityLog';
import { getPaginationParams, formatPaginatedResponse } from '@/utils/backendPagination';

const CreateCustomerSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  alternatePhone: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth('customers:view');
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get('phone');
    const search = searchParams.get('search');

    if (phone) {
      // Search specific customer by phone
      const customer = await Customer.findOne({ phone });
      return ApiResponse.success(customer ? [customer] : []);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isDeleted: { $ne: true } }; // Ensure we don't fetch deleted if any
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const { page, limit: paginatedLimit, skip } = getPaginationParams(req);
    
    // If phone is requested, or specific limit without pagination is requested, we could handle it, 
    // but standard pagination is best. Let's use standard pagination for all list requests.
    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ createdAt: -1 }).skip(skip).limit(paginatedLimit),
      Customer.countDocuments(query),
    ]);
    
    const paginated = formatPaginatedResponse(customers, total, page, paginatedLimit);
    return ApiResponse.success(paginated.data, 'Customers retrieved successfully', paginated.meta);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth('customers:create');
    if (!auth) return ApiResponse.unauthorized();

    const body = await req.json();
    const validatedData = CreateCustomerSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    
    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ phone: validatedData.data.phone });
    if (existingCustomer) {
      return ApiResponse.error('Customer with this phone number already exists', 400);
    }

    const newCustomer = await Customer.create(validatedData.data);

    // Log Activity
    await ActivityLog.create({
      user: auth.userId,
      action: 'CREATED',
      entityType: 'CUSTOMER',
      details: `Created new customer: ${newCustomer.name}`,
    });

    return ApiResponse.success(newCustomer, 'Customer created successfully', 201);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
