"use client";
import React, { useState, useRef } from "react";
import { X, Upload, FileSpreadsheet, Download, AlertCircle, Loader2 } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { toast } from "sonner";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  templateUrl: string;
  importUrl: string;
  onSuccess?: () => void;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  title,
  templateUrl,
  importUrl,
  onSuccess,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        selectedFile.type === "text/csv" ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Invalid file format. Please upload a .xlsx or .csv file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (
        droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        droppedFile.type === "text/csv" ||
        droppedFile.name.endsWith(".xlsx") ||
        droppedFile.name.endsWith(".csv")
      ) {
        setFile(droppedFile);
      } else {
        toast.error("Invalid file format. Please upload a .xlsx or .csv file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(importUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Imported successfully!");
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.error || "Failed to import file.");
      }
    } catch {
      toast.error("An error occurred during import.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetAndClose = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-brand" />
            </div>
            <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          </div>
          <button
            onClick={resetAndClose}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Need a template?</p>
                <p className="text-xs text-blue-700 mt-0.5">Download the exact format required for importing.</p>
              </div>
            </div>
            <a
              href={templateUrl}
              download
              className="px-3 py-1.5 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Template
            </a>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .csv"
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-xs text-rose-500 font-medium hover:text-rose-600"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="space-y-3 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:text-brand group-hover:bg-brand/10 transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500 mt-1">XLSX or CSV files only</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3">
          <CustomButton
            type="button"
            variant="outline"
            onClick={resetAndClose}
            btnText="Cancel"
            disabled={isUploading}
          />
          <CustomButton
            onClick={handleUpload}
            variant="default"
            disabled={!file || isUploading}
            icon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            btnText="Import Data"
          />
        </div>
      </div>
    </div>
  );
}
