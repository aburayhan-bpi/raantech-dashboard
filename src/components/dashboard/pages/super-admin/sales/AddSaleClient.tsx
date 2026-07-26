"use client";

import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { IProduct, useGetProductsQuery } from "@/redux/api/product/productApi";
import { useCreateSaleMutation } from "@/redux/api/sale/salesApi";
import { SalePaymentMethod } from "@/types/backend";
import { PaymentMethod } from "@/types/global";
import {
  ArrowLeft,
  CreditCard,
  Plus,
  Receipt,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  User,
  Truck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ProductModal from "@/components/dashboard/pages/super-admin/products/ProductModal";

interface CartItem {
  product: IProduct;
  quantity: number;
  unitPrice: number;
  total: number;
}

export default function AddSaleClient() {
  const router = useRouter();

  // Data Fetching
  const { data: productsData } = useGetProductsQuery("limit=1000"); // Load all active products
  const [createSale, { isLoading: isSubmitting }] = useCreateSaleMutation();

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [note, setNote] = useState("");

  // POS Search State
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
  const [discount, setDiscount] = useState<number | string>(0);
  const [shippingCharge, setShippingCharge] = useState<number | string>(0);
  const [paidAmount, setPaidAmount] = useState<number | string>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PaymentMethod.COD);

  // Filter Products
  const filteredProducts = useMemo(() => {
    const allProductsList = productsData?.data || [];
    if (!searchQuery) {
      return allProductsList.slice(0, 5); // Show first 5 by default when focused
    }
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
  const totalAmount = useMemo(() => {
    const shipping = Number(shippingCharge) || 0;
    const disc = Number(discount) || 0;
    return subTotal + shipping - disc;
  }, [subTotal, shippingCharge, discount]);

  const dueAmount = useMemo(() => {
    const paid = Number(paidAmount) || 0;
    return Math.max(0, totalAmount - paid);
  }, [totalAmount, paidAmount]);

  // Handlers
  const addToCart = (product: IProduct) => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock!");
      return;
    }

    setSearchQuery(""); // Clear search
    setIsSearchFocused(false);
    
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Only ${product.stock} items available in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice,
              }
            : item,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice || 0,
          total: product.sellingPrice || 0,
        },
      ];
    });
  };

  const updateCartItem = (
    productId: string,
    field: "quantity" | "unitPrice",
    value: number,
  ) => {
    if (value < 0) return;
    
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          if (field === "quantity" && value > item.product.stock) {
            toast.error(`Only ${item.product.stock} items available in stock`);
            return item;
          }
          const updated = { ...item, [field]: value };
          updated.total = updated.quantity * updated.unitPrice;
          return updated;
        }
        return item;
      }),
    );
  };

  const removeCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleSubmit = async () => {
    try {
      if (!customerPhone || !customerName) {
        toast.error("Customer Name and Phone are required");
        return;
      }
      if (cart.length === 0) {
        toast.error("Please add at least one product to the order");
        return;
      }
      if (Number(paidAmount) > totalAmount) {
        toast.error("Paid amount cannot be greater than total amount");
        return;
      }

      const payload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
          address: customerAddress,
        },
        items: cart.map((item) => ({
          product: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        subTotal,
        discount: Number(discount) || 0,
        tax: 0,
        shippingCharge: Number(shippingCharge) || 0,
        totalAmount,
        paidAmount: Number(paidAmount) || 0,
        paymentMethod: paymentMethod as SalePaymentMethod,
        courierDetails: courierName ? `${courierName}${trackingId ? ` - Tracking: ${trackingId}` : ''}` : "",
        note,
      };

      await createSale(payload).unwrap();
      toast.success("Order created successfully!");
      router.push("/dashboard/super-admin/sales");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "data" in error) {
        const err = error as { data?: { message?: string } };
        toast.error(err.data?.message || "Failed to create order");
      } else {
        toast.error("Failed to create order");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/super-admin/sales"
            className="flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Create New Order</h1>
        </div>
        <div className="flex gap-3">
          <CustomButton
            variant="outline"
            onClick={() => router.push("/dashboard/super-admin/sales")}
            btnText="Cancel"
          />
          <CustomButton
            onClick={handleSubmit}
            loading={isSubmitting}
            className="flex items-center"
            btnText="Save Order"
          >
            <Save className="w-4 h-4 mr-2" />
          </CustomButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Products & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Search Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
                Add Products
              </h2>
              <CustomButton
                variant="outline"
                onClick={() => setIsProductModalOpen(true)}
                className="text-xs py-1.5 h-auto"
                btnText="New Product"
              >
                <Plus className="w-3 h-3 mr-1" />
              </CustomButton>
            </div>

            <div className="relative" ref={searchContainerRef}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-primary focus:border-primary sm:text-sm bg-slate-50"
                placeholder="Search products by name, SKU or barcode (e.g. Airpods Pro)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />

              {/* Search Results Dropdown */}
              {isSearchFocused && searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                  {filteredProducts.length > 0 ? (
                    <ul className="max-h-60 overflow-y-auto">
                      {filteredProducts.map((product) => (
                        <li
                          key={product.id}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center"
                          onClick={() => addToCart(product)}
                        >
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              Stock: {product.stock} {product.unit}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            ৳ {product.sellingPrice}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No products found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cart Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Product Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider w-16">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {cart.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-slate-500"
                      >
                        <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm">No products added yet.</p>
                        <p className="text-xs mt-1">
                          Search and add products to start creating an order.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.product.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">
                            {item.product.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Available: {item.product.stock}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="0"
                            className="w-24 px-2 py-1 border border-slate-300 rounded focus:ring-primary focus:border-primary sm:text-sm"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCartItem(
                                item.product.id,
                                "unitPrice",
                                val === "" ? ("" as unknown as number) : Math.max(0, Number(val)),
                              )
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            className="w-20 px-2 py-1 border border-slate-300 rounded focus:ring-primary focus:border-primary sm:text-sm"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCartItem(
                                item.product.id,
                                "quantity",
                                val === "" ? ("" as unknown as number) : Math.max(1, Number(val)),
                              )
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                          ৳ {item.total.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => removeCartItem(item.product.id)}
                            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
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

        {/* Right Column: Customer & Checkout */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-primary" />
              Customer Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01700000000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Customer Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="customer@email.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Full Address"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Courier Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Courier info
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Courier Name
                </label>
                <CustomDropdown
                  options={[
                    { value: "", label: "Select Courier" },
                    { value: "Pathao", label: "Pathao" },
                    { value: "Steadfast", label: "Steadfast" },
                    { value: "RedX", label: "RedX" },
                    { value: "SA Paribahan", label: "SA Paribahan" },
                    { value: "Sundarban", label: "Sundarban" },
                    { value: "Other", label: "Other" },
                  ]}
                  value={courierName}
                  onChange={(val) => setCourierName(val)}
                  placeholder="Select Courier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tracking ID / Memo No
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123456789"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Payment & Summary Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
              <Receipt className="w-5 h-5 mr-2 text-primary" />
              Order Summary
            </h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Subtotal:</span>
                <span className="font-semibold text-slate-900">৳ {subTotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Shipping (+):</span>
                <input
                  type="number"
                  min="0"
                  className="w-24 px-2 py-1 border border-slate-300 rounded text-right text-sm"
                  value={shippingCharge === 0 ? "" : shippingCharge}
                  onChange={(e) => {
                    const val = e.target.value;
                    setShippingCharge(val === "" ? "" : Math.max(0, Number(val)));
                  }}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-sm">Discount (-):</span>
                <input
                  type="number"
                  min="0"
                  className="w-24 px-2 py-1 border border-slate-300 rounded text-right text-sm"
                  value={discount === 0 ? "" : discount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDiscount(val === "" ? "" : Math.max(0, Number(val)));
                  }}
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                <span className="text-slate-800 font-bold">Total Amount:</span>
                <span className="text-xl font-bold text-primary">৳ {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center text-sm">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment (Advance)
              </h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Paid Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">৳</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                    value={paidAmount === 0 ? "" : paidAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPaidAmount(val === "" ? "" : Math.max(0, Number(val)));
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Payment Method
                </label>
                <CustomDropdown
                  options={[
                    { value: "CASH", label: "Cash" },
                    { value: "MOBILE_BANKING", label: "Mobile Banking (bKash/Nagad)" },
                    { value: "BANK", label: "Bank Transfer" },
                    { value: "COD", label: "Cash on Delivery (COD)" },
                    { value: "OTHER", label: "Other" },
                  ]}
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val as SalePaymentMethod)}
                  placeholder="Select Payment Method"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center border border-slate-100">
                <span className="text-slate-600 font-medium">Due Balance:</span>
                <span className={`font-bold ${dueAmount > 0 ? "text-red-500" : "text-emerald-500"}`}>
                  ৳ {dueAmount.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
               <label className="block text-xs font-medium text-slate-500 mb-1">
                  Order Note (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any special instructions..."
                />
            </div>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </div>
  );
}
