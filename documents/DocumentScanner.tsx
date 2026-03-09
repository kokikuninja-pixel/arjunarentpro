'use client';

import { useRef, useState, useEffect } from 'react';
import { Camera, Upload, X, RotateCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentScannerProps {
  onCapture: (imageData: string) => void;
  documentType: 'ktp' | 'sim' | 'passport' | 'other';
}

export function DocumentScanner({ onCapture, documentType }: DocumentScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      toast({
        variant: 'destructive',
        title: 'Kamera Gagal',
        description: 'Pastikan Anda telah memberikan izin akses kamera.',
      });
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop());
    setStream(null);
  };
  
  useEffect(() => {
    if (!capturedImage) {
        startCamera();
    } else {
        stopCamera();
    }
    return () => stopCamera();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]);


  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
  };

  const retake = () => {
    setCapturedImage(null);
  };

  const confirm = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    
    // Simulate OCR or other processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onCapture(capturedImage);
    setCapturedImage(null); // Reset after capture
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-black rounded-lg overflow-hidden text-white">
      {!capturedImage ? (
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
            <label className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30">
              <Upload className="w-6 h-6" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={capture}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/30"
            >
              <div className="w-12 h-12 bg-white/80 rounded-full" />
            </button>
            <button
              onClick={retake}
              className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              <RotateCw className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <img src={capturedImage} alt="Captured" className="w-full aspect-video object-contain bg-gray-900" />
           {isProcessing && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col">
              <div className="animate-spin w-10 h-10 border-4 border-white/20 border-t-white rounded-full" />
              <p className="mt-2 text-sm">Memproses...</p>
            </div>
          )}
          {!isProcessing && (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
              <button
                onClick={retake}
                className="px-6 py-3 bg-red-500 text-white rounded-full flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Ulangi
              </button>
              <button
                onClick={confirm}
                className="px-6 py-3 bg-green-500 text-white rounded-full flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Gunakan
              </button>
            </div>
          )}
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
