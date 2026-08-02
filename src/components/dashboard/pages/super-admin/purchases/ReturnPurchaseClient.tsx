"use client";
import { IPurchase, IPurchaseItem, IPurchaseReturn } from "@/types/global";
import CustomButton from "@/components/shared/CustomButton";
import { useGetPurchaseByIdQuery,
  useGetPurchaseReturnsQuery,
  useReturnPurchaseMutation } from "@/redux/api/purchase/purchaseApi";
import { ArrowLeft, ArrowUpRight, Receipt, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReturnItem {
  productId: string;
  productName: string;
  sku: string;
  maxQty: number;
  returnQty: number;
  unitCost: number;
  total: number;
}

const EMPTY_PURCHASE_RETURNS: IPurchaseReturn[] = [];

function buildReturnItems(
  purchase: IPurchase,
  pastReturns: IPurchaseReturn[],
): ReturnItem[] {
  const returnedQtyMap: Record<string, number> = {};

  pastReturns.forEach((ret) => {
    ret.items.forEach((item) => {
      const productId =
        typeof item.product === "string" ? item.product : item.product.id;
      returnedQtyMap[productId] =
        (returnedQtyMap[productId] || 0) + item.quantity;
    });
  });

  return purchase.items
    .map((item: IPurchaseItem) => {
      const productId = item.product.id;
      const alreadyReturned = returnedQtyMap[productId] || 0;
      const maxQty = Math.max(0, item.quantity - alreadyReturned);

      return {
        productId,
        productName: item.product.name || "Unknown Product",
        sku: item.product.sku || "",
        maxQty,
        returnQty: 0,
        unitCost: item.unitCost,
        total: 0,
      };
    })
    .filter((item: ReturnItem) => item.maxQty > 0);
}

export default function ReturnPurchaseClient() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split("/").slice(0, 3).join("/");
  const params = useParams();
  const id = params?.id as string;

  const { data: purchaseData, isLoading: isFetching } = useGetPurchaseByIdQuery(
    id,
    {
      skip: !id,
    },
  );
  const { data: returnsData } = useGetPurchaseReturnsQuery(id, {
    skip: !id,
  });
  const [returnPurchase, { isLoading: isSubmitting }] =
    useReturnPurchaseMutation();

  const purchase = purchaseData?.data;
  const pastReturns = returnsData ?? EMPTY_PURCHASE_RETURNS;

  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [tax, setTax] = useState(0);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (purchase && purchase.items) {
      const initialItems = buildReturnItems(purchase, pastReturns);
      const timeoutId = window.setTimeout(() => {
        setReturnItems(initialItems);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [purchase, pastReturns]);

  const subTotal = returnItems.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = Math.max(0, subTotal + tax);

  const updateReturnQty = (productId: string, val: number) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const qty = Math.max(0, Math.min(val, item.maxQty));
          return {
            ...item,
            returnQty: qty,
            total: qty * item.unitCost,
          };
        }
        return item;
      }),
    );
  };

  const removeItemFromReturn = (productId: string) => {
    updateReturnQty(productId, 0);
  };

  const handleSubmit = async () => {
    const activeItems = returnItems.filter((i) => i.returnQty > 0);

    if (activeItems.length === 0) {
      toast.error("Please specify return quantities for at least one item.");
      return;
    }

    try {
      const payload = {
        items: activeItems.map((item) => ({
          product: item.productId,
          quantity: item.returnQty,
          unitCost: item.unitCost,
          total: item.total,
        })),
        subTotal,
        tax,
        totalAmount,
        note,
      };

      await returnPurchase({ id, data: payload }).unwrap();
      toast.success("Purchase return processed successfully!");
      router.push(`${basePath}/purchases`);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string; message?: string } };
      toast.error(
        err?.data?.message || err?.data?.error || "Failed to process return",
      );
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-slate-500 font-medium">Purchase not found</p>
        <Link href={`${basePath}/purchases`}>
          <CustomButton btnText="Back to Purchases" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`${basePath}/purchases`}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Return Purchase
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Purchase No: {purchase.purchaseNo}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <CustomButton
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || subTotal === 0}
            icon={<Save className="w-4 h-4" />}
            btnText="Process Return"
            loadingText="Processing..."
            variant="default"
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Items) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <ArrowUpRight className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-slate-800">
                Select Items to Return
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">
                      Max Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">
                      Return Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnItems.map((item, index) => (
                    <tr
                      key={`${item.productId}-${index}`}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        item.returnQty > 0 ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-700 text-sm line-clamp-1">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          SKU: {item.sku}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                        {item.maxQty}
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0"
                          max={item.maxQty}
                          value={item.returnQty === 0 ? "" : item.returnQty}
                          placeholder="0"
                          onChange={(e) =>
                            updateReturnQty(
                              item.productId,
                              Number(e.target.value),
                            )
                          }
                          className={`w-full px-2 py-1.5 bg-white border ${
                            item.returnQty > 0
                              ? "border-primary ring-1 ring-primary/20"
                              : "border-slate-200"
                          } rounded-lg text-sm text-center focus:outline-none focus:border-primary`}
                        />
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        ৳ {item.unitCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        ৳ {item.total.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.returnQty > 0 && (
                          <button
                            onClick={() => removeItemFromReturn(item.productId)}
                            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Clear"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Return Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., Damaged items during transport"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* Right Column (Summary) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Return Summary
            </h2>

            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">
                  ৳ {subTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-slate-500 shrink-0">Tax Adj.</span>
                <input
                  type="number"
                  min="0"
                  value={tax === 0 ? "" : tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:border-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">
                Total Refund
              </span>
              <span className="text-xl font-bold text-rose-500">
                ৳ {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Note: Submitting this return will immediately deduct the
                specified items from your inventory stock and decrease the
                supplier&apos;s due balance by the total refund amount.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
