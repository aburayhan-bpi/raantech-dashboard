import dbConnect from "@/lib/mongoose";
import Purchase from "@/models/Purchase";
import { verifyAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/apiResponse";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth("purchases:view");
    if (!auth) return ApiResponse.unauthorized();

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ApiResponse.error("Invalid purchase ID", 400);
    }

    const purchase = await Purchase.findById(id)
      .populate("supplier", "name company phone email address totalDue")
      .populate("items.product", "name sku barcode unit")
      .populate("createdBy", "name");

    if (!purchase) {
      return ApiResponse.error("Purchase not found", 404);
    }

    return ApiResponse.success(purchase);
  } catch (error: unknown) {
    return ApiResponse.serverError(error);
  }
}
