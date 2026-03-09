'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, doc, updateDoc, writeBatch } from 'firebase/firestore';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { Unit, Branch } from '@/lib/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { createActivityLog } from '@/lib/actions/logging';
import { syncUnitStatus } from '@/ai/flows/unit-status-sync-flow';

const maintenanceLogSchema = z.object({
  unitId: z.string({ required_error: 'Unit harus dipilih.' }),
  date: z.date({ required_error: 'Tanggal servis harus diisi.' }),
  type: z.enum(['Ganti Oli', 'Servis Rem', 'Ganti Ban', 'Lainnya'], { required_error: 'Jenis servis harus dipilih.' }),
  cost: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().min(0, 'Biaya harus angka positif')),
  mechanic: z.string().min(2, 'Nama mekanik diperlukan.'),
  notes: z.string().min(5, 'Catatan diperlukan, min. 5 karakter.'),
});

type LogFormValues = z.infer<typeof maintenanceLogSchema>;

interface AddMaintenanceLogDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  units: Unit[];
  branches: Branch[];
  defaultUnitId?: string;
}

export function AddMaintenanceLogDialog({ isOpen, onOpenChange, units, branches, defaultUnitId }: AddMaintenanceLogDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { selectedBranchId, user } = useAuth();

  const form = useForm<LogFormValues>({
    resolver: zodResolver(maintenanceLogSchema),
    defaultValues: {
      unitId: undefined,
      date: new Date(),
      type: undefined,
      cost: 0,
      mechanic: 'Mekanik Internal',
      notes: '',
    },
  });
  
  useEffect(() => {
    if (isOpen) {
      form.reset({
        unitId: defaultUnitId || undefined,
        date: new Date(),
        type: undefined,
        cost: 0,
        mechanic: 'Mekanik Internal',
        notes: ''
      });
    }
  }, [isOpen, defaultUnitId, form]);

  const onSubmit = async (data: LogFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const logRef = doc(collection(db, 'maintenance_logs'));
      batch.set(logRef, data);
      
      const unitRef = doc(db, 'units', data.unitId);
      const unitData = units.find(u => u.id === data.unitId);
      
      const updatePayload: any = {};
      if (data.type === 'Ganti Oli' && unitData) {
        updatePayload.lastOilChangeKm = unitData.currentKm;
        updatePayload.nextOilChangeKm = (unitData.currentKm || 0) + 3000;
      }
      if (Object.keys(updatePayload).length > 0) {
        batch.update(unitRef, updatePayload);
      }
      
      await createActivityLog({
          userId: user.uid,
          message: `mencatat servis (${data.type}) untuk unit ${unitData?.plateNumber}`,
          targetType: 'maintenance',
          targetId: logRef.id
      });

      await batch.commit();

      toast({
        title: 'Log Perawatan Ditambahkan',
        description: `Servis untuk unit telah dicatat.`,
      });

      // AI Sync
      syncUnitStatus({
          eventDescription: `A new maintenance log (${data.type}) was created for unit ${unitData?.plateNumber}.`,
          unitId: data.unitId,
      }).then(result => {
          console.log('AI Sync Result:', result);
          if (result.statusUpdated) {
              toast({
                  title: `🤖 AI Sync: ${unitData?.plateNumber}`,
                  description: `Status unit otomatis diubah menjadi '${result.newStatus}'.`
              });
          }
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding maintenance log: ', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menambah Log',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUnits = units.filter(u => !selectedBranchId || u.branchId === selectedBranchId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Log Perawatan</DialogTitle>
          <DialogDescription>Catat aktivitas servis atau perbaikan untuk sebuah unit.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="unitId" render={({ field }) => (
                <FormItem><FormLabel>Pilih Unit</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!!defaultUnitId}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih unit yang diservis..." /></SelectTrigger></FormControl>
                    <SelectContent>{filteredUnits.map((u) => (<SelectItem key={u.id} value={u.id}>{u.plateNumber} ({u.brand} {u.model})</SelectItem>))}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )}
            />
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Tanggal Servis</FormLabel><Popover>
                    <PopoverTrigger asChild><FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? (format(field.value, "PPP")) : (<span>Pilih tanggal</span>)}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl></PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus /></PopoverContent>
                  </Popover><FormMessage /></FormItem>
              )}
            />
            <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Jenis Servis</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis servis" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Ganti Oli">Ganti Oli</SelectItem>
                        <SelectItem value="Servis Rem">Servis Rem</SelectItem>
                        <SelectItem value="Ganti Ban">Ganti Ban</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                    </SelectContent>
                  </Select><FormMessage /></FormItem>
              )}
            />
             <FormField control={form.control} name="cost" render={({ field }) => (
                <FormItem><FormLabel>Total Biaya (Rp)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
             <FormField control={form.control} name="mechanic" render={({ field }) => (
                <FormItem><FormLabel>Nama Mekanik/Bengkel</FormLabel><FormControl><Input placeholder="Contoh: Budi, AHASS Cibubur" {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem><FormLabel>Catatan</FormLabel><FormControl><Textarea placeholder="Jelaskan detail pekerjaan yang dilakukan..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan Log'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
