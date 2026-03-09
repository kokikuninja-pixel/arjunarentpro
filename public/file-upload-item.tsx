'use client';
import { File as FileIcon, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FileUploadItemProps {
  file: File;
  status?: 'uploading' | 'complete' | 'error';
  onRemove: () => void;
}

export function FileUploadItem({ file, status, onRemove }: FileUploadItemProps) {
  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Mengunggah...';
      case 'complete':
        return 'Unggah selesai';
      case 'error':
        return 'Gagal';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
        case 'uploading':
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case 'complete':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'error':
            return <AlertCircle className="h-4 w-4 text-destructive" />;
        default:
            return <FileIcon className="h-4 w-4 text-muted-foreground" />;
    }
  }

  const getBadgeVariant = () => {
    switch (status) {
      case 'uploading':
        return 'secondary';
      case 'complete':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  return (
    <div className="flex items-center justify-between rounded-md border border-muted p-2 text-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        {getStatusIcon()}
        <span className="truncate font-medium">{file.name}</span>
        <span className="text-muted-foreground text-xs">
          ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </span>
      </div>
      <div className="flex items-center gap-2">
        {status && (
            <Badge variant={getBadgeVariant()} className="hidden sm:inline-flex">{getStatusMessage()}</Badge>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Hapus file</span>
        </Button>
      </div>
    </div>
  );
}
