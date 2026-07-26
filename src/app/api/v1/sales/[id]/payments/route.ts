import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import SalePayment from "@/models/SalePayment";
import Sale from "@/models/Sale";
import { verifyAuth } from "@/lib/auth";

// Get all payments for a specific sale
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

    const payments = await SalePayment.find({ sale: id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      history: payments,
    });
  } catch (error: unknown) {
    console.error("Fetch sale payments error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

// Add a new payment to a sale
export async function POST(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:create");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();
    const { amount, paymentMethod, paymentDate, note } = data;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Valid amount is required" },
        { status: 400 }
      );
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json(
        { message: "Sale/Order not found" },
        { status: 404 }
      );
    }

    if (sale.dueAmount <= 0) {
      return NextResponse.json(
        { message: "Order is already fully paid" },
        { status: 400 }
      );
    }

    if (amount > sale.dueAmount) {
      return NextResponse.json(
        {
          message: `Payment amount (${amount}) cannot be greater than due amount (${sale.dueAmount})`,
        },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await SalePayment.create({
      sale: id,
      amount,
      paymentMethod,
      paymentDate: paymentDate || new Date(),
      note,
      createdBy: session.userId,
    });

    // Update sale balances
    const newPaidAmount = sale.paidAmount + amount;
    const newDueAmount = sale.totalAmount - newPaidAmount;
    
    let newPaymentStatus = "DUE";
    if (newPaidAmount >= sale.totalAmount) {
      newPaymentStatus = "PAID";
    } else if (newPaidAmount > 0) {
      newPaymentStatus = "PARTIAL";
    }

    await Sale.findByIdAndUpdate(id, {
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
      paymentStatus: newPaymentStatus,
    });

    return NextResponse.json(
      {
        success: true,
        data: payment,
        message: "Payment has been added successfully and the order balance has been updated.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Add sale payment error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to add payment" },
      { status: 500 }
    );
  }
}
