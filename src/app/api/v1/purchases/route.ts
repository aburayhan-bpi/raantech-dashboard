import { z } from "zod";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import ActivityLog from "@/models/ActivityLog";
import { verifyAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/apiResponse";
import { getPaginationParams, formatPaginatedResponse } from "@/utils/backendPagination";
import mongoose from "mongoose";
import { PURCHASE_PAYMENT_STATUSES, PURCHASE_PAYMENT_METHODS } from "@/types/backend";

const PurchaseItemSchema = z.object({
  product: z.string().min(1, "Product ID is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitCost: z.number().min(0, "Unit cost cannot be negative"),
  total: z.number().min(0, "Total cannot be negative"),
});

const CreatePurchaseSchema = z.object({
  supplier: z.string().min(1, "Supplier ID is required"),
  items: z.array(PurchaseItemSchema).min(1, "At least one item is required"),
  subTotal: z.number().min(0, "Sub total cannot be negative"),
  discount: z.number().min(0, "Discount cannot be negative").default(0),
  tax: z.number().min(0, "Tax cannot be negative").default(0),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  paidAmount: z.number().min(0, "Paid amount cannot be negative").default(0),
  dueAmount: z.number().min(0, "Due amount cannot be negative").default(0),
  paymentStatus: z.enum(PURCHASE_PAYMENT_STATUSES),
  paymentMethod: z.enum(PURCHASE_PAYMENT_METHODS),
  purchaseDate: z.string().optional(),
  note: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth("purchases:view");
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const supplierId = searchParams.get("supplierId");
    
    const isPaginated = searchParams.has("page") || searchParams.has("limit");

    const query: Record<string, unknown> = {};
    if (search) {
      query.purchaseNo = { $regex: search, $options: "i" };
    }
    if (supplierId && mongoose.Types.ObjectId.isValid(supplierId)) {
      query.supplier = supplierId;
    }

    if (isPaginated) {
      const { page, limit, skip } = getPaginationParams(req);
      const [purchases, total] = await Promise.all([
        Purchase.find(query)
          .populate("supplier", "name company")
          .populate("createdBy", "name")
          .populate("items.product", "name sku barcode unit")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Purchase.countDocuments(query),
      ]);
      const paginated = formatPaginatedResponse(purchases, total, page, limit);
      return ApiResponse.success(paginated.data, "Purchases retrieved successfully", paginated.meta);
    } else {
      const purchases = await Purchase.find(query)
        .populate("supplier", "name company")
        .populate("createdBy", "name")
        .populate("items.product", "name sku barcode unit")
        .sort({ createdAt: -1 });
      return ApiResponse.success(purchases);
    }
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}

export async function POST(req: Request) {
  let session = null;
  try {
    const auth = await verifyAuth("purchases:create");
    if (!auth) return ApiResponse.unauthorized();

    const body = await req.json();
    const validatedData = CreatePurchaseSchema.safeParse(body);
    
    if (!validatedData.success) {
      return ApiResponse.error(validatedData.error.issues[0].message, 400);
    }

    await dbConnect();

    const { supplier: supplierId, items, dueAmount } = validatedData.data;

    // Start MongoDB Session for Transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Check Supplier
    const supplier = await Supplier.findById(supplierId).session(session);
    if (!supplier) {
      await session.abortTransaction();
      return ApiResponse.error("Supplier not found", 404);
    }

    // 2. Process Products: Update Stock and Buying Price (WAC)
    for (const item of items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        await session.abortTransaction();
        return ApiResponse.error(`Product with ID ${item.product} not found`, 404);
      }

      // Calculate new Weighted Average Cost
      const oldStock = product.stock || 0;
      const oldWac = product.buyingPrice || 0;
      const newQty = item.quantity;
      const newUnitCost = item.unitCost;

      const totalValueOld = oldStock * oldWac;
      const totalValueNew = newQty * newUnitCost;
      const totalStock = oldStock + newQty;

      const newWac = totalStock > 0 ? (totalValueOld + totalValueNew) / totalStock : 0;

      // Update Product
      product.stock = totalStock;
      product.buyingPrice = Number(newWac.toFixed(2));
      await product.save({ session });
    }

    // 3. Update Supplier Due
    if (dueAmount > 0) {
      supplier.totalDue += dueAmount;
      await supplier.save({ session });
    }

    // 4. Create Purchase Record
    const newPurchase = new Purchase({
      ...validatedData.data,
      createdBy: auth.userId,
      purchaseDate: validatedData.data.purchaseDate ? new Date(validatedData.data.purchaseDate) : new Date(),
    });

    // purchaseNo is auto-generated via pre-validate hook
    await newPurchase.save({ session });

    // 5. Create Activity Log
    await ActivityLog.create([{
      user: auth.userId,
      action: "CREATED",
      entityType: "PURCHASE",
      details: `Created new purchase. Supplier: ${supplier.name}, Total: ${newPurchase.totalAmount}`,
    }], { session });

    // Commit Transaction
    await session.commitTransaction();
    session.endSession();

    // Populate for response
    await newPurchase.populate("supplier", "name company");

    return ApiResponse.success(newPurchase, "Purchase completed successfully", 201);
  } catch (error: unknown) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    return ApiResponse.serverError(error);
  }
}
