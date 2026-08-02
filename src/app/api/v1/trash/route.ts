import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // categories, suppliers, products, users

    let data = [];
    switch (type) {
      case "categories":
        data = await Category.find({ isDeleted: true }).sort({ updatedAt: -1 });
        break;
      case "suppliers":
        data = await Supplier.find({ isDeleted: true }).sort({ updatedAt: -1 });
        break;
      case "products":
        data = await Product.find({ isDeleted: true }).sort({ updatedAt: -1 });
        break;
      case "users":
        data = await User.find({ isDeleted: true }).select("-password").sort({ updatedAt: -1 });
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: unknown) {
    console.error("Trash GET Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
