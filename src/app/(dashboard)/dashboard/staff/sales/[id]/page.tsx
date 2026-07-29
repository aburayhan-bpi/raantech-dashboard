import { Metadata } from "next";
import SaleDetailsClient from "@/components/dashboard/pages/super-admin/sales/SaleDetailsClient";

export const metadata: Metadata = {
  title: "Order Details | Raantech",
  description: "View and manage order details.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SaleDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  
  return <SaleDetailsClient saleId={resolvedParams.id} />;
}
