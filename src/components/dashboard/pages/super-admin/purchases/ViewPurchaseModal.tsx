"use client";

import { IPurchase } from "@/redux/api/purchase/purchaseApi";
import { formatStatusText } from "@/utils/formatStatusText";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  DollarSign,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { PurchaseInvoicePDF } from "./PurchaseInvoicePDF";
import PurchasePaymentModal from "./PurchasePaymentModal";

interface ViewPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: IPurchase | null;
}

export default function ViewPurchaseModal({
  isOpen,
  onClose,
  purchase,
}: ViewPurchaseModalProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!componentRef.current || !purchase) return;
    setIsDownloading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <PurchaseInvoicePDF purchase={purchase} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Purchase_Invoice_${purchase?.purchaseNo || "draft"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen || !purchase) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 print:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Modal / Invoice Container */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:max-h-none print:h-auto print:rounded-none">
        {/* Header - Hidden in Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 gap-4 print:hidden">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h2 className="text-xl font-bold text-slate-800">Purchase Invoice</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors sm:hidden -mr-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              Manage Payments
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs sm:text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30">
          <div
            ref={componentRef}
            className="max-w-3xl mx-auto space-y-8 bg-white p-8 md:p-10 border border-slate-100 shadow-sm rounded-xl print:shadow-none print:border-none print:p-0 print:m-0"
          >
            {/* Invoice Header */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8 print:pb-4">
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  INVOICE
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Purchase No:{" "}
                  <span className="text-slate-700">{purchase.purchaseNo}</span>
                </p>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-2">
                  <Calendar className="w-4 h-4" />
                  {purchase.purchaseDate
                    ? format(new Date(purchase.purchaseDate), "dd MMMM, yyyy")
                    : format(new Date(purchase.createdAt), "dd MMMM, yyyy")}
                </div>
              </div>

              <div className="text-left md:text-right space-y-1">
                <div className="flex justify-start md:justify-end mb-4">
                  <Image
                    src="/brand-logo.svg"
                    alt="Raantech BD"
                    width={180}
                    height={48}
                    className="w-auto h-16 object-contain"
                  />
                </div>
                <p className="text-sm text-slate-500">
                  Rampura, Dhaka, Bangladesh
                </p>
                <p className="text-sm text-slate-500">raantechbd@gmail.com</p>
                <p className="text-sm text-slate-500">+880 135 037 9555</p>
                <p className="text-sm text-slate-500">+880 160 560 0997</p>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Supplier Details
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:border-none print:p-0 print:bg-transparent">
                  <p className="text-lg font-bold text-slate-800">
                    {purchase.supplier?.name || "N/A"}
                  </p>
                  {purchase.supplier?.company && (
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {purchase.supplier.company}
                    </p>
                  )}
                  {purchase.supplier?.phone && (
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {purchase.supplier.phone}
                    </p>
                  )}
                  {purchase.supplier?.email && (
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {purchase.supplier.email}
                    </p>
                  )}
                  {purchase.supplier?.address && (
                    <p className="text-sm text-slate-600 flex items-start gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      {purchase.supplier.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                  Payment Details
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 print:border-none print:p-0 print:bg-transparent">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Payment Status:</span>
                    <span
                      className={`font-bold  ${
                        purchase.paymentStatus === "PAID"
                          ? "text-emerald-600"
                          : purchase.paymentStatus === "PARTIAL"
                            ? "text-amber-600"
                            : "text-rose-600"
                      }`}
                    >
                      {formatStatusText(purchase.paymentStatus || "N/A")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-medium text-slate-700 capitalize">
                      {formatStatusText(purchase.paymentMethod || "N/A")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Order Status:</span>
                    <span className="font-medium text-slate-700">
                      {formatStatusText(purchase.status || "N/A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mt-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-3 text-sm font-bold text-slate-800">
                      Item Description
                    </th>
                    <th className="py-3 text-sm font-bold text-slate-800 text-center w-24">
                      Qty
                    </th>
                    <th className="py-3 text-sm font-bold text-slate-800 text-right w-32">
                      Unit Price
                    </th>
                    <th className="py-3 text-sm font-bold text-slate-800 text-right w-32">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchase.items?.map(
                    (
                      item: {
                        product: { name: string; sku?: string; unit: string };
                        quantity: number;
                        unitCost: number;
                        total: number;
                      },
                      index: number,
                    ) => (
                      <tr key={index}>
                        <td className="py-4">
                          <p className="font-medium text-slate-800 flex items-center gap-2">
                            <Package className="w-4 h-4 text-slate-400" />
                            {item.product?.name || "Unknown Product"}
                          </p>
                          {item.product?.sku && (
                            <p className="text-xs text-slate-500 mt-1 pl-6">
                              SKU: {item.product.sku}
                            </p>
                          )}
                        </td>
                        <td className="py-4 text-center text-sm text-slate-700">
                          {item.quantity} {item.product?.unit || ""}
                        </td>
                        <td className="py-4 text-right text-sm text-slate-700">
                          ৳ {item.unitCost.toLocaleString()}
                        </td>
                        <td className="py-4 text-right text-sm font-medium text-slate-800">
                          ৳ {item.total.toLocaleString()}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="flex justify-end pt-4">
              <div className="w-full max-w-sm space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal:</span>
                  <span className="font-medium text-slate-700">
                    ৳ {purchase.subTotal.toLocaleString()}
                  </span>
                </div>
                {purchase.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount:</span>
                    <span className="font-medium text-rose-500">
                      - ৳ {purchase.discount.toLocaleString()}
                    </span>
                  </div>
                )}
                {purchase.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax:</span>
                    <span className="font-medium text-slate-700">
                      + ৳ {purchase.tax.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                  <span className="text-slate-800">Total Amount:</span>
                  <span className="text-[#0089A7]">
                    ৳ {purchase.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="font-medium text-emerald-600">
                    ৳ {purchase.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm bg-rose-50 p-2 rounded-lg border border-rose-100 mt-2 print:border-none print:p-0 print:bg-transparent">
                  <span className="text-rose-600 font-medium">
                    Due Amount:
                  </span>
                  <span className="font-bold text-rose-600">
                    ৳ {purchase.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Note & Footer */}
            <div className="pt-8 border-t border-slate-100 mt-8 space-y-4">
              {purchase.note && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700">
                    Note:
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">
                    {purchase.note}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-end pt-12 print:pt-24">
                <div className="text-center">
                  <div className="w-32 border-t-2 border-slate-300 mx-auto"></div>
                  <p className="text-sm text-slate-600 mt-2 font-medium">
                    Authorized Signature
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-32 border-t-2 border-slate-300 mx-auto"></div>
                  <p className="text-sm text-slate-600 mt-2 font-medium">
                    Supplier Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Modal */}
      <PurchasePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        purchase={purchase}
      />
    </div>
  );
}
