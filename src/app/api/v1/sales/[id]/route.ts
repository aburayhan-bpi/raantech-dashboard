import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { verifyAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getOrderStatusEmailTemplate } from "@/lib/emailTemplates";

// Ensure Customer schema is registered for populate
void Customer;

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

    const sale = await Sale.findById(id)
      .populate("customer")
      .populate("items.product")
      .populate("createdBy", "name email role")
      .populate("statusHistory.updatedBy", "name");

    if (!sale) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sale,
    });
  } catch (error: unknown) {
    console.error("Fetch sale details error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:update");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();

    const sale = await Sale.findById(id);

    if (!sale) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    let shouldSendStatusEmail = false;
    const oldStatus = sale.status;

    // Only allow updating specific safe fields
    if (data.status) {
      if ((oldStatus === "DELIVERED" || oldStatus === "COMPLETED") && data.status === "CANCELLED") {
        return NextResponse.json(
          { message: "Cannot cancel an order that has already been delivered or completed. Please initiate a return instead." },
          { status: 400 }
        );
      }
      
      sale.status = data.status;
      if (oldStatus !== data.status && ["SHIPPED", "COMPLETED", "DELIVERED", "CANCELLED"].includes(data.status)) {
        shouldSendStatusEmail = true;
      }

      // Phase 1 & 2: Stock Restoration on Cancel or Return
      if (
        (oldStatus !== "CANCELLED" && data.status === "CANCELLED") || 
        (oldStatus !== "RETURNED" && data.status === "RETURNED")
      ) {
        for (const item of sale.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
        // Phase 3: Real-World Refund Handling
        // We do NOT instantly refund the paidAmount. Instead we set the paymentStatus to REFUND_DUE if they are owed money.
        if (sale.paidAmount > 0 && (sale.refundedAmount || 0) < sale.paidAmount) {
          sale.paymentStatus = "REFUND_DUE";
        } else if (sale.paidAmount === 0) {
          sale.paymentStatus = "CANCELLED";
        }
      }
    }
    if (data.courierDetails !== undefined) sale.courierDetails = data.courierDetails;
    
    // Status History tracking
    let isStatusOrNoteChanged = false;
    if (data.status && data.status !== oldStatus) {
      isStatusOrNoteChanged = true;
    }
    if (data.note !== undefined && data.note !== sale.note) {
      sale.note = data.note;
      isStatusOrNoteChanged = true;
    }

    if (isStatusOrNoteChanged) {
      sale.statusHistory = sale.statusHistory || [];
      sale.statusHistory.push({
        status: sale.status,
        note: data.note || sale.note,
        updatedBy: session.userId,
        date: new Date(),
      });
    }

    // Handle payments if provided
    if (data.paymentAmount && data.paymentMethod) {
      const amount = Number(data.paymentAmount);
      if (amount > sale.dueAmount) {
        return NextResponse.json(
          { message: `Payment amount cannot exceed the due amount of ৳${sale.dueAmount}` },
          { status: 400 }
        );
      }
      if (amount > 0) {
        sale.paidAmount += amount;
        sale.dueAmount -= amount;
        
        if (sale.dueAmount <= 0) {
          sale.paymentStatus = "PAID";
        } else {
          sale.paymentStatus = "PARTIAL";
        }
      }
    }

    await sale.save();

    if (shouldSendStatusEmail) {
      const populatedSale = await Sale.findById(sale._id).populate("customer");
      if (populatedSale?.customer?.email) {
        const subject = data.status === "SHIPPED" 
          ? `Your Order #${populatedSale.saleNo} has been Shipped!` 
          : data.status === "CANCELLED"
            ? `Order Cancelled #${populatedSale.saleNo}`
            : `Order Delivered #${populatedSale.saleNo}`;
            
        const emailHtml = getOrderStatusEmailTemplate(populatedSale, data.status);
        try {
          await sendEmail({
            to: populatedSale.customer.email,
            subject,
            html: emailHtml,
          });
        } catch (err) {
          console.error("Failed to send status update email:", err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: sale,
    });
  } catch (error: unknown) {
    console.error("Update sale error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to update order" },
      { status: 500 }
    );
  }
}
