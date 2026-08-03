import { verifyAuth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { getOrderCreatedEmailTemplate } from "@/lib/emailTemplates";
import dbConnect from "@/lib/mongoose";
import Customer from "@/models/Customer";
import Product from "@/models/Product";
import Sale from "@/models/Sale";
import SalePayment from "@/models/SalePayment";
import {
  formatPaginatedResponse,
  getPaginationParams,
} from "@/utils/backendPagination";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:view");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { page, limit, skip } = getPaginationParams(request);
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");
    const customerId = searchParams.get("customer");

    // Pipeline to join customer and allow searching by customer name/phone
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pipeline: any[] = [
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { saleNo: { $regex: search, $options: "i" } },
            { "customerData.name": { $regex: search, $options: "i" } },
            { "customerData.phone": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    if (status) {
      pipeline.push({ $match: { status } });
    }

    if (customerId) {
      pipeline.push({
        $match: { customer: new mongoose.Types.ObjectId(customerId) },
      });
    }

    if (paymentStatus) {
      pipeline.push({ $match: { paymentStatus } });
    }

    // Get total count for pagination
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Sale.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Fetch paginated data
    pipeline = [
      ...pipeline,
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const sales = await Sale.aggregate(pipeline);

    // Populate createdBy
    await Sale.populate(sales, {
      path: "createdBy",
      select: "name email role",
    });
    await Sale.populate(sales, {
      path: "items.product",
      select: "name sku image",
    });

    // Format output to match Mongoose populate structure
    const formattedSales = sales.map((sale) => {
      const { _id, customerData, ...rest } = sale;
      if (customerData) {
        customerData.id = customerData._id;
        delete customerData._id;
        delete customerData.__v;
      }
      return {
        ...rest,
        id: _id.toString(),
        customer: customerData,
      };
    });

    return NextResponse.json(
      formatPaginatedResponse(formattedSales, total, page, limit),
    );
  } catch (error: unknown) {
    console.error("Fetch sales error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to fetch sales",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const session = await verifyAuth("sales:create");

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      customer: customerInfo,
      items,
      subTotal,
      discount,
      tax,
      shippingCharge,
      totalAmount,
      paidAmount,
      paymentMethod,
      courierDetails,
      note,
    } = data;

    if (!customerInfo || !items || !items.length) {
      return NextResponse.json(
        { message: "Customer and items are required" },
        { status: 400 },
      );
    }

    // 1. Process Customer (Find or Create)
    let customerId;
    let existingCustomer = null;

    if (customerInfo._id) {
      existingCustomer = await Customer.findById(customerInfo._id);
    } else if (customerInfo.phone) {
      existingCustomer = await Customer.findOne({ phone: customerInfo.phone });
    } else {
      return NextResponse.json(
        { message: "Customer phone or ID is required to create an order" },
        { status: 400 },
      );
    }

    if (existingCustomer) {
      customerId = existingCustomer._id;
      // Update customer details if provided
      let needsUpdate = false;
      if (customerInfo.name && existingCustomer.name !== customerInfo.name) {
        existingCustomer.name = customerInfo.name;
        needsUpdate = true;
      }
      if (customerInfo.email && existingCustomer.email !== customerInfo.email) {
        existingCustomer.email = customerInfo.email;
        needsUpdate = true;
      }
      if (
        customerInfo.address &&
        existingCustomer.address !== customerInfo.address
      ) {
        existingCustomer.address = customerInfo.address;
        needsUpdate = true;
      }
      if (needsUpdate) {
        await existingCustomer.save();
      }
    } else if (customerInfo.phone) {
      // Create new customer
      const newCustomer = await Customer.create({
        name: customerInfo.name,
        phone: customerInfo.phone,
        email: customerInfo.email || undefined,
        address: customerInfo.address || undefined,
      });
      customerId = newCustomer._id;
    } else {
      return NextResponse.json(
        { message: "Customer phone is required to create a new customer" },
        { status: 400 },
      );
    }

    // 2. Validate Stock and Update Product Quantities
    // This needs a transaction, but we'll do it sequentially for simplicity if replica set is not guaranteed
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // Stock logic: In an e-commerce setup, stock decreases on sale.
      // Make sure product has enough stock (or allow negative if drop-shipping, but usually check)
      if ((product.stock || 0) < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      // Decrease stock
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 3. Determine Payment Status
    const dueAmount = totalAmount - paidAmount;
    let paymentStatus = "DUE";
    if (paidAmount >= totalAmount) {
      paymentStatus = "PAID";
    } else if (paidAmount > 0) {
      paymentStatus = "PARTIAL";
    }

    // 4. Create Sale Record
    const sale = await Sale.create({
      customer: customerId,
      items,
      subTotal,
      discount: discount || 0,
      tax: tax || 0,
      shippingCharge: shippingCharge || 0,
      totalAmount,
      paidAmount: paidAmount || 0,
      dueAmount,
      paymentStatus,
      paymentMethod,
      courierDetails,
      note,
      createdBy: session.userId,
      status: "PENDING",
    });

    // 5. Update Customer Total Purchases
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalPurchases: 1 },
    });

    // 6. Create Initial Payment Record if paid amount > 0
    if (paidAmount > 0) {
      await SalePayment.create({
        sale: sale._id,
        amount: paidAmount,
        paymentMethod,
        paymentDate: new Date(),
        note: "Initial advance/payment during order creation",
        createdBy: session.userId,
      });
    }

    // Return populated sale
    const populatedSale = await Sale.findById(sale._id)
      .populate("customer")
      .populate("items.product")
      .populate("createdBy", "name email");

      // Send order confirmation email and await it so Next.js doesn't kill the process early
      if (populatedSale?.customer?.email) {
        const emailHtml = getOrderCreatedEmailTemplate(populatedSale);
        try {
          await sendEmail({
            to: populatedSale.customer.email,
            subject: `Order Confirmation #${populatedSale.saleNo} - Raantech`,
            html: emailHtml,
          });
        } catch (err) {
          console.error("Failed to send order creation email:", err);
        }
      }

    return NextResponse.json(
      {
        success: true,
        data: populatedSale,
        message: "Order created successfully",
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    );
  }
}
