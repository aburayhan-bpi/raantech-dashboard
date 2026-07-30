"use client";

import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import {
  ISaleItem,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
  usePartialReturnSaleMutation,
  useAddSaleRefundMutation,
  useGetSaleRefundsQuery,
} from "@/redux/api/sale/salesApi";
import { PaymentMethod, SaleStatus } from "@/types/global";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Download,
  Edit,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Truck,
  User, X, Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SaleInvoicePDF } from "./SaleInvoicePDF";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/features/user/authSlice";

export default function SaleDetailsClient({ saleId }: { saleId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/');
  
  const currentUser = useSelector(selectUser);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const userPermissions = currentUser?.permissions || [];
  const canUpdate = isSuperAdmin || userPermissions.includes("sales:update");
  const canRefund = isSuperAdmin || userPermissions.includes("sales:refund");
  const canReturn = isSuperAdmin || userPermissions.includes("sales:return");
  
  const { data, isLoading } = useGetSaleByIdQuery(saleId);
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();

  const sale = data?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [isPartialReturnOpen, setIsPartialReturnOpen] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  
  const [partialReturnSale, { isLoading: isReturning }] = usePartialReturnSaleMutation();

  const pdfDocument = useMemo(() => {
    if (!sale) return null;
    return <SaleInvoicePDF sale={sale} />;
  }, [sale]);

  // Refund State
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  const [refundMethod, setRefundMethod] = useState("CASH");
  const [refundNote, setRefundNote] = useState("");

  const { data: refundData } = useGetSaleRefundsQuery(saleId);
  const refunds = refundData?.history || [];
  const [addRefund, { isLoading: isAddingRefund }] = useAddSaleRefundMutation();

  const [status, setStatus] = useState("");
  const [courierDetails, setCourierDetails] = useState("");
  const [note, setNote] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Populate initial states when editing starts
  useEffect(() => {
    if (sale && isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus(sale.status);

      setCourierDetails(sale.courierDetails || "");

      setNote(sale.note || "");

      setPaymentAmount(""); // Leave blank so user has to explicitly type payment

      setPaymentMethod("COD");
    }
  }, [sale, isEditing]);

  const handleUpdate = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: Record<string, any> = { status, courierDetails, note };

      // If payment is added
      if (paymentAmount && Number(paymentAmount) > 0) {
        if (Number(paymentAmount) > (sale?.dueAmount || 0)) {
          toast.error(`Payment amount cannot exceed due amount of ৳${sale?.dueAmount || 0}`);
          return;
        }
        payload.paymentAmount = Number(paymentAmount);
        payload.paymentMethod = paymentMethod;
      }

      await updateSale({ id: saleId, data: payload }).unwrap();
      toast.success("Order updated successfully!");
      setIsEditing(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update order");
    }
  };

  const handlePartialReturn = async () => {
    try {
      const returnItems = Object.entries(returnQuantities)
        .map(([productId, quantity]) => ({ productId, returnQuantity: quantity }))
        .filter((item) => item.returnQuantity > 0);

      if (returnItems.length === 0) {
        toast.error("Please enter at least one quantity to return.");
        return;
      }

      await partialReturnSale({ id: saleId, returnItems }).unwrap();
      toast.success("Partial return processed successfully!");
      setIsPartialReturnOpen(false);
      setReturnQuantities({});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process partial return");
    }
  };

  const handleRefund = async () => {
    if (!refundAmount || Number(refundAmount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }
    try {
      await addRefund({
        id: saleId,
        data: {
          amount: Number(refundAmount),
          refundMethod,
          note: refundNote,
        },
      }).unwrap();
      toast.success("Refund processed successfully!");
      setIsRefundOpen(false);
      setRefundAmount("");
      setRefundNote("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process refund");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089A7]"></div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Order Not Found
        </h3>
        <p className="text-slate-500 mb-6">
          The order you are looking for does not exist.
        </p>
        <Link href={`${basePath}/sales`}>
          <CustomButton
            icon={<ArrowLeft className="w-4 h-4 mr-1" />}
            btnText="Back to Sales"
          />
        </Link>
      </div>
    );
  }

  const getStatusColor = (val: string) => {
    switch (val) {
      case "COMPLETED":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "RETURNED":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`${basePath}/sales`)}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">
                {sale.saleNo}
              </h1>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getStatusColor(sale.status)}`}
              >
                {sale.status}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on{" "}
              {format(
                new Date(sale.saleDate || sale.createdAt),
                "dd MMM yyyy, hh:mm a",
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canUpdate && !isEditing && !isPartialReturnOpen && sale.status !== "CANCELLED" && sale.status !== "RETURNED" && (
            <CustomButton
              onClick={() => setIsEditing(true)}
              icon={<Edit className="w-4 h-4 mr-1.5" />}
              btnText="Update Order"
              variant="outline"
              className="h-10 px-4 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            />
          )}
          {canReturn && !isPartialReturnOpen && !isEditing && (sale.status === SaleStatus.COMPLETED || sale.status === SaleStatus.DELIVERED) && (
            <CustomButton
              onClick={() => setIsPartialReturnOpen(true)}
              icon={<Receipt className="w-4 h-4 mr-1.5" />}
              btnText="Partial Return"
              className="h-10 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm transition-colors border-none"
            />
          )}
          {pdfDocument && (
            <PDFDownloadLink
              document={pdfDocument}
              fileName={`Invoice-${sale.saleNo}.pdf`}
              className="flex items-center justify-center h-10 px-4 rounded-lg text-sm font-medium transition-colors shadow-sm text-white bg-slate-800 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {({ loading }: any) =>
                loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </>
                )
              }
            </PDFDownloadLink>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Shipping Info */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 flex flex-col sm:flex-row gap-8">
            <div className="flex-1 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Customer Info
              </h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p className="font-semibold text-slate-800 text-base">
                  {sale.customer.name}
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />{" "}
                  {sale.customer.phone}
                </p>
                {sale.customer.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />{" "}
                    {sale.customer.email}
                  </p>
                )}
              </div>
            </div>
            <div className="hidden sm:block w-px bg-slate-100"></div>
            <div className="flex-1 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Shipping Address
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {sale.customer.address || "No address provided."}
              </p>

              {sale.courierDetails && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Truck className="w-3.5 h-3.5" /> Courier Details
                  </h3>
                  <p className="text-sm text-slate-700 font-medium">
                    {sale.courierDetails}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-slate-500" /> Ordered Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-3 text-left font-semibold text-slate-500">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-500">
                      Price
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-500">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-500">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item: ISaleItem, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          SKU: {item.product.sku}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        ৳ {item.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">
                        ৳ {item.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Note */}
          {sale.note && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Order Note
              </h4>
              <p className="text-sm text-amber-900">{sale.note}</p>
            </div>
          )}
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>৳ {sale.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>৳ {sale.shippingCharge.toLocaleString()}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>- ৳ {sale.discount.toLocaleString()}</span>
                </div>
              )}
              {sale.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span>৳ {sale.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="text-lg font-bold text-[#0089A7]">
                  ৳ {sale.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 mt-4 border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">Paid Amount:</span>
                <span className="font-semibold text-slate-800">
                  ৳ {sale.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-700">Due Amount:</span>
                <span
                  className={`font-semibold ${
                    ["CANCELLED", "RETURNED"].includes(sale.status)
                      ? "text-slate-500"
                      : sale.dueAmount > 0 
                        ? "text-rose-500" 
                        : "text-emerald-500"
                  }`}
                >
                  ৳ {["CANCELLED", "RETURNED"].includes(sale.status) ? 0 : sale.dueAmount.toLocaleString()}
                </span>
              </div>
              {sale.refundedAmount && sale.refundedAmount > 0 ? (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 mt-2">
                  <span className="font-medium text-slate-700">Total Refunded:</span>
                  <span className="font-semibold text-purple-600">
                    ৳ {sale.refundedAmount.toLocaleString()}
                  </span>
                </div>
              ) : null}
              {sale.paymentStatus === "REFUND_DUE" && (
                <div className="flex justify-between items-center text-sm pt-2 border-t border-rose-200 mt-2 bg-rose-50/50 p-2 rounded-lg">
                  <span className="font-semibold text-rose-700">Refund Due:</span>
                  <span className="font-bold text-rose-600">
                    ৳ {(sale.paidAmount - (sale.refundedAmount || 0)).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            
            {canRefund && sale.paymentStatus === "REFUND_DUE" && (
              <div className="pt-2">
                <button
                  onClick={() => setIsRefundOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  Issue Refund
                </button>
              </div>
            )}
          </div>

          {/* Edit / Update Form */}
          {isEditing && (
            <div className="bg-white rounded-xl border border-[#0089A7]/20 shadow-lg shadow-[#0089A7]/5 p-6 space-y-5 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Edit className="w-4 h-4 text-[#0089A7]" /> Update Order
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    Order Status
                  </label>
                  <CustomDropdown
                    value={status}
                    onChange={setStatus}
                    options={[
                      { label: "Pending", value: SaleStatus.PENDING },
                      { label: "Processing", value: SaleStatus.PROCESSING },
                      { label: "Shipped", value: SaleStatus.SHIPPED },
                      { label: "Completed", value: SaleStatus.COMPLETED },
                      // Only show cancelled if the order hasn't been completed yet
                      ...(sale.status !== SaleStatus.COMPLETED 
                        ? [{ label: "Cancelled", value: SaleStatus.CANCELLED }] 
                        : [{ label: "Returned", value: SaleStatus.RETURNED }]
                      ),
                    ]}
                    placeholder="Select Status"
                    triggerClassName="w-full bg-slate-50 border-slate-200 py-2 rounded-lg text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    Courier Details
                  </label>
                  <input
                    type="text"
                    value={courierDetails}
                    onChange={(e) => setCourierDetails(e.target.value)}
                    placeholder="e.g., Pathao - 123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 uppercase">
                    Note
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Internal note for staff..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] resize-none"
                  ></textarea>
                </div>

                {sale.dueAmount > 0 && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
                    <p className="text-xs font-bold text-emerald-800 uppercase text-center border-b border-emerald-100 pb-2">
                      Collect Payment
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-emerald-700 uppercase">
                          Amount (৳)
                        </label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPaymentAmount(
                              val === "" ? "" : Math.max(0, Number(val)),
                            );
                          }}
                          placeholder={`Max: ${Number(sale.dueAmount.toFixed(2))}`}
                          max={sale.dueAmount}
                          className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold text-emerald-700 uppercase">
                          Method
                        </label>
                        <CustomDropdown
                          value={paymentMethod}
                          onChange={setPaymentMethod}
                          options={[
                            { label: "COD", value: PaymentMethod.COD },
                            { label: "Cash", value: PaymentMethod.CASH },
                            { label: "Bank", value: PaymentMethod.BANK },
                            {
                              label: "Mobile Banking",
                              value: PaymentMethod.MOBILE_BANKING,
                            },
                            { label: "Other", value: PaymentMethod.OTHER },
                          ]}
                          placeholder="Select Method"
                          triggerClassName="w-full bg-white border-emerald-200 py-1.5 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <CustomButton
                onClick={handleUpdate}
                disabled={isUpdating}
                loading={isUpdating}
                icon={<Save className="w-4 h-4" />} btnText="Save Changes"
                variant="default"
                className="w-full mt-2"
              />
            </div>
          )}

          {/* Partial Return Form */}
          {isPartialReturnOpen && (
            <div className="bg-white rounded-xl border border-rose-200 shadow-lg shadow-rose-100/50 p-6 space-y-5 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-rose-500" /> Issue Partial Return
                </h3>
                <button
                  onClick={() => setIsPartialReturnOpen(false)}
                  className="text-xs font-semibold text-slate-400 hover:text-rose-500"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600 mb-2">Select the quantity of items to return. The stock will be restored automatically.</p>
                {sale.items.map((item: ISaleItem) => (
                  <div key={String(item.product._id)} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-800">{item.product.name}</span>
                      <span className="text-xs text-slate-500">Ordered: {item.quantity} | Unit Price: ৳{item.unitPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600">Return Qty:</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={returnQuantities[String(item.product._id)] || ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Math.min(item.quantity, Math.max(0, Number(e.target.value)));
                          setReturnQuantities(prev => ({ ...prev, [String(item.product._id)]: val }));
                        }}
                        className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <CustomButton
                onClick={handlePartialReturn}
                disabled={isReturning}
                loading={isReturning}
                btnText="Process Return"
                className="w-full mt-4 bg-rose-500 hover:bg-rose-600 border-none"
              />
            </div>
          )}

          {/* Refund Form UI */}
          {isRefundOpen && (
            <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-rose-500" /> Issue Refund
                </h3>
                <button
                  onClick={() => setIsRefundOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Refund Amount</label>
                  <input
                    type="number"
                    min="0"
                    value={refundAmount}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : "";
                      setRefundAmount(val !== "" ? Math.max(0, val) : "");
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                    placeholder="e.g. 500"
                  />
                  <p className="text-[10px] text-slate-400">Max allowed: {(sale.paidAmount - (sale.refundedAmount || 0)).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase">Refund Method</label>
                  <CustomDropdown
                    value={refundMethod}
                    onChange={setRefundMethod}
                    options={[
                      { label: "Cash", value: "CASH" },
                      { label: "Bank", value: "BANK" },
                      { label: "Mobile Banking", value: "MOBILE_BANKING" },
                      { label: "Other", value: "OTHER" },
                    ]}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 uppercase">Note (Optional)</label>
                <textarea
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7]"
                  rows={2}
                  placeholder="Reason for refund..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <CustomButton
                  onClick={() => setIsRefundOpen(false)}
                  icon={<X className="w-4 h-4" />} btnText="Cancel"
                  variant="outline"
                  className="border-slate-200 text-slate-600"
                />
                <CustomButton
                  onClick={handleRefund}
                  loading={isAddingRefund}
                  disabled={isAddingRefund}
                  btnText="Submit Refund"
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                />
              </div>
            </div>
          )}

          {/* Status History Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-[#0089A7]" /> Status History
            </h3>
            {sale.statusHistory && sale.statusHistory.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent pt-2">
                {[...sale.statusHistory].reverse().map((history, idx) => (
                  <div key={history._id || idx} className="relative group">
                    {/* Icon */}
                    <div className="absolute -left-[1.625rem] flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white bg-[#0089A7]/10 shadow-sm shrink-0 top-1 z-10 transition-transform duration-300 group-hover:scale-110">
                      <div className="w-2 h-2 rounded-full bg-[#0089A7] relative">
                        <div className="absolute inset-0 rounded-full bg-[#0089A7] animate-ping opacity-75"></div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md tracking-wide ${getStatusColor(history.status)}`}>
                          {history.status}
                        </span>
                        <time className="font-mono text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(history.date), "dd MMM yyyy, hh:mm a")}
                        </time>
                      </div>
                      <div className="text-sm text-slate-700 leading-relaxed mb-3">
                        {history.note || <span className="italic text-slate-400">No note provided.</span>}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
                        <User className="w-3 h-3" />
                        Updated by: <span className="text-slate-600 font-semibold">{history.updatedBy?.name || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4">No status history found.</p>
            )}
          </div>

          {/* Refund History Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 space-y-4 mt-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Receipt className="w-4 h-4 text-purple-600" /> Refund History
            </h3>
            {refunds && refunds.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent pt-2">
                {[...refunds].reverse().map((refund, idx) => (
                  <div key={refund._id || idx} className="relative group">
                    {/* Icon */}
                    <div className="absolute -left-[1.625rem] flex items-center justify-center w-5 h-5 rounded-full border-[3px] border-white bg-purple-100 shadow-sm shrink-0 top-1 z-10 transition-transform duration-300 group-hover:scale-110">
                      <div className="w-2 h-2 rounded-full bg-purple-600 relative">
                        <div className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-75"></div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 uppercase rounded-md tracking-wide">
                          ৳ {refund.amount.toLocaleString()} - {refund.refundMethod}
                        </span>
                        <time className="font-mono text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(refund.refundDate || refund.createdAt), "dd MMM yyyy, hh:mm a")}
                        </time>
                      </div>
                      <div className="text-sm text-slate-700 leading-relaxed mb-3">
                        {refund.note || <span className="italic text-slate-400">No note provided.</span>}
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
                        <User className="w-3 h-3" />
                        Processed by: <span className="text-slate-600 font-semibold">{refund.createdBy?.name || "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 italic text-center py-4">No refund history yet.</p>
            )}
          </div>

          {/* Operation Guide / Helper Note */}
          <div className="bg-blue-50/60 rounded-xl border border-blue-100/80 shadow-sm p-5 space-y-3 mt-4">
            <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 border-b border-blue-200/50 pb-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-serif italic text-xs font-bold">i</div>
              Operation Guide
            </h3>
            <ul className="text-xs text-blue-800/80 space-y-2.5 list-disc pl-4 leading-relaxed font-medium">
              <li>
                <strong>Update Order:</strong> Can only be modified for active orders. Button is hidden if order is <span className="font-bold text-rose-500 bg-white px-1 py-0.5 rounded shadow-sm mx-1">CANCELLED</span> or <span className="font-bold text-pink-500 bg-white px-1 py-0.5 rounded shadow-sm mx-1">RETURNED</span>.
              </li>
              <li>
                <strong>Partial Return:</strong> Allows returning specific items to stock and calculates refunds. Only available when order is <span className="font-bold text-emerald-500 bg-white px-1 py-0.5 rounded shadow-sm mx-1">DELIVERED</span> or <span className="font-bold text-teal-500 bg-white px-1 py-0.5 rounded shadow-sm mx-1">COMPLETED</span>.
              </li>
              <li>
                <strong>Issue Refund:</strong> Appears below the Payment Summary <em>only</em> when Payment Status is <span className="font-bold text-rose-500 bg-white px-1 py-0.5 rounded shadow-sm mx-1">REFUND_DUE</span>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
