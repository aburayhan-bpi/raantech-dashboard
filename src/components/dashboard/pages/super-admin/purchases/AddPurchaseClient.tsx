"use client";
import { IProduct, ISupplier } from "@/types/global";
import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useCreatePurchaseMutation } from "@/redux/api/purchase/purchaseApi";
import { useGetSuppliersQuery } from "@/redux/api/supplier/supplierApi";
import { PurchasePaymentMethod, PurchasePaymentStatus } from "@/types/backend";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  Plus,
  Receipt,
  Save,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ProductModal from "@/components/dashboard/pages/super-admin/products/ProductModal";

interface CartItem {
  product: IProduct;
  quantity: number;
  unitCost: number;
  total: number;
}

export default function AddPurchaseClient() {
  const router = useRouter();
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/');

  // Data Fetching
  const { data: suppliersData } = useGetSuppliersQuery("limit=100");
  const { data: productsData } = useGetProductsQuery("limit=1000"); // Load all active products for POS
  const [createPurchase, { isLoading: isSubmitting }] =
    useCreatePurchaseMutation();

  const suppliers = suppliersData?.data || [];

  // Form State
  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [note, setNote] = useState("");

  // POS State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Payment State
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] =
    useState<PurchasePaymentMethod>("CASH");
  const [paymentStatus, setPaymentStatus] =
    useState<PurchasePaymentStatus>("PAID");

  // Filter Products
  const filteredProducts = useMemo(() => {
    const allProductsList = productsData?.data || [];
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return allProductsList
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          (p.barcode && p.barcode.toLowerCase().includes(query)),
      )
      .slice(0, 5); // Show top 5 matches
  }, [productsData, searchQuery]);

  // Calculations
  const subTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = Math.max(0, subTotal - discount + tax);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  // Handlers
  const addToCart = (product: IProduct) => {
    setSearchQuery(""); // Clear search
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitCost,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitCost: product.buyingPrice || 0,
          total: product.buyingPrice || 0,
        },
      ];
    });
  };

  const updateCartItem = (
    productId: string,
    field: "quantity" | "unitCost",
    value: number,
  ) => {
    if (value < 0) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const updated = { ...item, [field]: value };
          updated.total = updated.quantity * updated.unitCost;
          return updated;
        }
        return item;
      }),
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handlePaidAmountChange = (val: number) => {
    setPaidAmount(val);
    if (val >= totalAmount && totalAmount > 0) {
      setPaymentStatus("PAID");
    } else if (val > 0 && val < totalAmount) {
      setPaymentStatus("PARTIAL");
    } else {
      setPaymentStatus("DUE");
    }
  };

  const handleSubmit = async () => {
    if (!supplier) {
      toast.error("Please select a supplier");
      return;
    }
    if (cart.length === 0) {
      toast.error("Please add at least one product to purchase");
      return;
    }

    try {
      const payload = {
        supplier,
        items: cart.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.total,
        })),
        subTotal,
        discount,
        tax,
        totalAmount,
        paidAmount,
        dueAmount,
        paymentStatus,
        paymentMethod,
        purchaseDate,
        note,
      };

      await createPurchase(payload).unwrap();
      toast.success("Purchase completed successfully!");
      router.push(`${basePath}/purchases`);
    } catch (error: unknown) {
      const err = error as { data?: { error?: string } };
      toast.error(err?.data?.error || "Failed to create purchase");
    }
  };

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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Add Purchase</h1>
            <p className="text-sm text-slate-500 mt-1">
              Create a new purchase order
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <CustomButton
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || cart.length === 0}
            icon={<Save className="w-4 h-4" />}
            btnText="Save Purchase"
            loadingText="Saving..."
            variant="default"
            className="w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Supplier, Search, Cart) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Date Selection */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0089A7]" />
              Purchase Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Supplier *
                </label>
                <CustomDropdown
                  options={suppliers.map((s: ISupplier) => ({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value: s.id || (s as any).id,
                    label: `${s.name} ${s.company ? `(${s.company})` : ""}`,
                  }))}
                  value={supplier}
                  onChange={(val: string) => setSupplier(val)}
                  placeholder="Select Supplier..."
                  isSearchable
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Product Search & Cart */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-125">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex gap-2 relative">
                <div className="relative flex-1" ref={searchContainerRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products by name, SKU, or barcode..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0089A7]/20 focus:border-[#0089A7] transition-all"
                  />

                  {/* Search Results Dropdown */}
                  {searchQuery && isSearchFocused && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-10">
                      {filteredProducts.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                          {filteredProducts.map((p) => (
                          <li key={p.id}>
                            <button
                              type="button"
                              onClick={() => addToCart(p)}
                              className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-medium text-slate-700">
                                  {p.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  SKU: {p.sku || "N/A"} • Stock: {p.stock}
                                </p>
                              </div>
                              <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#0089A7] transition-colors" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="px-4 py-6 text-center text-slate-500 text-sm">
                        No products found matching &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </div>
                )}
                </div>
                
                <CustomButton
                  variant="outline"
                  onClick={() => setIsProductModalOpen(true)}
                  icon={<Plus className="w-5 h-5" />}
                  className="!h-[46px] !w-[46px] rounded-xl !p-0 bg-white hover:bg-slate-50 shrink-0 flex items-center justify-center"
                  title="Add New Product"
                  btnText=""
                />
              </div>
            </div>

            {/* Cart Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b border-slate-100 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-24">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">
                      Unit Cost
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-32">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center">
                        <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">
                          Cart is empty
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Search and add products to start
                        </p>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item, index) => (
                      <tr
                        key={`${item.product.id}-${index}`}
                        className="hover:bg-slate-50/50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-700 text-sm line-clamp-1">
                            {item.product.name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 0)
                                updateCartItem(
                                  item.product.id,
                                  "quantity",
                                  val,
                                );
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-center focus:outline-none focus:border-[#0089A7]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost || ""}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 0)
                                updateCartItem(
                                  item.product.id,
                                  "unitCost",
                                  val,
                                );
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0089A7]"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">
                          ৳ {item.total.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => removeCartItem(item.product.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Summary & Payment) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-medium text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#0089A7]" />
              Order Summary
            </h2>

            <div className="space-y-3 pb-4 border-b border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">
                  ৳ {subTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-slate-500 shrink-0">Discount</span>
                <input
                  type="number"
                  min="0"
                  value={discount || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0) setDiscount(val);
                  }}
                  className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:border-[#0089A7]"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-slate-500 shrink-0">Tax</span>
                <input
                  type="number"
                  min="0"
                  value={tax || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0) setTax(val);
                  }}
                  className="w-24 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:border-[#0089A7]"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-slate-800">
                Total Amount
              </span>
              <span className="text-xl font-bold text-[#0089A7]">
                ৳ {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h3 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                Payment Details
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm gap-4">
                  <span className="text-slate-600 font-medium shrink-0">
                    Paid Amount
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={paidAmount || ""}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val >= 0) handlePaidAmountChange(val);
                    }}
                    className="w-32 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm text-right focus:outline-none focus:border-emerald-500 font-medium"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 font-medium">Due Amount</span>
                  <span
                    className={`font-bold ${dueAmount > 0 ? "text-rose-500" : "text-slate-500"}`}
                  >
                    ৳ {dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Method
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "CASH", label: "Cash" },
                      { value: "BANK", label: "Bank" },
                      { value: "MOBILE_BANKING", label: "Mobile Banking" },
                    ]}
                    value={paymentMethod}
                    onChange={(val: string) =>
                      setPaymentMethod(val as PurchasePaymentMethod)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">
                    Status
                  </label>
                  <CustomDropdown
                    options={[
                      { value: "PAID", label: "Paid" },
                      { value: "PARTIAL", label: "Partial" },
                      { value: "DUE", label: "Due" },
                    ]}
                    value={paymentStatus}
                    onChange={(val: string) =>
                      setPaymentStatus(val as PurchasePaymentStatus)
                    }
                  />
                </div>
              </div>

              <div className="pt-2 space-y-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Note (Optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#0089A7] resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={null}
      />
    </div>
  );
}
