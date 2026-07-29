import ProductsClient from "@/components/dashboard/pages/super-admin/products/ProductsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products Management | Raantech",
  description: "Manage your inventory, prices, and product details.",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
