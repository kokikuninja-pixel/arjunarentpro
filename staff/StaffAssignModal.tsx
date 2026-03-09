'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react';
import { Invoice, UserProfile } from '@/lib/types';

interface StaffAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  staffUsers: UserProfile[];
  onConfirm: (data: { taskType: 'delivery' | 'pickup'; staffId: string }) => void;
}

export function StaffAssignModal({ isOpen, onClose, invoice, staffUsers, onConfirm }: StaffAssignModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskType, setTaskType] = useState<'delivery' | 'pickup'>('delivery');
  const [staffId, setStaffId] = useState<string | undefined>();

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setTaskType('delivery');
      setStaffId(undefined);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!staffId) {
      alert('Pilih staf terlebih dahulu.');
      return;
    }
    setIsSubmitting(true);
    try {
      onConfirm({ taskType, staffId });
      onClose();
    } catch (error) {
      console.error(error);
      alert('Gagal menugaskan staf.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tugaskan Staf untuk Invoice {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Pilih staf yang akan bertanggung jawab untuk tugas logistik.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Jenis Tugas</Label>
            <RadioGroup
              defaultValue="delivery"
              value={taskType}
              onValueChange={(value: 'delivery' | 'pickup') => setTaskType(value)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="r-delivery" />
                <Label htmlFor="r-delivery">Tugas Pengantaran</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="r-pickup" />
                <Label htmlFor="r-pickup">Tugas Penjemputan</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <Label>Pilih Staf</Label>
            <Select onValueChange={setStaffId} value={staffId}>
                <SelectTrigger>
                    <SelectValue placeholder="Pilih staf yang tersedia..." />
                </SelectTrigger>
                <SelectContent>
                    {staffUsers
                        .filter(u => u.role === 'driver' || u.role === 'staff')
                        .map(user => (
                            <SelectItem key={user.id} value={user.id}>
                                {user.name} ({user.role})
                            </SelectItem>
                        ))
                    }
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !staffId}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tugaskan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
