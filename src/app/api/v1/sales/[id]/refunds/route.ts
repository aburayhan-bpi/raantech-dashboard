import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import SaleRefund from "@/models/SaleRefund";
import Sale from "@/models/Sale";
import { verifyAuth } from "@/lib/auth";
import { sendTemplateEmail } from "@/lib/email";

// Get all refunds for a specific sale
export async function GET(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:view");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const refunds = await SaleRefund.find({ sale: id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: {
        history: refunds,
      },
    });
  } catch (error: unknown) {
    console.error("Fetch sale refunds error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch refunds" },
      { status: 500 }
    );
  }
}

// Add a new refund to a sale
export async function POST(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:refund");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();
    const { amount, refundMethod, refundDate, note } = data;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Valid amount is required" },
        { status: 400 }
      );
    }

    const sale = await Sale.findById(id).populate("customer");
    if (!sale) {
      return NextResponse.json(
        { message: "Sale/Order not found" },
        { status: 404 }
      );
    }

    const totalRefundable = sale.paidAmount - sale.totalAmount - (sale.refundedAmount || 0);

    if (totalRefundable <= 0) {
      return NextResponse.json(
        { message: "No refund is due for this order." },
        { status: 400 }
      );
    }

    if (amount > totalRefundable) {
      return NextResponse.json(
        {
          message: `Refund amount (${amount}) cannot be greater than the refundable amount (${totalRefundable})`,
        },
        { status: 400 }
      );
    }

    // Create refund record
    const refund = await SaleRefund.create({
      sale: id,
      amount,
      refundMethod,
      refundDate: refundDate || new Date(),
      note,
      createdBy: session.userId,
    });

    // Update sale balances
    const newRefundedAmount = (sale.refundedAmount || 0) + amount;
    
    let newPaymentStatus = sale.paymentStatus;
    const overpayment = sale.paidAmount - sale.totalAmount;
    
    if (newRefundedAmount >= sale.paidAmount) {
      newPaymentStatus = "REFUNDED";
    } else if (newRefundedAmount >= overpayment) {
      newPaymentStatus = "PAID";
    }

    await Sale.findByIdAndUpdate(id, {
      refundedAmount: newRefundedAmount,
      paymentStatus: newPaymentStatus,
    });

    // Send email
    if (sale.customer?.email) {
      await sendTemplateEmail(
        "sale-refund",
        {
          customerName: sale.customer.name,
          saleNo: sale.saleNo,
          refundAmount: amount,
          refundMethod,
          note,
          totalPaid: sale.paidAmount,
          totalRefundedSoFar: newRefundedAmount,
          remainingRefundDue: Math.max(0, sale.paidAmount - sale.totalAmount - newRefundedAmount)
        },
        sale.customer.email,
        `Refund Processed - Order #${sale.saleNo}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: refund,
        message: "Refund has been processed successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Process sale refund error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to process refund" },
      { status: 500 }
    );
  }
}
