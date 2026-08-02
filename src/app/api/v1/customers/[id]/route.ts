import dbConnect from '@/lib/mongoose';
import Customer from '@/models/Customer';
import { verifyAuth } from '@/lib/auth';
import { ApiResponse } from '@/lib/apiResponse';
import ActivityLog from '@/models/ActivityLog';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth('customers:update');
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    const resolvedParams = await params;
    const body = await req.json();

    const customer = await Customer.findByIdAndUpdate(
      resolvedParams.id,
      body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return ApiResponse.error('Customer not found', 404);
    }

    await ActivityLog.create({
      user: auth.userId,
      action: 'UPDATED',
      entityType: 'CUSTOMER',
      entityId: customer._id,
      details: `Updated customer: ${customer.name}`,
    });

    return ApiResponse.success(customer, 'Customer updated successfully');
  } catch (error) {
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth('customers:delete');
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    const resolvedParams = await params;

    const customer = await Customer.findById(resolvedParams.id);
    if (!customer) {
      return ApiResponse.error('Customer not found', 404);
    }

    // Check if customer has associated sales (this is just basic logic, adjust if needed)
    // For now, we will allow delete or add a soft check
    if (customer.totalPurchases > 0) {
      return ApiResponse.error("Cannot delete customer with existing sales history", 400);
    }

    await Customer.findByIdAndDelete(resolvedParams.id);

    await ActivityLog.create({
      user: auth.userId,
      action: 'DELETED',
      entityType: 'CUSTOMER',
      entityId: customer._id,
      details: `Deleted customer: ${customer.name}`,
    });

    return ApiResponse.success(null, 'Customer deleted successfully');
  } catch (error) {
    return ApiResponse.serverError(error);
  }
}
