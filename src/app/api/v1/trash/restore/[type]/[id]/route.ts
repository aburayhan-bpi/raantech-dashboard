import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { type, id } = resolvedParams;

    let restoredDoc = null;
    switch (type) {
      case "categories":
        restoredDoc = await Category.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
        break;
      case "suppliers":
        restoredDoc = await Supplier.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
        break;
      case "products":
        restoredDoc = await Product.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
        break;
      case "users":
        restoredDoc = await User.findByIdAndUpdate(id, { isDeleted: false, status: 'ACTIVE' }, { new: true });
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    if (!restoredDoc) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item restored successfully" });
  } catch (error: unknown) {
    console.error("Trash Restore Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
