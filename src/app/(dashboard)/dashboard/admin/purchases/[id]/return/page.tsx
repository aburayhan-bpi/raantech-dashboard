import ReturnPurchaseClient from "@/components/dashboard/pages/super-admin/purchases/ReturnPurchaseClient";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Return Purchase | Dashboard",
  description: "Return a purchase to the supplier",
};

export default function ReturnPurchasePage() {
  return <ReturnPurchaseClient />;
}
