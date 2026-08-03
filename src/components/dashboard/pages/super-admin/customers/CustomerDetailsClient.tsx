"use client";
import { SaleInvoicePDF } from "@/components/dashboard/pages/super-admin/sales/SaleInvoicePDF";
import { useGetCustomerByIdQuery } from "@/redux/api/customer/customerApi";
import { useGetSalesQuery } from "@/redux/api/sale/salesApi";
import { selectUser } from "@/redux/features/user/authSlice";
import { ISale } from "@/types/global";
import { formatStatusText } from "@/utils/formatStatusText";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { format } from "date-fns";
import {
  ArrowLeft,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false },
);

export default function CustomerDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const user = useSelector(selectUser);
  const rolePrefix =
    user?.role === "SUPER_ADMIN" ? "super-admin" : user?.role?.toLowerCase();

  const { data: customerData, isLoading: isLoadingCustomer } =
    useGetCustomerByIdQuery(id);
  const { data: salesData, isLoading: isLoadingSales } = useGetSalesQuery({
    customer: id,
  });

  const customer = customerData?.data;
  const salesList = useMemo(() => salesData?.data || [], [salesData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [previewSale, setPreviewSale] = useState<ISale | null>(null);

  const totalSpent = useMemo(() => {
    return salesList.reduce(
      (total: number, sale: ISale) => total + sale.totalAmount,
      0,
    );
  }, [salesList]);

  const totalDue = useMemo(() => {
    return salesList.reduce(
      (total: number, sale: ISale) =>
        total + (sale.totalAmount - sale.paidAmount),
      0,
    );
  }, [salesList]);

  const filteredSales = salesList.filter((sale: ISale) =>
    sale.saleNo?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoadingCustomer || isLoadingSales) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-slate-500 bg-white border border-slate-200 rounded-lg shadow-sm">
        <Search className="w-8 h-8 text-slate-300 mb-3" />
        <p className="text-lg font-medium text-slate-800 mb-4">
          Customer not found
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Customer Details
          </h1>
          <p className="text-sm text-slate-500">
            ID: {customer.customerNo || customer.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 md:col-span-1">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {customer.name}
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {customer.phone}
                </p>
                {customer.alternatePhone && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {customer.alternatePhone}
                  </p>
                )}
              </div>
            </div>
            {customer.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-slate-700 break-all">
                  {customer.email}
                </p>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-slate-700">
                  {customer.address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Total Spent
            </p>
            <p className="text-2xl font-bold text-slate-900">
              ৳ {totalSpent.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Across {salesList.length} purchases
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 flex flex-col justify-center">
            <p className="text-sm font-medium text-slate-500 mb-1">
              Outstanding Balance
            </p>
            <p className="text-2xl font-bold text-red-600">
              ৳ {totalDue.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">Unpaid amount</p>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-800">
            Purchase History
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by invoice no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice No</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Due</th>
                <th className="px-4 py-3 font-medium text-center">Status</th>
                <th className="px-4 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSales.map((sale: ISale) => {
                const dueAmount = sale.totalAmount - sale.paidAmount;
                const isPaid = dueAmount <= 0;

                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        href={`/dashboard/${rolePrefix}/sales/${sale.id}`}
                        className="text-primary hover:underline"
                      >
                        {sale.saleNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {format(new Date(sale.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium text-right">
                      ৳ {sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-medium ${isPaid ? "text-green-600" : "text-red-600"}`}
                      >
                        ৳ {dueAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          sale.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewSale(sale)}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Preview Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <PDFDownloadLink
                          document={<SaleInvoicePDF sale={sale} />}
                          fileName={`Invoice-${sale.saleNo}.pdf`}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </PDFDownloadLink>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No purchase history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                Invoice Preview - {previewSale.saleNo}
              </h3>
              <button
                onClick={() => setPreviewSale(null)}
                className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100">
              <PDFViewer className="w-full h-full" showToolbar={true}>
                <SaleInvoicePDF sale={previewSale} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
