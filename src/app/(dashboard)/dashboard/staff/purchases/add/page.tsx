import AddPurchaseClient from "@/components/dashboard/pages/super-admin/purchases/AddPurchaseClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Purchase | Super Admin Dashboard",
  description: "Create a new product purchase",
};

export default function AddPurchasePage() {
  return <AddPurchaseClient />;
}
