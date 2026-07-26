import { z } from "zod";
import dbConnect from "@/lib/mongoose";
import Supplier from "@/models/Supplier";
import { verifyAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/apiResponse";
import ActivityLog from "@/models/ActivityLog";
import { getPaginationParams, formatPaginatedResponse } from "@/utils/backendPagination";
import { SUPPLIER_STATUSES } from "@/types/backend";

const CreateSupplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  company: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  address: z.string().optional(),
  status: z.enum(SUPPLIER_STATUSES).optional(),
});

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth("suppliers:view");
    if (!auth) {
      return ApiResponse.unauthorized();
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    
    // Check if it's a paginated request or just fetching all for dropdowns
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ];
    }

    if (isPaginated) {
      const { page, limit, skip } = getPaginationParams(req);
      const [suppliers, total] = await Promise.all([
        Supplier.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Supplier.countDocuments(query),
      ]);
      const paginated = formatPaginatedResponse(suppliers, total, page, limit);
      return ApiResponse.success(paginated.data, "Suppliers retrieved successfully", paginated.meta);
    } else {
      const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
      return ApiResponse.success(suppliers);
    }
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth("suppliers:create");
    if (!auth) {
      return ApiResponse.unauthorized();
    }

    const body = await req.json();
    const validatedData = CreateSupplierSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();
    
    // Ensure email is undef instead of empty string if empty
    if (validatedData.data.email === "") {
      delete validatedData.data.email;
    }

    const newSupplier = await Supplier.create({
      ...validatedData.data,
      totalDue: 0,
    });
    
    await ActivityLog.create({
      user: auth.userId,
      action: "CREATED",
      entityType: "SUPPLIER",
      details: `Created new supplier: ${validatedData.data.name}`,
    });

    return ApiResponse.success(newSupplier, "Supplier created successfully", 201);
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 11000) {
      return ApiResponse.error("Supplier with this phone number already exists", 400);
    }
    return ApiResponse.serverError(error);
  }
}
