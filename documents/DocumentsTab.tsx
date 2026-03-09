'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, Download, Eye, MoreVertical, Trash2, XCircle } from 'lucide-react';
import type { Invoice, CustomerDocument } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { v4 as uuidv4 } from 'uuid';

// Helper component, assuming it's co-located or imported
function SectionCard({ title, icon: Icon, children, className = '' }: { title: string, icon: React.ElementType, children: React.ReactNode, className?: string }) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
        <div className="p-4 border-b">
          <h3 className="font-semibold flex items-center gap-2">
            <Icon className="w-5 h-5 text-gray-400" />
            {title}
          </h3>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    );
}

// Helper icon
const FileText = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);

interface DocumentsTabProps {
  invoice: Invoice | null;
  onAddDocument: () => void;
  onDeleteDocument: (document: CustomerDocument) => void;
  onVerifyDocument: (document: CustomerDocument) => void;
}

export function DocumentsTab({ invoice, onAddDocument, onDeleteDocument, onVerifyDocument }: DocumentsTabProps) {
  const documents = invoice?.documents || [];
  const [previewDoc, setPreviewDoc] = useState<CustomerDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<CustomerDocument | null>(null);

  return (
    <>
    <SectionCard title="Dokumen Jaminan" icon={FileText}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {documents.map((doc: CustomerDocument, index: number) => (
          <div key={doc.id || uuidv4()} className="bg-gray-50 rounded-lg overflow-hidden group border">
            <button onClick={() => setPreviewDoc(doc)} className="w-full aspect-[4/3] relative block">
              <img src={doc.photoUrl} alt={doc.name || doc.type} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </button>
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium uppercase px-2 py-0.5 bg-gray-200 rounded">
                  {doc.type}
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewDoc(doc)}><Eye className="mr-2 h-4 w-4"/>Lihat Penuh</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onVerifyDocument(doc)}>
                            {doc.verified ? <XCircle className="mr-2 h-4 w-4 text-yellow-600"/> : <CheckCircle className="mr-2 h-4 w-4 text-green-600"/>}
                            {doc.verified ? 'Batal Verifikasi' : 'Verifikasi'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDocToDelete(doc)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                            <Trash2 className="mr-2 h-4 w-4"/>Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm font-medium truncate">{doc.name}</p>
              {doc.verified && (
                  <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3 h-3" />
                    Terverifikasi
                  </span>
                )}
            </div>
          </div>
        ))}
        
        <button onClick={onAddDocument} className="aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-gray-400 text-gray-500">
          <Camera className="w-8 h-8" />
          <span className="text-sm">Tambah Dokumen</span>
        </button>
      </div>
    </SectionCard>
    
    <Dialog open={!!previewDoc} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl p-2">
            <DialogHeader className="sr-only">
              <DialogTitle>Pratinjau Dokumen: {previewDoc?.name}</DialogTitle>
              <DialogDescription>Gambar ukuran penuh dari dokumen {previewDoc?.name}.</DialogDescription>
            </DialogHeader>
            <img src={previewDoc?.photoUrl} alt={previewDoc?.name || ''} className="w-full h-auto max-h-[85vh] object-contain rounded-md" />
        </DialogContent>
    </Dialog>

    <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                    Anda yakin ingin menghapus dokumen "{docToDelete?.name}" secara permanen? Aksi ini tidak dapat dibatalkan.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={() => {
                        if (docToDelete) onDeleteDocument(docToDelete);
                        setDocToDelete(null);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                    Ya, Hapus
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
