import { z } from "zod";
import dbConnect from "@/lib/mongoose";
import Supplier from "@/models/Supplier";
import { verifyAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/apiResponse";
import ActivityLog from "@/models/ActivityLog";
import mongoose from "mongoose";
import { SUPPLIER_STATUSES } from "@/types/backend";

const UpdateSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").optional(),
  company: z.string().optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  status: z.enum(SUPPLIER_STATUSES).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth("suppliers:view");
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.error("Invalid supplier ID", 400);
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return ApiResponse.error("Supplier not found", 404);
    }

    return ApiResponse.success(supplier);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth("suppliers:update");
    if (!auth) return ApiResponse.unauthorized();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.error("Invalid supplier ID", 400);
    }

    const body = await req.json();
    const validatedData = UpdateSupplierSchema.safeParse(body);

    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();

    // Ensure email is undef instead of empty string if empty
    if (validatedData.data.email === "") {
      delete validatedData.data.email;
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      { $set: validatedData.data },
      { new: true, runValidators: true }
    );

    if (!updatedSupplier) {
      return ApiResponse.error("Supplier not found", 404);
    }

    await ActivityLog.create({
      user: auth.userId,
      action: "UPDATED",
      entityType: "SUPPLIER",
      details: `Updated supplier: ${updatedSupplier.name}`,
    });

    return ApiResponse.success(updatedSupplier, "Supplier updated successfully");
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      return ApiResponse.error("Supplier with this phone number already exists", 400);
    }
    return ApiResponse.serverError(error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth("suppliers:delete");
    if (!auth) return ApiResponse.unauthorized();

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.error("Invalid supplier ID", 400);
    }

    await dbConnect();
    const deletedSupplier = await Supplier.findOneAndUpdate(
      { _id: id },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedSupplier) {
      return ApiResponse.error("Supplier not found", 404);
    }

    await ActivityLog.create({
      user: auth.userId,
      action: "DELETED",
      entityType: "SUPPLIER",
      details: `Deleted supplier: ${deletedSupplier.name}`,
    });

    return ApiResponse.success(null, "Supplier deleted successfully");
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
