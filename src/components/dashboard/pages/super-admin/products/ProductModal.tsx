"use client";
import CategoryModal from "@/components/dashboard/pages/super-admin/categories/CategoryModal";
import BarcodeScannerInput from "@/components/shared/BarcodeScannerInput";
import CustomButton from "@/components/shared/CustomButton";
import { CustomDropdown } from "@/components/shared/CustomDropdown";
import ImageUploader, { ImageItem } from "@/components/shared/ImageUploader";
import ProfitCalculatorInput from "@/components/shared/ProfitCalculatorInput";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetCategoriesQuery } from "@/redux/api/category/categoryApi";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/redux/api/product/productApi";
import { selectUser } from "@/redux/features/user/authSlice";
import { useAppSelector } from "@/redux/hook";
import { IProduct } from "@/types/global";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Schema for frontend validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),

  buyingPrice: z.number().min(0, "Buying price must be at least 0"),
  sellingPrice: z.number().min(0, "Selling price must be at least 0"),
  discountPrice: z.number().optional(),
  tax: z.number().optional(),

  stock: z.number().min(0, "Stock cannot be negative"),
  alertQuantity: z.number().optional(),
  unit: z.string().optional(),

  sku: z.string().optional(),
  barcode: z.string().optional(),

  images: z.array(z.string()).optional(),

  status: z.string().optional(),
  tags: z.array(z.string()).optional(),

  warrantyType: z.string().optional(),
  warrantyPeriod: z.string().optional(),
  isReturnable: z.boolean().optional(),
  returnWindow: z.string().optional(),

  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: IProduct | null;
}

export default function ProductModal({
  isOpen,
  onClose,
  product,
}: ProductModalProps) {
  const isEditing = !!product;

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const user = useAppSelector(selectUser);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const hasCategoryViewPermission =
    isSuperAdmin || (user?.permissions || []).includes("categories:view");

  const {
    data: categoriesData,
    refetch: refetchCategories,
    isFetching: isFetchingCategories,
  } = useGetCategoriesQuery(undefined, {
    skip: !hasCategoryViewPermission,
  });

  const categories = categoriesData?.data || [];

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const isLoading = isCreating || isUpdating || isUploadingImages;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      brand: "",
      buyingPrice: 0,
      sellingPrice: 0,
      discountPrice: 0,
      tax: 0,
      stock: 0,
      alertQuantity: 5,
      unit: "pcs",
      sku: "",
      barcode: "",
      images: [],
      status: "ACTIVE",
      tags: [],
    },
  });

  const buyingPrice = useWatch({ control, name: "buyingPrice" }) as number;
  const sellingPrice = useWatch({ control, name: "sellingPrice" }) as number;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          description: product.description || "",
          category:
            product.category.id || (product.category as unknown as string), // Handle string/object ID cases
          brand: product.brand || "",
          buyingPrice: product.buyingPrice,
          sellingPrice: product.sellingPrice,
          discountPrice: product.discountPrice || 0,
          tax: product.tax || 0,
          stock: product.stock,
          alertQuantity: product.alertQuantity,
          unit: product.unit,
          sku: product.sku || "",
          barcode: product.barcode || "",
          images: [],
          status: product.status,
          tags: product.tags || [],
          warrantyType: product.warrantyType || "",
          warrantyPeriod: product.warrantyPeriod || "",
          isReturnable: product.isReturnable ?? true,
          returnWindow: product.returnWindow || "",
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
          metaKeywords: product.metaKeywords || "",
        });

        setTimeout(() => {
          setImageItems(
            (product.images || []).map((url: string) => ({
              id: Math.random().toString(36).substring(2, 9),
              type: "url",
              url,
            })),
          );
        }, 0);
      } else {
        reset({
          name: "",
          description: "",
          category: "",
          brand: "",
          buyingPrice: 0,
          sellingPrice: 0,
          discountPrice: 0,
          tax: 0,
          stock: 0,
          alertQuantity: 5,
          unit: "pcs",
          sku: "",
          barcode: "",
          images: [],
          status: "ACTIVE",
          tags: [],
          warrantyType: "",
          warrantyPeriod: "",
          isReturnable: true,
          returnWindow: "",
          metaTitle: "",
          metaDescription: "",
          metaKeywords: "",
        });
        setTimeout(() => {
          setImageItems([]);
        }, 0);
      }
    }
  }, [isOpen, product, reset]);

  if (!isOpen) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSubmit = async (data: any) => {
    try {
      setIsUploadingImages(true);

      const filesToUpload = imageItems
        .filter((item: ImageItem) => item.type === "file")
        .map((item: ImageItem) => item.file!);
      const uploadedUrls: string[] = [];

      if (filesToUpload.length > 0) {
        for (const file of filesToUpload) {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("folder", "raantech_products");
          const res = await fetch("/api/v1/upload", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Failed to upload image");
          const resData = await res.json();
          uploadedUrls.push(resData.url);
        }
      }

      let uploadIndex = 0;
      const finalUrls = imageItems.map((item: ImageItem) => {
        if (item.type === "url") return item.url;
        return uploadedUrls[uploadIndex++];
      });

      data.images = finalUrls;
      setIsUploadingImages(false);

      if (isEditing && product) {
        const identifier = product.slug || product.id;
        await updateProduct({ slug: identifier, data }).unwrap();
        toast.success("Product updated successfully");
      } else {
        await createProduct(data).unwrap();
        toast.success("Product created successfully");
      }
      onClose();
    } catch (error: unknown) {
      setIsUploadingImages(false);
      const err = error as { data?: { message?: string }; message?: string };
      toast.error(err?.data?.message || err?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={!isLoading ? onClose : undefined}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-medium text-slate-800">
              {isEditing ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {isEditing
                ? "Update product details and inventory."
                : "Fill in the details to add a new product."}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form
            id="product-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {/* Section: Basic Info */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Product Name <span className="text-error">*</span>
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Enter product name"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                  {errors.name && (
                    <p className="text-xs text-error">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Category <span className="text-error">*</span>
                  </label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <CustomDropdown
                        options={categories.map(
                          (cat: { id?: string; name: string }) => ({
                            value:
                              cat.id ||
                              (cat as unknown as { id: string }).id ||
                              "",
                            label: cat.name,
                          }),
                        )}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a category"
                        isSearchable
                        dropdownFooter={
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                refetchCategories();
                              }}
                              disabled={isFetchingCategories}
                              className="flex items-center justify-center p-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex-1"
                            >
                              <Loader2
                                className={`w-3.5 h-3.5 mr-1.5 ${isFetchingCategories ? "animate-spin" : ""}`}
                              />
                              Refresh
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCategoryModalOpen(true);
                              }}
                              className="flex items-center justify-center p-2 text-xs font-medium text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-colors flex-1"
                            >
                              + Add New
                            </button>
                          </div>
                        }
                      />
                    )}
                  />
                  {errors.category && (
                    <p className="text-xs text-error">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Brand
                  </label>
                  <input
                    {...register("brand")}
                    placeholder="Enter brand name"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="Write a brief description..."
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Section: Pricing & Profit */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Pricing & Profit
              </h3>
              <ProfitCalculatorInput
                buyingPrice={buyingPrice}
                sellingPrice={sellingPrice}
                onBuyingPriceChange={(val) =>
                  setValue("buyingPrice", val, { shouldValidate: true })
                }
                onSellingPriceChange={(val) =>
                  setValue("sellingPrice", val, { shouldValidate: true })
                }
              />
              <div className="flex gap-4 mt-2">
                {(errors.buyingPrice || errors.sellingPrice) && (
                  <p className="text-xs text-error flex-1">
                    Prices must be valid positive numbers.
                  </p>
                )}
              </div>
            </div>

            {/* Section: Inventory & Identifiers */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Inventory & Identifiers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Stock Quantity <span className="text-error">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    placeholder="0"
                    disabled={isEditing && !isSuperAdmin}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand/20 outline-none transition-all ${isEditing && !isSuperAdmin ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : "bg-white border-border focus:border-brand"}`}
                  />
                  {errors.stock && (
                    <p className="text-xs text-error">{errors.stock.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Alert Quantity
                  </label>
                  <input
                    type="number"
                    {...register("alertQuantity", { valueAsNumber: true })}
                    placeholder="5"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Unit
                  </label>
                  <Controller
                    name="unit"
                    control={control}
                    render={({ field }) => (
                      <CustomDropdown
                        options={[
                          { value: "pcs", label: "Pieces (pcs)" },
                          { value: "kg", label: "Kilograms (kg)" },
                          { value: "ltr", label: "Liters (ltr)" },
                          { value: "box", label: "Box" },
                          { value: "pack", label: "Pack" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select a unit"
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5 md:grid-cols-1">
                  <label className="text-sm font-medium text-slate-700">
                    SKU (Stock Keeping Unit)
                  </label>
                  <input
                    {...register("sku")}
                    placeholder="e.g. PRD-001"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Barcode
                  </label>
                  <Controller
                    name="barcode"
                    control={control}
                    render={({ field }) => (
                      <BarcodeScannerInput
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Section: Warranty & Policies */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Warranty & Return Policies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Warranty Type
                  </label>
                  <Controller
                    name="warrantyType"
                    control={control}
                    render={({ field }) => (
                      <CustomDropdown
                        options={[
                          {
                            value: "Official Warranty",
                            label: "Official Warranty",
                          },
                          { value: "Shop Warranty", label: "Shop Warranty" },
                          {
                            value: "Service Warranty",
                            label: "Service Warranty",
                          },
                          {
                            value: "Replacement Warranty",
                            label: "Replacement Warranty",
                          },
                          {
                            value: "Checking Warranty",
                            label: "Checking Warranty",
                          },
                          { value: "No Warranty", label: "No Warranty" },
                          { value: "Other", label: "Other" },
                        ]}
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select warranty type"
                      />
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Warranty Period
                  </label>
                  <input
                    {...register("warrantyPeriod")}
                    placeholder="e.g., 6 Months, 1 Year"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 block mb-2">
                    Return Policy
                  </label>
                  <Controller
                    name="isReturnable"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-3 mt-2">
                        <Checkbox
                          id="isReturnable"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border border-brand/50 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
                        />
                        <label
                          htmlFor="isReturnable"
                          className="text-sm text-slate-700 font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          This product is returnable
                        </label>
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Return Window
                  </label>
                  <input
                    {...register("returnWindow")}
                    placeholder="e.g., 3 Days, 7 Days"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Section: Product Images */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Product Images
              </h3>
              <ImageUploader
                items={imageItems}
                onChange={setImageItems}
                maxFiles={5}
              />
            </div>

            {/* Section: SEO Metadata */}
            <div>
              <h3 className="text-sm font-medium text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                SEO Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Meta Title
                  </label>
                  <input
                    {...register("metaTitle")}
                    placeholder="SEO title for search engines"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Meta Description
                  </label>
                  <textarea
                    {...register("metaDescription")}
                    rows={2}
                    placeholder="Brief description for search results"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">
                    Meta Keywords
                  </label>
                  <input
                    {...register("metaKeywords")}
                    placeholder="e.g., headphones, wireless, bluetooth"
                    className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end space-x-3">
          <CustomButton
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-6"
            icon={<X className="w-4 h-4" />}
            btnText="Cancel"
          />
          <CustomButton
            type="submit"
            form="product-form"
            disabled={isLoading}
            className="px-8 min-w-[140px]"
            btnText={
              isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploadingImages ? "Uploading Images..." : "Saving..."}
                </div>
              ) : isEditing ? (
                "Update Product"
              ) : (
                "Save Product"
              )
            }
          />
        </div>
      </div>
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={null}
      />
    </div>
  );
}
