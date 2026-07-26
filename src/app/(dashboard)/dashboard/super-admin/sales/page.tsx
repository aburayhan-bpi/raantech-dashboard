import { Metadata } from "next";
import SalesClient from "@/components/dashboard/pages/super-admin/sales/SalesClient";

export const metadata: Metadata = {
  title: "Sales & Orders | Raantech",
  description: "Manage sales, orders, and POS transactions.",
};

export default function SalesPage() {
  return <SalesClient />;
}