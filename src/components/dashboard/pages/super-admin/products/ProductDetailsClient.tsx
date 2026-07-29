"use client";

import React from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useGetProductBySlugQuery } from "@/redux/api/product/productApi";
import { ArrowLeft, Package, Edit2, Tag, Calendar, User, DollarSign, Activity, Image as ImageIcon } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function ProductDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const pathname = usePathname();
  const basePath = pathname.split('/').slice(0, 3).join('/');

  const { data, isLoading, isError } = useGetProductBySlugQuery(slug);
  const product = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-1 rounded-xl" />
          <Skeleton className="h-96 md:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-700">Product Not Found</h2>
        <p className="text-slate-500 mt-2">The product you are looking for does not exist or has been deleted.</p>
        <CustomButton className="mt-6" onClick={() => router.push(`${basePath}/products`)} btnText="Back to Products" />
      </div>
    );
  }

  const profit = product.sellingPrice - product.buyingPrice;
  const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push(`${basePath}/products`)}
            className="p-2 bg-white rounded-lg border border-border text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {product.name}
              {product.isDeleted && (
                <span className="px-2 py-0.5 text-xs font-medium bg-error/10 text-error rounded-full">
                  Deleted (In Trash)
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> {product.category.name}
              <span className="text-slate-300">|</span>
              SKU: <span className="font-mono text-slate-700">{product.sku || "N/A"}</span>
            </p>
          </div>
        </div>
        
        <CustomButton variant="outline" onClick={() => router.push(`${basePath}/products`)} btnText={
          <div className="flex items-center">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Product
          </div>
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Images */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-border p-4 shadow-sm overflow-hidden">
            <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
              {product.images && product.images.length > 0 ? (
                <Image 
                  src={product.images[0]} 
                  alt={product.name} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-slate-400">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-sm">No Image Provided</span>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border border-border">
                    <Image src={img} alt={`Preview ${idx+1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Audit Info */}
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-brand" />
              System Info
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 flex items-center"><User className="w-3.5 h-3.5 mr-1.5"/> Created By</span>
                <span className="font-medium text-slate-800">{product.createdBy.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5"/> Created At</span>
                <span className="font-medium text-slate-800">{format(new Date(product.createdAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 flex items-center"><Calendar className="w-3.5 h-3.5 mr-1.5"/> Last Updated</span>
                <span className="font-medium text-slate-800">{format(new Date(product.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pricing & Profit */}
          <div className="bg-white rounded-xl border border-border p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <DollarSign className="w-32 h-32" />
            </div>
            
            <h3 className="font-semibold text-slate-800 mb-6 relative z-10">Pricing & Profit Analysis</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              <div>
                <p className="text-sm text-slate-500 mb-1">Buying Price</p>
                <p className="text-2xl font-bold text-slate-800">৳{product.buyingPrice}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Selling Price</p>
                <p className="text-2xl font-bold text-brand">৳{product.sellingPrice}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Profit Unit</p>
                <p className={cn("text-2xl font-bold", profit < 0 ? "text-error" : "text-success")}>
                  {profit > 0 ? "+" : ""}৳{profit}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Margin</p>
                <p className={cn("text-2xl font-bold", margin < 0 ? "text-error" : "text-success")}>
                  {margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Details & Inventory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Inventory Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Stock</span>
                  <span className={cn(
                    "text-xl font-bold",
                    product.stock === 0 ? "text-error" : 
                    product.stock <= product.alertQuantity ? "text-warning" : "text-success"
                  )}>
                    {product.stock} <span className="text-sm font-normal text-slate-500">{product.unit}</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Alert Quantity</span>
                  <span className="font-medium text-slate-800">{product.alertQuantity} {product.unit}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                  <span className="text-slate-500">Barcode</span>
                  <span className="font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded">
                    {product.barcode || "N/A"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">
                Additional Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-slate-500 block mb-1">Status</span>
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full",
                    product.status === 'ACTIVE' && "bg-success/10 text-success",
                    product.status === 'DRAFT' && "bg-slate-100 text-slate-700",
                    product.status === 'OUT_OF_STOCK' && "bg-error/10 text-error",
                    product.status === 'DISCONTINUED' && "bg-warning/10 text-warning"
                  )}>
                    {product.status}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm text-slate-500 block mb-1">Brand</span>
                  <span className="font-medium text-slate-800">{product.brand || "N/A"}</span>
                </div>
                
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {product.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Description */}
          {product.description && (
            <div className="bg-white rounded-xl border border-border p-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">Product Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
