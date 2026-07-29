import AddSaleClient from "@/components/dashboard/pages/super-admin/sales/AddSaleClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Sale / POS | Raantech",
  description: "Create a new sale order or POS transaction.",
};

export default function AddSalePage() {
  return <AddSaleClient />;
}
