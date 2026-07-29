import { NextRequest } from "next/server";
import { verifyAuth } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Purchase from "@/models/Purchase";
import { PurchasePayment } from "@/models/PurchasePayment";
import { ApiResponse } from "@/lib/apiResponse";
import mongoose from "mongoose";

// GET /api/v1/purchases/:id/payments
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifyAuth("purchases:view");
    if (!session) {
      return ApiResponse.unauthorized();
    }

    const resolvedParams = await params;

    await dbConnect();
    const payments = await PurchasePayment.find({ purchase: resolvedParams.id })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    return ApiResponse.success(
      { history: payments },
      "Purchase payment history retrieved successfully"
    );
  } catch (error) {
    console.error("Error fetching purchase payments:", error);
    return ApiResponse.serverError("Internal server error");
  }
}

// POST /api/v1/purchases/:id/payments
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifyAuth("purchases:create");
  if (!session) {
    return ApiResponse.unauthorized();
  }

  await dbConnect();
  
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();

  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { amount, paymentMethod, paymentDate, note } = body;

    if (!amount || amount <= 0) {
      return ApiResponse.error("Valid amount is required", 400);
    }

    const purchase = await Purchase.findById(resolvedParams.id).session(dbSession);
    if (!purchase) {
      await dbSession.abortTransaction();
      return ApiResponse.error("Purchase not found", 404);
    }

    if (amount > purchase.dueAmount) {
      await dbSession.abortTransaction();
      return ApiResponse.error("Payment amount cannot exceed due amount", 400);
    }

    // Create payment record
    const payment = await PurchasePayment.create(
      [
        {
          purchase: resolvedParams.id,
          amount,
          paymentMethod,
          paymentDate: paymentDate || new Date(),
          note,
          createdBy: session.userId,
        },
      ],
      { session: dbSession }
    );

    // Update purchase amounts
    purchase.paidAmount += amount;
    purchase.dueAmount -= amount;

    // Update payment status
    if (purchase.dueAmount === 0) {
      purchase.paymentStatus = "PAID";
    } else {
      purchase.paymentStatus = "PARTIAL";
    }

    await purchase.save({ session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return ApiResponse.success(
      payment[0],
      "Payment has been added successfully and the purchase balance has been updated.",
      null,
      201
    );
  } catch (error) {
    await dbSession.abortTransaction();
    dbSession.endSession();
    console.error("Error creating purchase payment:", error);
    return ApiResponse.serverError("Internal server error");
  }
}
