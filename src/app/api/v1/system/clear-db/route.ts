import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { verifyAuth } from "@/lib/auth";

// Models to clear
import Category from "@/models/Category";
import Customer from "@/models/Customer";
import Expense from "@/models/Expense";
import Otp from "@/models/Otp";
import Product from "@/models/Product";
import Purchase from "@/models/Purchase";
import { PurchasePayment } from "@/models/PurchasePayment";
import PurchaseReturn from "@/models/PurchaseReturn";
import ResetToken from "@/models/ResetToken";
import Sale from "@/models/Sale";
import SalePayment from "@/models/SalePayment";
import SaleRefund from "@/models/SaleRefund";
import Supplier from "@/models/Supplier";

export async function DELETE() {
  try {
    await dbConnect();
    
    // Only super admins should be able to do this
    const session = await verifyAuth();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Delete all data except Users and ActivityLog
    await Promise.all([
      Category.deleteMany({}),
      Customer.deleteMany({}),
      Expense.deleteMany({}),
      Otp.deleteMany({}),
      Product.deleteMany({}),
      Purchase.deleteMany({}),
      PurchasePayment.deleteMany({}),
      PurchaseReturn.deleteMany({}),
      ResetToken.deleteMany({}),
      Sale.deleteMany({}),
      SalePayment.deleteMany({}),
      SaleRefund.deleteMany({}),
      Supplier.deleteMany({})
    ]);

    return NextResponse.json({
      success: true,
      message: "Database cleared successfully (Users and Activity logs preserved)."
    });

  } catch (error: unknown) {
    console.error("Failed to clear database:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to clear database" },
      { status: 500 }
    );
  }
}
