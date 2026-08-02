"use client";
import { useGetCustomerByIdQuery } from "@/redux/api/customer/customerApi";
import { ISale } from "@/types/global";
import { useGetSalesQuery } from "@/redux/api/sale/salesApi";
import { format } from "date-fns";
import { ArrowLeft, Download, FileText, Phone, Mail, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { SaleInvoicePDF } from "@/components/dashboard/pages/super-admin/sales/SaleInvoicePDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { formatStatusText } from "@/utils/formatStatusText";

// Dynamically import PDFViewer to avoid SSR hydration issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

export default function CustomerDetailsClient({ id }: { id: string }) {
  const router = useRouter();

  const { data: customerData, isLoading: isLoadingCustomer } = useGetCustomerByIdQuery(id);
  const { data: salesData, isLoading: isLoadingSales } = useGetSalesQuery({ customer: id });

  const customer = customerData?.data;
  const salesList = useMemo(() => salesData?.data || [], [salesData]);

  const [searchQuery, setSearchQuery] = useState("");
  const [previewSale, setPreviewSale] = useState<ISale | null>(null);

  // Compute metrics
  const totalSpent = useMemo(() => {
    return salesList.reduce((total: number, sale: ISale) => total + sale.totalAmount, 0);
  }, [salesList]);

  const totalDue = useMemo(() => {
    return salesList.reduce((total: number, sale: ISale) => total + (sale.totalAmount - sale.paidAmount), 0);
  }, [salesList]);

  const filteredSales = salesList.filter((sale: ISale) =>
    sale.saleNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoadingCustomer || isLoadingSales) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <p className="text-xl font-semibold mb-4">Customer not found</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Customer Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary-700">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-800">{customer.name}</h2>
            <span className="text-sm px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium mt-2">
              ACTIVE
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 text-slate-600">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-800">Phone</p>
                <p className="text-sm">{customer.phone}</p>
                {customer.alternatePhone && (
                  <p className="text-sm mt-1 text-slate-500">{customer.alternatePhone}</p>
                )}
              </div>
            </div>
            {customer.email && (
              <div className="flex items-start gap-3 text-slate-600">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Email</p>
                  <p className="text-sm break-all">{customer.email}</p>
                </div>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3 text-slate-600">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-800">Address</p>
                  <p className="text-sm">{customer.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Card */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col justify-center">
            <h3 className="text-slate-500 font-medium mb-1">Total Spent</h3>
            <p className="text-3xl font-bold text-primary-600">৳ {totalSpent.toFixed(2)}</p>
            <p className="text-sm text-slate-400 mt-2">Across {salesList.length} purchases</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex flex-col justify-center">
            <h3 className="text-slate-500 font-medium mb-1">Total Due</h3>
            <p className="text-3xl font-bold text-rose-600">৳ {totalDue.toFixed(2)}</p>
            <p className="text-sm text-slate-400 mt-2">Unpaid balance</p>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Purchase History</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by invoice no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-5 py-4">Invoice No</th>
                <th className="px-5 py-4">Date</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Due</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((sale: ISale) => {
                const dueAmount = sale.totalAmount - sale.paidAmount;
                const isPaid = dueAmount <= 0;

                return (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-800">
                      <Link href={`/dashboard/super-admin/sales/${sale.id}`} className="text-primary-600 hover:underline">
                        {sale.saleNo}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {format(new Date(sale.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-medium">
                      ৳ {sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-medium ${isPaid ? "text-emerald-600" : "text-rose-600"}`}>
                        ৳ {dueAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          sale.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : sale.status === "PENDING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {formatStatusText(sale.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Preview Button */}
                        <button
                          onClick={() => setPreviewSale(sale)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Preview Invoice"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* Download Button */}
                        <PDFDownloadLink
                          document={<SaleInvoicePDF sale={sale} />}
                          fileName={`Invoice-${sale.saleNo}.pdf`}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
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
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No purchase history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">
                Invoice Preview - {previewSale.saleNo}
              </h3>
              <button
                onClick={() => setPreviewSale(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
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
