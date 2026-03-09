'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { Unit, Branch } from '@/lib/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createActivityLog } from '@/lib/actions/logging';
import { DatePicker } from '../ui/date-picker';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const editUnitSchema = z.object({
  plateNumber: z.string().min(3, { message: 'Nomor plat diperlukan.' }),
  brand: z.string().min(3, { message: 'Brand unit diperlukan.' }),
  model: z.string().min(3, { message: 'Model unit diperlukan.' }),
  branchId: z.string({ required_error: 'Cabang harus dipilih.' }),
  dailyRate: z.coerce.number().min(0),
  purchasePrice: z.coerce.number().min(0).optional(),
  purchaseDate: z.date().optional(),
  imeiGps: z.string().optional(),
  noSimCard: z.string().optional(),
  currentKm: z.coerce.number().min(0).optional(),
  lastOilChangeKm: z.coerce.number().min(0).optional(),
  pajakStnkDate: z.date().optional(),
});

type EditUnitFormValues = z.infer<typeof editUnitSchema>;

interface EditUnitDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  unit: Unit | null;
  branches: Branch[];
}

export function EditUnitDialog({ isOpen, onOpenChange, unit, branches }: EditUnitDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<EditUnitFormValues>({
    resolver: zodResolver(editUnitSchema),
  });

  useEffect(() => {
    if (unit) {
      form.reset({
        plateNumber: unit.plateNumber,
        brand: unit.brand,
        model: unit.model,
        branchId: unit.branchId,
        dailyRate: unit.dailyRate,
        imeiGps: unit.imeiGps || '',
        noSimCard: unit.noSimCard || '',
        currentKm: unit.currentKm || 0,
        lastOilChangeKm: unit.lastOilChangeKm || 0,
        pajakStnkDate: unit.pajakStnkDate?.toDate(),
        purchasePrice: unit.purchasePrice,
        purchaseDate: unit.purchaseDate?.toDate(),
      });
    }
  }, [unit, form]);

  const onSubmit = async (data: EditUnitFormValues) => {
    if (!user || !unit) return;
    setIsSubmitting(true);
    
    const nextOilChangeKm = (data.lastOilChangeKm || 0) + 3000; // Recalculate

    try {
      const payload: { [key: string]: any } = { ...data };
      // Sanitize the payload to remove undefined fields which Firestore doesn't support
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      const unitRef = doc(db, 'units', unit.id);
      await updateDoc(unitRef, {
        ...payload,
        nextOilChangeKm,
        updatedAt: serverTimestamp(),
      });

      await createActivityLog({
        userId: user.uid,
        message: `mengubah data unit: ${data.plateNumber}`,
        targetType: 'unit',
        targetId: unit.id,
      });

      toast({ title: 'Unit Berhasil Diperbarui' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating unit:', error);
      toast({ variant: 'destructive', title: 'Gagal Memperbarui Unit' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !unit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Unit: {unit.plateNumber}</DialogTitle>
          <DialogDescription>Perbarui detail unit motor ini.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
             <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger>Informasi Utama</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <FormField control={form.control} name="plateNumber" render={({ field }) => ( <FormItem><FormLabel>Nomor Plat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="model" render={({ field }) => ( <FormItem><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        </div>
                        <FormField control={form.control} name="branchId" render={({ field }) => ( <FormItem><FormLabel>Cabang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem> )}/>
                        <FormField control={form.control} name="dailyRate" render={({ field }) => ( <FormItem><FormLabel>Harga Sewa/Hari (Rp)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Informasi Tambahan</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem><FormLabel>Harga Beli</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Tanggal Beli</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )}/>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="imeiGps" render={({ field }) => ( <FormItem><FormLabel>IMEI GPS</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
                            <FormField control={form.control} name="noSimCard" render={({ field }) => ( <FormItem><FormLabel>No. SIM Card</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem> )}/>
                         </div>
                          <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="currentKm" render={({ field }) => ( <FormItem><FormLabel>KM Saat Ini</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                             <FormField control={form.control} name="lastOilChangeKm" render={({ field }) => ( <FormItem><FormLabel>KM Ganti Oli Terakhir</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                         </div>
                         <FormField control={form.control} name="pajakStnkDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Tanggal Pajak STNK</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )}/>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
