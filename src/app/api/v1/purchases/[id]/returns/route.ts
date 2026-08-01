import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import PurchaseReturn from "@/models/PurchaseReturn";
import Purchase from "@/models/Purchase";
import Product from "@/models/Product";
import Supplier from "@/models/Supplier";
import ActivityLog from "@/models/ActivityLog";
import type { IPurchaseReturn } from "@/models/PurchaseReturn";
import { verifyAuth } from "@/lib/auth";
import mongoose from "mongoose";

// Get all returns for a specific purchase
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const session = await verifyAuth("purchases:view");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const returns = await PurchaseReturn.find({ purchase: id })
      .populate("createdBy", "name email")
      .populate("items.product", "name sku")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      history: returns,
    });
  } catch (error: unknown) {
    console.error("Fetch purchase returns error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch returns" },
      { status: 500 }
    );
  }
}

// Add a new return to a purchase
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let dbSession = null;
  try {
    const authSession = await verifyAuth("purchases:return");

    if (!authSession) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;
    const data = await request.json();
    const { items, subTotal, tax, totalAmount, returnDate, note } = data;

    if (!items || !items.length) {
      return NextResponse.json(
        { message: "At least one item is required to return" },
        { status: 400 }
      );
    }

    await dbConnect();
    
    // Start session for transaction
    dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    const purchase = await Purchase.findById(id).session(dbSession);
    if (!purchase) {
      await dbSession.abortTransaction();
      return NextResponse.json(
        { message: "Purchase not found" },
        { status: 404 }
      );
    }

    const supplier = await Supplier.findById(purchase.supplier).session(dbSession);
    if (!supplier) {
      await dbSession.abortTransaction();
      return NextResponse.json(
        { message: "Supplier not found" },
        { status: 404 }
      );
    }

    // 0. Calculate already returned quantities
    const pastReturns = (await PurchaseReturn.find({ purchase: id }).session(dbSession)) as IPurchaseReturn[];
    const returnedQtyMap: Record<string, number> = {};
    pastReturns.forEach((ret) => {
      ret.items.forEach((item) => {
        const prodId = item.product.toString();
        returnedQtyMap[prodId] = (returnedQtyMap[prodId] || 0) + item.quantity;
      });
    });

    // 1. Check and deduct stock
    for (const returnItem of items) {
      const product = await Product.findById(returnItem.product).session(dbSession);
      if (!product) {
        await dbSession.abortTransaction();
        return NextResponse.json(
          { message: `Product ${returnItem.product} not found` },
          { status: 404 }
        );
      }

      // Check if trying to return more than purchased
      const originalItem = purchase.items.find(
        (item) => item.product.toString() === returnItem.product
      );
      if (!originalItem) {
        await dbSession.abortTransaction();
        return NextResponse.json(
          { message: `Product ${product.name} was not part of this purchase.` },
          { status: 400 }
        );
      }

      const alreadyReturned = returnedQtyMap[returnItem.product] || 0;
      const maxAllowed = originalItem.quantity - alreadyReturned;

      if (returnItem.quantity > maxAllowed) {
        await dbSession.abortTransaction();
        return NextResponse.json(
          { message: `Cannot return ${returnItem.quantity} of ${product.name}. You can only return up to ${maxAllowed}.` },
          { status: 400 }
        );
      }
      
      if (product.stock < returnItem.quantity) {
        await dbSession.abortTransaction();
        return NextResponse.json(
          { message: `Cannot return ${returnItem.quantity} of ${product.name}. Current stock is only ${product.stock}.` },
          { status: 400 }
        );
      }

      // Deduct stock (buyingPrice/WAC remains unchanged during a return)
      product.stock -= returnItem.quantity;
      await product.save({ session: dbSession });
    }

    // 2. Adjust Supplier Balance
    supplier.totalDue -= totalAmount;
    await supplier.save({ session: dbSession });

    // 3. Update Purchase amounts
    purchase.returnedAmount = (purchase.returnedAmount || 0) + totalAmount;
    
    // Adjust due amount if there is still a due.
    if (purchase.dueAmount > 0) {
      if (purchase.dueAmount >= totalAmount) {
        purchase.dueAmount -= totalAmount;
      } else {
        purchase.dueAmount = 0;
      }
      
      // Re-evaluate payment status
      if (purchase.dueAmount === 0 && purchase.paidAmount > 0) {
        purchase.paymentStatus = "PAID";
      } else if (purchase.paidAmount > 0) {
        purchase.paymentStatus = "PARTIAL";
      } else if (purchase.dueAmount === 0 && purchase.paidAmount === 0) {
        // Edge case: fully returned without any payment
        purchase.paymentStatus = "PAID"; 
      }
    }

    await purchase.save({ session: dbSession });

    // 4. Create PurchaseReturn record
    const purchaseReturn = new PurchaseReturn({
      purchase: id,
      supplier: purchase.supplier,
      items,
      subTotal,
      tax: tax || 0,
      totalAmount,
      returnDate: returnDate || new Date(),
      note,
      createdBy: authSession.userId,
    });
    
    await purchaseReturn.save({ session: dbSession });

    // 5. Log activity
    await ActivityLog.create([{
      user: authSession.userId,
      action: "RETURNED",
      entityType: "PURCHASE",
      details: `Returned items for Purchase ${purchase.purchaseNo}. Total: ${totalAmount}`,
    }], { session: dbSession });

    await dbSession.commitTransaction();
    dbSession.endSession();

    return NextResponse.json(
      {
        success: true,
        data: purchaseReturn,
        message: "Purchase return has been processed successfully.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (dbSession) {
      await dbSession.abortTransaction();
      dbSession.endSession();
    }
    console.error("Process purchase return error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to process return" },
      { status: 500 }
    );
  }
}
