"use client";

import { useState, useRef } from "react";
import { ScanBarcode, Keyboard, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import CameraScannerModal from "./CameraScannerModal";

interface BarcodeScannerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function BarcodeScannerInput({
  value,
  onChange,
  placeholder = "Scan or type barcode/SKU",
  className,
  disabled = false,
}: BarcodeScannerInputProps) {
  const [isScannerMode, setIsScannerMode] = useState(true);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Removed auto-focus to prevent modal from scrolling to middle on open

  return (
    <div className={cn("relative flex items-center w-full", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ScanBarcode className={cn("w-5 h-5", isScannerMode ? "text-brand" : "text-slate-400")} />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 pr-12 py-2.5 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all",
          disabled && "opacity-50 cursor-not-allowed bg-slate-50"
        )}
      />

      <div className="absolute inset-y-0 right-0 flex items-center pr-1">
        <button
          type="button"
          onClick={() => setIsCameraModalOpen(true)}
          disabled={disabled}
          title="Scan using device camera"
          className="p-2 mr-1 rounded-md text-slate-500 hover:text-brand hover:bg-slate-100 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsScannerMode(!isScannerMode)}
          disabled={disabled}
          title={isScannerMode ? "Switch to manual typing" : "Switch to physical scanner mode"}
          className="p-2 rounded-md text-slate-500 hover:text-brand hover:bg-slate-100 transition-colors"
        >
          {isScannerMode ? (
            <Keyboard className="w-4 h-4" />
          ) : (
            <ScanBarcode className="w-4 h-4" />
          )}
        </button>
      </div>

      {isScannerMode && (
        <div className="absolute -bottom-5 left-0 text-[10px] text-brand/80 font-medium">
          Ready for barcode scanner
        </div>
      )}

      <CameraScannerModal 
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onScan={(decodedText) => {
          onChange(decodedText);
          setIsScannerMode(false); // Switch to manual so they see the populated value easily without it being wiped by physical scanner by accident
        }}
      />
    </div>
  );
}
