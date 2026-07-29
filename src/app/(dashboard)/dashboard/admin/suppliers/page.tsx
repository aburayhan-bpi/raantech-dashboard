import SuppliersClient from "@/components/dashboard/pages/super-admin/suppliers/SuppliersClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Suppliers | Super Admin Dashboard",
  description: "Manage product suppliers and their balances",
};

export default function SuppliersPage() {
  return <SuppliersClient />;
}
