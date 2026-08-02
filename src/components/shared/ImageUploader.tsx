"use client";
import { useRef, useState } from "react";
import { X, ImagePlus, GripVertical, Star } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ImageItem = {
  id: string;
  type: "url" | "file";
  url: string;
  file?: File;
};

interface ImageUploaderProps {
  items: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  maxFiles?: number;
  className?: string;
}

export default function ImageUploader({
  items,
  onChange,
  maxFiles = 5,
  className,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFiles = (files: FileList | File[]) => {
    if (items.length + files.length > maxFiles) {
      toast.error(`You can only have up to ${maxFiles} images.`);
      return;
    }

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload images only.");
        continue;
      }
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        type: "file",
        url: URL.createObjectURL(file), // local preview URL
        file,
      });
    }

    onChange([...items, ...newItems]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeaveArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropArea = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleSelectFiles(e.dataTransfer.files);
    }
  };

  const removeItem = (idToRemove: string) => {
    const itemToRemove = items.find(item => item.id === idToRemove);
    if (itemToRemove?.type === "file") {
      URL.revokeObjectURL(itemToRemove.url); // cleanup memory
    }
    onChange(items.filter(item => item.id !== idToRemove));
  };

  const setAsCover = (id: string) => {
    const itemIndex = items.findIndex((i) => i.id === id);
    if (itemIndex > 0) {
      const newItems = [...items];
      const [item] = newItems.splice(itemIndex, 1);
      newItems.unshift(item); // Move to front
      onChange(newItems);
    }
  };

  // Drag and drop reordering handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = "move";
    // For visual feedback, transparent drag image
    const dragIcon = document.createElement("div");
    e.dataTransfer.setDragImage(dragIcon, 0, 0);
  };

  const handleDragOverItem = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === id) return;

    const draggedIndex = items.findIndex(item => item.id === draggedItemId);
    const hoverIndex = items.findIndex(item => item.id === id);

    if (draggedIndex < 0 || hoverIndex < 0) return;

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(hoverIndex, 0, draggedItem);
    onChange(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div
        onDragOver={handleDragOverArea}
        onDragLeave={handleDragLeaveArea}
        onDrop={handleDropArea}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-[140px] group",
          isDragging
            ? "border-brand bg-brand/5 scale-[1.01]"
            : "border-slate-200 hover:border-brand/50 hover:bg-slate-50"
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => e.target.files && handleSelectFiles(e.target.files)}
          accept="image/*"
          multiple={maxFiles > 1}
          className="hidden"
        />
        
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
          <div className={cn(
            "p-3 rounded-full mb-3 transition-colors duration-300",
            isDragging ? "bg-brand/10" : "bg-slate-100 group-hover:bg-brand/5"
          )}>
            <ImagePlus className={cn(
              "w-6 h-6 transition-colors duration-300",
              isDragging ? "text-brand" : "text-slate-400 group-hover:text-brand"
            )} />
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">
            Click to select <span className="font-normal text-slate-500">or drag & drop</span>
          </p>
          <p className="text-xs text-slate-400">
            Up to {maxFiles} images. Drag images to reorder.
          </p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6 animate-in fade-in duration-500">
          {items.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOverItem(e, item.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm cursor-grab active:cursor-grabbing",
                draggedItemId === item.id && "opacity-50 scale-95"
              )}
            >
              <Image 
                src={item.url} 
                alt={`Preview ${i}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              
              {/* Drag Handle */}
              <div className="absolute top-2 left-2 p-1.5 bg-white/90 text-slate-400 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm backdrop-blur-sm hover:text-slate-700 hover:bg-white cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Set Cover Button */}
              {i !== 0 && (
                <button
                  type="button"
                  title="Set as Cover Image"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAsCover(item.id);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-brand hover:text-white text-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(item.id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-error hover:text-white text-slate-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md backdrop-blur-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              
              {/* Cover Badge */}
              {i === 0 && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-brand backdrop-blur-md rounded-md text-white text-[10px] text-center font-medium shadow-sm">
                  Cover Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
