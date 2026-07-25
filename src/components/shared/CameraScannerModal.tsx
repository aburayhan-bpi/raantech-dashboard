"use client";

import {
  CameraDevice,
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import { Camera, Play, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CustomButton from "./CustomButton";
import { CustomDropdown } from "./CustomDropdown";

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
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const stopScanner = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
          scannerRef.current?.clear();
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    // Blur active element to hide keyboard on mobile
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // Fetch cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Try to select the back camera by default if it exists
          const backCamera = devices.find((d) =>
            d.label.toLowerCase().includes("back"),
          );
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setError("No cameras found on your device.");
        }
      })
      .catch(() => {
        setError(
          "Failed to get cameras. Please ensure camera permissions are granted.",
        );
      });

    return () => {
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    if (!selectedCameraId) return;

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("barcode-scanner-reader", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      }

      await scannerRef.current.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 100 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          stopScanner();
          onScan(decodedText);
          onClose();
        },
        () => {
          // Quietly ignore scan failures
        },
      );
      setIsScanning(true);
      setError(null);
    } catch {
      setError("Failed to start scanner.");
    }
  };

  const handleCameraChange = (val: string) => {
    setSelectedCameraId(val);
    if (isScanning) {
      stopScanner();
      setTimeout(() => {
        startScanner();
      }, 500); // Give it a moment to stop before restarting
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
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
        <div className="p-4 border-b border-slate-100 flex gap-2 flex-col">
          {cameras.length > 0 && (
            <CustomDropdown
              options={cameras.map((c) => ({
                label: c.label || "Unknown Camera",
                value: c.id,
              }))}
              value={selectedCameraId}
              onChange={handleCameraChange}
              placeholder="Select Camera"
            />
          )}

          <div className="flex justify-center gap-3 mt-2">
            {!isScanning ? (
              <CustomButton
                type="button"
                onClick={startScanner}
                disabled={!selectedCameraId || !!error}
                className="w-full"
                btnText={
                  <div className="flex items-center justify-center">
                    <Play className="w-4 h-4 mr-2" />
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
        <div className="p-6 bg-slate-900 min-h-62.5 flex flex-col items-center justify-center relative">
          {error ? (
            <div className="text-center p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="w-full">
              <div
                id="barcode-scanner-reader"
                className="w-full overflow-hidden rounded-lg bg-black"
              ></div>
            </div>
          )}

          {!error && isScanning && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Point your device camera at the barcode or SKU. <br /> Ensure
              there is enough light.
            </p>
          )}
          {!error && !isScanning && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Select a camera and press Start to scan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
