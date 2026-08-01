"use client";

import { useGetPurchaseReturnsQuery } from "@/redux/api/purchase/purchaseApi";
import { format } from "date-fns";
import { Package, Undo2, X } from "lucide-react";

interface PurchaseReturnHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string | null;
}

export default function PurchaseReturnHistoryModal({
  isOpen,
  onClose,
  purchaseId,
}: PurchaseReturnHistoryModalProps) {
  const { data: returnHistory, isLoading } = useGetPurchaseReturnsQuery(
    purchaseId as string,
    {
      skip: !isOpen || !purchaseId,
      refetchOnMountOrArgChange: true,
    }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Undo2 className="w-5 h-5 text-[#0089A7]" />
            <h2 className="text-xl font-bold text-slate-800">Return History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0089A7]"></div>
            </div>
          ) : !returnHistory || returnHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Undo2 className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-lg">No returns found</p>
              <p className="text-sm text-slate-400 mt-1">
                There are no return records for this purchase.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {returnHistory.map((ret, idx) => (
                <div
                  key={ret._id || idx}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                >
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Date</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {format(new Date(ret.returnDate), "dd MMM, yyyy")}
                        </p>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Processed By</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">
                          {ret.createdBy?.name || "System"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-medium">Total Refund</p>
                      <p className="text-base font-bold text-rose-500">
                        ৳ {ret.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="pb-2 text-xs font-semibold text-slate-500">Product</th>
                          <th className="pb-2 text-xs font-semibold text-slate-500 text-center">Qty</th>
                          <th className="pb-2 text-xs font-semibold text-slate-500 text-right">Unit Price</th>
                          <th className="pb-2 text-xs font-semibold text-slate-500 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {ret.items.map((item, itemIdx) => {
                          const product = typeof item.product === 'object' ? item.product : { name: "Unknown", sku: "" };
                          return (
                            <tr key={itemIdx}>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <Package className="w-4 h-4 text-slate-400 shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{product.name}</p>
                                    {product.sku && <p className="text-[11px] text-slate-500 mt-0.5">SKU: {product.sku}</p>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-center text-sm font-medium text-slate-700">{item.quantity}</td>
                              <td className="py-3 text-right text-sm text-slate-600">৳ {item.unitCost.toLocaleString()}</td>
                              <td className="py-3 text-right text-sm font-semibold text-slate-800">৳ {item.total.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    
                    {(ret.tax > 0 || ret.note) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between gap-4">
                        <div className="flex-1">
                          {ret.note && (
                            <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                              &quot;{ret.note}&quot;
                            </p>
                          )}
                        </div>
                        {ret.tax > 0 && (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Tax Adj: <span className="font-medium text-slate-700">৳ {ret.tax.toLocaleString()}</span></p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
