"use client";

import { Icons } from "@/utils/icons";
import React, { useState } from "react";
import { toast } from "sonner";

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null; // Parent er state follow korbe
  disabled?: boolean;
}

const ImageUpload = ({
  onFileSelect,
  selectedFile,
  disabled = false,
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg"];

  const validateAndSetFile = (file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Only PNG, JPG, and JPEG files are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be under 10MB.");
      return;
    }
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === "dragover") setIsDragging(true);
    else setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  };

  return (
    <div
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-6 transition-all ${
        isDragging
          ? "border-red-500 bg-red-500/10"
          : "border-white/10 bg-white/5"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        type="file"
        id="image-upload"
        accept="image/png,image/jpg,image/jpeg"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) validateAndSetFile(file);
        }}
      />

      <div className="flex flex-col items-center text-center">
        <Icons.IoMdCloudUpload
          className={`h-9 w-9 mb-2 ${isDragging ? "text-red-500" : "text-white"}`}
        />

        <p className="text-sm font-medium text-foreground">
          Drag & drop files or click to browse
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Supported formats: PNG, JPG, JPEG
        </p>
        <p className="text-xs text-muted-foreground">
          Maximum size per file: 10MB
        </p>

        <p className="mt-3 text-xs text-muted-foreground">
          {selectedFile ? selectedFile.name : "No new file selected"}
        </p>

        <label
          htmlFor="image-upload"
          className={`mt-4 inline-flex items-center justify-center rounded-md border border-white/10 bg-white p-2 text-xs font-medium text-black transition-colors ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:bg-white/90"
          }`}
        >
          <Icons.MdOutlineFileUpload className="mr-2 h-4 w-4" />
          Upload logo
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;
