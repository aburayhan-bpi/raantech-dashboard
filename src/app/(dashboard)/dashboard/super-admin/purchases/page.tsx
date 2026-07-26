import PurchasesClient from "@/components/dashboard/pages/super-admin/purchases/PurchasesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purchases | Super Admin Dashboard",
  description: "Manage product purchases and supplier payments",
};

export default function PurchasesPage() {
  return <PurchasesClient />;
}
