"use client";
import { Camera, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import CustomButton from "./CustomButton";
import { CustomDropdown } from "./CustomDropdown";
import { Scanner, IDetectedBarcode, useDevices } from "@yudiel/react-qr-scanner";

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export default function CameraScannerModal({
  isOpen,
  onClose,
  onScan,
}: CameraScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const devices = useDevices();

  // Set default camera if devices load and none is selected
  useEffect(() => {
    if (devices.length > 0 && !selectedDeviceId) {
      const backCamera = devices.find((d) => d.label.toLowerCase().includes("back"));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDeviceId(backCamera ? backCamera.deviceId : devices[0].deviceId);
    }
  }, [devices, selectedDeviceId]);

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0) {
      const result = detectedCodes[0].rawValue;
      stopScanner();
      onScan(result);
      onClose();
    }
  };

  const stopScanner = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsScanning(false);
  };

  const startScanner = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setIsScanning(true);
    setError(null);
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startScanner();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand" />
            <h3 className="font-semibold text-slate-800">Scan via Camera</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Controls */}
        <div className="p-4 border-b border-slate-100 flex gap-3 flex-col">
          {devices.length > 0 && (
            <CustomDropdown
              options={devices.map((c, i) => ({
                label: c.label || `Camera ${i + 1}`,
                value: c.deviceId,
              }))}
              value={selectedDeviceId}
              onChange={(val) => setSelectedDeviceId(val)}
              placeholder="Select Camera"
            />
          )}

          <div className="flex justify-center gap-3">
            {!isScanning ? (
              <CustomButton
                type="button"
                onClick={startScanner}
                disabled={devices.length === 0}
                className="w-full"
                btnText={
                  <div className="flex items-center justify-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Camera
                  </div>
                }
              />
            ) : (
              <CustomButton
                type="button"
                onClick={stopScanner}
                variant="outline"
                className="w-full text-error border-error/20 hover:bg-error/10 hover:text-error"
                btnText={
                  <div className="flex items-center justify-center">
                    <Square className="w-4 h-4 mr-2 fill-current" />
                    Stop Camera
                  </div>
                }
              />
            )}
          </div>
        </div>

        {/* Scanner Body */}
        <div className="p-6 bg-slate-900 min-h-[350px] flex flex-col items-center justify-center relative">
          {error ? (
            <div className="text-center p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          ) : isScanning ? (
            <div className="w-full overflow-hidden rounded-lg bg-black relative">
              <Scanner
                onScan={handleScan}
                onError={(err) => setError(err.message || "Failed to start scanner")}
                constraints={{ deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined }}
                formats={[
                  "qr_code",
                  "code_128",
                  "code_39",
                  "ean_13",
                  "ean_8",
                  "upc_a",
                  "upc_e"
                ]}
                sound={false}
                components={{
                  onOff: true,
                  torch: true,
                  zoom: true,
                  finder: true,
                }}
              />
            </div>
          ) : null}

          {!error && isScanning && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Point your device camera at the barcode or SKU. <br /> Ensure
              there is enough light.
            </p>
          )}
          {!error && !isScanning && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Press Start to begin scanning.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
