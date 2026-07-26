"use client";

import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import {
  ISaleItem,
  useGetSaleByIdQuery,
  useUpdateSaleMutation,
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
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SaleInvoicePDF } from "./SaleInvoicePDF";

export default function SaleDetailsClient({ saleId }: { saleId: string }) {
  const router = useRouter();
  const { data, isLoading } = useGetSaleByIdQuery(saleId);
  const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();

  const sale = data?.data;

  // Form states for Edit
  const [isEditing, setIsEditing] = useState(false);

  const pdfDocument = useMemo(() => {
    if (!sale) return null;
    return <SaleInvoicePDF sale={sale} />;
  }, [sale]);
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
        <Link href="/dashboard/super-admin/sales">
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
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CANCELLED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/super-admin/sales")}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-3">
          {!isEditing && (
            <CustomButton
              onClick={() => setIsEditing(true)}
              icon={<Edit className="w-4 h-4 mr-1.5" />}
              btnText="Update Order"
              variant="outline"
              className="h-10 px-4 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
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
                  className={`font-semibold ${sale.dueAmount > 0 ? "text-rose-500" : "text-emerald-500"}`}
                >
                  ৳ {sale.dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
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
                        : []
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
                          placeholder={`Max: ${sale.dueAmount}`}
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
                btnText="Save Changes"
                variant="default"
                className="w-full mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
