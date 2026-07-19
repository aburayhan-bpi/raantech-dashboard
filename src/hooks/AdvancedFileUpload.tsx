"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";

interface Props {
  accept: string;
  multiple?: boolean;
  files: File[];
  error: string | null;
  isDragging: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onRemove: (index: number) => void;
}

const AdvancedFileUpload = ({
  accept,
  multiple,
  files,
  error,
  isDragging,
  onInputChange,
  onDrop,
  onDragOver,
  onDragLeave,
  onRemove,
}: Props) => {
  return (
    <div>
      {/* DROP ZONE */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`rounded-lg border-2 border-dashed p-6 text-center transition ${
          isDragging
            ? "border-accent bg-accent/10"
            : "border-muted-foreground/40"
        }`}
      >
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          className="hidden"
          id="advanced-upload"
          onChange={onInputChange}
        />

        <label
          htmlFor="advanced-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <span className="text-sm text-muted-foreground">
            Drag & drop or click to upload
          </span>
        </label>
      </div>

      {/* ERROR */}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      {/* PREVIEW */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {files.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            const isImage = file.type.startsWith("image");

            return (
              <div
                key={index}
                className="relative rounded-lg border overflow-hidden"
              >
                {isImage ? (
                  <Image
                    src={previewUrl}
                    alt={file.name}
                    width={200}
                    height={150}
                    className="object-cover w-full h-28"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-28 object-cover"
                    controls
                  />
                )}

                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdvancedFileUpload;
