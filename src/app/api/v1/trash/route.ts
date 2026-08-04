import dbConnect from "@/lib/mongoose";
import Category from "@/models/Category";
import Supplier from "@/models/Supplier";
import Product from "@/models/Product";
import User from "@/models/User";
import Sale from "@/models/Sale";
import { verifyAuth } from "@/lib/auth";
import { ApiResponse } from "@/lib/apiResponse";
import { getPaginationParams } from "@/utils/backendPagination";

export async function GET(req: Request) {
  try {
    const auth = await verifyAuth();
    if (!auth || auth.role !== "SUPER_ADMIN") {
      return ApiResponse.unauthorized("Forbidden");
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // categories, suppliers, products, users
    const search = searchParams.get("search");
    
    const { page, limit, skip } = getPaginationParams(req);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { isDeleted: true };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let Model: any;
    
    switch (type) {
      case "categories":
        Model = Category;
        if (search) {
          query.$or = [{ name: { $regex: search, $options: "i" } }];
        }
        break;
      case "suppliers":
        Model = Supplier;
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } }
          ];
        }
        break;
      case "products":
        Model = Product;
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { sku: { $regex: search, $options: "i" } }
          ];
        }
        break;
      case "users":
        Model = User;
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ];
        }
        break;
      case "sales":
        Model = Sale;
        if (search) {
          query.$or = [
            { saleNo: { $regex: search, $options: "i" } }
          ];
        }
        break;
      default:
        return ApiResponse.error("Invalid type", 400);
    }

    let mongooseQuery = Model.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit);
    if (type === "users") {
      mongooseQuery = mongooseQuery.select("-password");
    }
    
    const [data, total] = await Promise.all([
      mongooseQuery,
      Model.countDocuments(query)
    ]);

    return ApiResponse.success(data, "Trash items retrieved successfully", {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit)
    });
  } catch (error: unknown) {
    console.error("Trash GET Error:", error);
    return ApiResponse.serverError("Internal Server Error");
  }
}
