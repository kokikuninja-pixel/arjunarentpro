'use client';
import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface PhotoCaptureProps {
  onCapture: (url: string) => void;
}

export function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      
      // Simulate upload and get URL
      setTimeout(() => {
        onCapture(result);
        setPreview(null);
        setIsProcessing(false);
      }, 500);
    };
    reader.readAsDataURL(file);
  };

  if (isProcessing) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
        {preview && <img src={preview} alt="Preview" className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white">Processing...</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => inputRef.current?.click()}
      className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
    >
      <Upload className="w-8 h-8 text-gray-400" />
      <span className="text-xs text-gray-500">Tambah Foto</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
    </button>
  );
}
