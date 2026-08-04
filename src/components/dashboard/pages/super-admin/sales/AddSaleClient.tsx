"use client";
import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import { useGetProductsQuery } from "@/redux/api/product/productApi";
import { useGetCustomersQuery } from "@/redux/api/customer/customerApi";
import { useCreateSaleMutation } from "@/redux/api/sale/salesApi";
import { SalePaymentMethod, SaleSource, SaleStatus } from "@/types/backend";
import { PaymentMethod, ICustomer, IProduct } from "@/types/global";
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
  Truck,
  Loader2, X
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/');

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

  // Customer Search State
  const [debouncedCustomerPhone, setDebouncedCustomerPhone] = useState("");
  const [isCustomerSearchFocused, setIsCustomerSearchFocused] = useState(false);
  const customerSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomerPhone(customerPhone);
    }, 500);
    return () => clearTimeout(handler);
  }, [customerPhone]);

  const { data: customersData, isFetching: isSearchingCustomers } = useGetCustomersQuery(
    `search=${debouncedCustomerPhone}&limit=5`,
    { skip: !debouncedCustomerPhone || debouncedCustomerPhone.length < 3 }
  );

  const customerSearchResults = customersData?.data || [];

  const selectCustomer = (customer: ICustomer) => {
    setCustomerPhone(customer.phone);
    setCustomerName(customer.name);
    if (customer.email) setCustomerEmail(customer.email);
    if (customer.address) setCustomerAddress(customer.address);
    setIsCustomerSearchFocused(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        customerSearchContainerRef.current &&
        !customerSearchContainerRef.current.contains(event.target as Node)
      ) {
        setIsCustomerSearchFocused(false);
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
  
  // Sale Source and Status
  const [source, setSource] = useState<SaleSource>("FACEBOOK");
  const [status, setStatus] = useState<SaleStatus>("PENDING");

  // Smart Sync for Direct Sale
  useEffect(() => {
    if (source === "DIRECT_MANUAL") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("COMPLETED");
    }
  }, [source]);

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
        source,
        status,
      };

      await createSale(payload).unwrap();
      toast.success("Order created successfully!");
      router.push(`${basePath}/sales`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            href={`${basePath}/sales`}
            className="flex items-center text-sm text-slate-500 hover:text-slate-700 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Create New Order</h1>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <CustomButton
            variant="outline"
            onClick={() => router.push(`${basePath}/sales`)}
            icon={<X className="w-4 h-4" />} 
            btnText="Cancel"
            className="w-1/2 sm:w-auto"
          />
          <CustomButton
            onClick={handleSubmit}
            loading={isSubmitting}
            className="w-1/2 sm:w-auto"
            icon={<Save className="w-4 h-4" />} 
            btnText="Save Order"
          />
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
              <div ref={customerSearchContainerRef} className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. 01700000000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      setIsCustomerSearchFocused(true);
                    }}
                    onFocus={() => setIsCustomerSearchFocused(true)}
                  />
                  {isSearchingCustomers && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                  )}
                </div>

                {/* Customer Search Dropdown */}
                {isCustomerSearchFocused && debouncedCustomerPhone.length >= 3 && customerSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <ul className="max-h-60 overflow-y-auto">
                      {customerSearchResults.map((customer) => (
                        <li
                          key={customer.id}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors"
                          onClick={() => selectCustomer(customer)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{customer.name}</span>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{customer.phone}</span>
                              {customer.email && <span>{customer.email}</span>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

          {/* Sale Settings */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center mb-4">
              <ShoppingCart className="w-5 h-5 mr-2 text-primary" />
              Order Source & Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Order Source
                </label>
                <CustomDropdown
                  options={[
                    { value: "FACEBOOK", label: "Facebook" },
                    { value: "WEBSITE", label: "Website" },
                    { value: "WHATSAPP", label: "WhatsApp" },
                    { value: "DIRECT_MANUAL", label: "Direct Sale / POS" },
                    { value: "OTHER", label: "Other" },
                  ]}
                  value={source}
                  onChange={(val) => setSource(val as SaleSource)}
                  placeholder="Select Source"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Order Status
                </label>
                <CustomDropdown
                  options={[
                    { value: "PENDING", label: "Pending" },
                    { value: "PROCESSING", label: "Processing" },
                    { value: "SHIPPED", label: "Shipped" },
                    { value: "DELIVERED", label: "Delivered" },
                    { value: "COMPLETED", label: "Completed" },
                    { value: "CANCELLED", label: "Cancelled" },
                  ]}
                  value={status}
                  onChange={(val) => setStatus(val as SaleStatus)}
                  placeholder="Select Status"
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
                <span className="font-medium text-slate-900">৳ {subTotal.toLocaleString()}</span>
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
              <h3 className="font-medium text-slate-800 flex items-center text-sm">
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
