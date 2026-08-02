import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return NextResponse.json({ message: "Forbidden: Only Super Admin can hard delete" }, { status: 403 });
    }

    await dbConnect();
    const resolvedParams = await params;
    const { type, id } = resolvedParams;

    let deletedDoc = null;
    switch (type) {
      case "categories":
        deletedDoc = await Category.findByIdAndDelete(id);
        break;
      case "suppliers":
        deletedDoc = await Supplier.findByIdAndDelete(id);
        break;
      case "products":
        deletedDoc = await Product.findByIdAndDelete(id);
        break;
      case "users":
        deletedDoc = await User.findByIdAndDelete(id);
        break;
      default:
        return NextResponse.json({ message: "Invalid type" }, { status: 400 });
    }

    if (!deletedDoc) {
      return NextResponse.json({ message: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Item permanently deleted" });
  } catch (error: unknown) {
    console.error("Trash Hard Delete Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
