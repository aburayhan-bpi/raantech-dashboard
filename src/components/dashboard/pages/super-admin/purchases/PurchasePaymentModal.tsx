"use client";

import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import {
  IPurchase,
  IPurchasePayment,
  useAddPurchasePaymentMutation,
  useGetPurchasePaymentsQuery,
} from "@/redux/api/purchase/purchaseApi";
import {
  PURCHASE_PAYMENT_METHODS,
  PurchasePaymentMethod,
} from "@/types/backend";
import { formatStatusText } from "@/utils/formatStatusText";
import { format } from "date-fns";
import { Calendar, DollarSign, FileText, Loader2, X, Download } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

interface PurchasePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: IPurchase | null;
}

export default function PurchasePaymentModal({
  isOpen,
  onClose,
  purchase,
}: PurchasePaymentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] =
    useState<PurchasePaymentMethod>("CASH");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [addPayment, { isLoading: isAdding }] = useAddPurchasePaymentMutation();
  const purchaseId = purchase?._id || (purchase as { id?: string })?.id || "";

  const { data: payments = [], isLoading: isFetching } =
    useGetPurchasePaymentsQuery(purchaseId, { skip: !isOpen || !purchaseId });

  const paymentMethodOptions = PURCHASE_PAYMENT_METHODS.map((m) => ({
    value: m,
    label: formatStatusText(m),
  }));

  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  if (isOpen && !shouldRender) {
    setShouldRender(true);
  }

  if (!isOpen && isVisible) {
    setIsVisible(false);
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      // Small delay to ensure the DOM has updated before triggering transition
      timer = setTimeout(() => setIsVisible(true), 10);
    } else {
      timer = setTimeout(() => setShouldRender(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!shouldRender || !purchase) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (numAmount > purchase.dueAmount) {
      toast.error(`Amount cannot exceed due amount (৳${purchase.dueAmount})`);
      return;
    }

    try {
      await addPayment({
        id: purchaseId,
        data: {
          amount: numAmount,
          paymentMethod,
          paymentDate,
          note,
        },
      }).unwrap();

      toast.success("Payment added successfully");
      setAmount("");
      setNote("");
    } catch (error: unknown) {
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(
        err?.data?.message || err?.message || "Failed to add payment",
      );
    }
  };

  const handleDownloadReceipt = async () => {
    if (!purchase || payments.length === 0) {
      toast.error("No payment history available to download");
      return;
    }
    
    setIsDownloading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const PaymentHistoryPDF = (await import("./PaymentHistoryPDF")).default;
      
      const blob = await pdf(
        <PaymentHistoryPDF purchase={purchase} payments={payments} />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payment_History_${purchase.purchaseNo}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating receipt PDF:", error);
      toast.error("Failed to generate PDF receipt");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
        onClick={!isAdding ? onClose : undefined}
      />

      {/* Drawer */}
      <div
        className={`relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Payments</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Purchase No:{" "}
              <span className="text-slate-700">{purchase.purchaseNo}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadReceipt}
              disabled={isDownloading || payments.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0089A7] bg-[#0089A7]/10 hover:bg-[#0089A7]/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Download Receipt"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Receipt
            </button>
            <button
              onClick={onClose}
              disabled={isAdding}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 rounded-md border border-slate-200 shadow-sm">
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                Total
              </p>
              <p className="text-sm font-bold text-slate-800">
                ৳{purchase.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-md border border-emerald-200 shadow-sm">
              <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider mb-1">
                Paid
              </p>
              <p className="text-sm font-bold text-emerald-700">
                ৳{purchase.paidAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-rose-50 p-3 rounded-md border border-rose-200 shadow-sm">
              <p className="text-[10px] font-medium text-rose-600 uppercase tracking-wider mb-1">
                Due
              </p>
              <p className="text-sm font-bold text-rose-700">
                ৳{purchase.dueAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Add Payment Form */}
          {purchase.dueAmount > 0 && (
            <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h3 className="text-sm font-medium text-slate-800">
                  Add New Payment
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Amount (৳)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={purchase.dueAmount}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount..."
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Payment Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 z-10 relative">
                    <label className="text-xs font-medium text-slate-700">
                      Payment Method
                    </label>
                    <CustomDropdown
                      options={paymentMethodOptions}
                      value={paymentMethod}
                      onChange={(val) =>
                        setPaymentMethod(val as PurchasePaymentMethod)
                      }
                      placeholder="Select Method..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                      Note (Optional)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Add a note..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] resize-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <CustomButton
                    type="submit"
                    loading={isAdding}
                    disabled={isAdding || !amount}
                    btnText="Confirm Payment"
                    className="w-full rounded-md"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Payment History List */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-3 border-b border-slate-200 pb-2">
              Payment History
            </h3>

            {isFetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#0089A7]" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-md border border-dashed border-slate-300">
                <p className="text-xs text-slate-500">No payments found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment, index) => (
                  <div
                    key={
                      payment._id ||
                      (payment as IPurchasePayment & { id?: string }).id ||
                      index
                    }
                    className="bg-white p-3 rounded-md border border-slate-200 shadow-sm flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-emerald-600">
                          ৳{payment.amount.toLocaleString()}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                          {formatStatusText(payment.paymentMethod || "-")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {format(
                          new Date(payment.paymentDate || payment.createdAt),
                          "dd MMM yyyy",
                        )}{" "}
                        • By {payment.createdBy?.name || "System"}
                      </p>
                      {payment.note && (
                        <p className="text-[11px] text-slate-500 italic mt-1">
                          &quot;{payment.note}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
