'use client';

import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, CreditCard, Plane, Hotel, Hash } from 'lucide-react';
import type { Invoice, CustomerDocument } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface AddDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoice: Invoice | null;
}

const documentTypes = [
  { value: 'ktp', label: 'KTP', icon: CreditCard },
  { value: 'sim', label: 'SIM', icon: CreditCard },
  { value: 'passport', label: 'Passport', icon: FileText },
  { value: 'boarding_pass', label: 'Boarding Pass', icon: Plane },
  { value: 'hotel_voucher', label: 'Voucher Hotel', icon: Hotel },
  { value: 'social_media', label: 'Social Media', icon: Hash },
  { value: 'other', label: 'Lainnya', icon: FileText },
] as const;

type DocType = typeof documentTypes[number]['value'];

export function AddDocumentDialog({ isOpen, onOpenChange, invoice }: AddDocumentDialogProps) {
  const [uploading, setUploading] = useState<DocType | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File, type: DocType) => {
    if (!invoice) return;
    setUploading(type);

    try {
      const storageRef = ref(storage, `invoices/${invoice.id}/documents/${type}_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const newDoc: CustomerDocument = {
        id: uuidv4(),
        type,
        photoUrl: url,
        name: file.name,
        verified: false,
      };

      const invoiceRef = doc(db, 'invoices', invoice.id);
      await updateDoc(invoiceRef, {
        documents: arrayUnion(newDoc),
      });

      toast({ title: 'Dokumen Berhasil Diupload' });
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading document: ", error);
      toast({ variant: 'destructive', title: 'Upload Gagal' });
    } finally {
      setUploading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Dokumen untuk {invoice?.customerSnapshot.name}</DialogTitle>
          <DialogDescription>Pilih jenis dokumen yang akan diupload untuk invoice {invoice?.invoiceNumber}.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          {documentTypes.map((docType) => (
            <label
              key={docType.value}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, docType.value);
                }}
                disabled={!!uploading}
              />
              {uploading === docType.value ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <docType.icon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium text-center">{docType.label}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
