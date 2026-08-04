import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Sale from "@/models/Sale";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import SalePayment from "@/models/SalePayment";
import SaleRefund from "@/models/SaleRefund";
import { verifyAuth } from "@/lib/auth";

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    
    // Only SUPER_ADMIN can bulk delete
    const session = await verifyAuth();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { message: "No sale IDs provided for deletion" },
        { status: 400 }
      );
    }

    const sales = await Sale.find({ _id: { $in: ids } });

    for (const sale of sales) {
      // Restore stock if the order wasn't already cancelled or returned
      if (sale.status !== "CANCELLED" && sale.status !== "RETURNED") {
        for (const item of sale.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }

      // Decrement customer totalPurchases
      if (sale.customer) {
        await Customer.findByIdAndUpdate(sale.customer, {
          $inc: { totalPurchases: -1 },
        });
      }

      // Delete associated payments and refunds
      await SalePayment.deleteMany({ sale: sale._id });
      await SaleRefund.deleteMany({ sale: sale._id });
    }

    // Soft delete all the sales
    await Sale.updateMany(
      { _id: { $in: ids } },
      { $set: { isDeleted: true } }
    );

    return NextResponse.json({
      success: true,
      message: `${sales.length} orders deleted successfully`,
    });

  } catch (error: unknown) {
    console.error("Bulk delete sales error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to bulk delete orders" },
      { status: 500 }
    );
  }
}
