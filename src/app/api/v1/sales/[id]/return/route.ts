import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import { verifyAuth } from "@/lib/auth";

export async function POST(
  request: Request,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { params }: { params: any }
) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:return");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { returnItems } = await request.json(); // [{ productId, returnQuantity }]

    if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) {
      return NextResponse.json({ message: "No items provided for return" }, { status: 400 });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (sale.status !== "COMPLETED" && sale.status !== "DELIVERED") {
      return NextResponse.json({ message: "Only completed/delivered orders can be partially returned" }, { status: 400 });
    }

    let refundValue = 0;

    // Process each returned item
    for (const returnItem of returnItems) {
      const saleItem = sale.items.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.product.toString() === returnItem.productId
      );

      if (!saleItem) continue;

      const returnQty = Number(returnItem.returnQuantity);
      if (returnQty > 0 && returnQty <= saleItem.quantity) {
        // Decrease sale item quantity
        saleItem.quantity -= returnQty;
        
        // Decrease total for this item
        const itemRefund = returnQty * saleItem.unitPrice;
        saleItem.total -= itemRefund;
        
        // Add to total refund value for the whole order
        refundValue += itemRefund;

        // Restore product stock
        await Product.findByIdAndUpdate(saleItem.product, {
          $inc: { stock: returnQty }
        });
      }
    }

    if (refundValue > 0) {
      // Update financial totals
      sale.subTotal -= refundValue;
      sale.totalAmount -= refundValue;

      // Filter out items that have 0 quantity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sale.items = sale.items.filter((item: any) => item.quantity > 0);

      // Recalculate payment status and due/refunded amounts
      if (sale.paidAmount > sale.totalAmount) {
        // We owe the customer a refund
        const newRefund = sale.paidAmount - sale.totalAmount;
        sale.refundedAmount = (sale.refundedAmount || 0) + newRefund;
        sale.paidAmount = sale.totalAmount;
        sale.dueAmount = 0;
        sale.paymentStatus = sale.paidAmount > 0 ? "PAID" : "DUE";
      } else {
        // We just reduce their due amount
        sale.dueAmount = sale.totalAmount - sale.paidAmount;
        if (sale.dueAmount <= 0) {
          sale.paymentStatus = "PAID";
        } else if (sale.paidAmount > 0) {
          sale.paymentStatus = "PARTIAL";
        } else {
          sale.paymentStatus = "DUE";
        }
      }

      // If all items are returned, change status to RETURNED
      if (sale.items.length === 0) {
        sale.status = "RETURNED";
      }

      await sale.save();
    }

    return NextResponse.json({
      success: true,
      message: "Partial return processed successfully",
      data: sale,
    });
  } catch (error: unknown) {
    console.error("Partial return error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to process partial return" },
      { status: 500 }
    );
  }
}
