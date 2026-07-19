import { useCallback, useState } from "react";

interface UseAdvancedFileUploadOptions {
  accept: string[];
  maxSizeMB?: number;
  multiple?: boolean;
}

export const useAdvancedFileUpload = ({
  accept,
  maxSizeMB = 50,
  multiple = false,
}: UseAdvancedFileUploadOptions) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const maxSize = maxSizeMB * 1024 * 1024;

  const validateFiles = (incoming: File[]) => {
    for (const file of incoming) {
      if (!accept.includes(file.type)) {
        return `Only ${accept
          .map((t) => t.split("/")[1].toUpperCase())
          .join(", ")} files are allowed`;
      }

      if (file.size > maxSize) {
        return `Each file must be under ${maxSizeMB}MB`;
      }
    }
    return null;
  };

  const addFiles = (incoming: File[]) => {
    const validationError = validateFiles(incoming);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFiles((prev) => (multiple ? [...prev, ...incoming] : [incoming[0]]));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    addFiles(Array.from(selected));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetFiles = () => {
    setFiles([]);
    setError(null);
  };

  return {
    files,
    error,
    isDragging,
    handleInputChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
    resetFiles,
  };
};
