'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { SimpleAuth } from '@/lib/auth/simple-auth';
import { createActivityLog } from '@/lib/actions/logging';
import { RiskLevel } from '@/lib/types';

const customerSchema = z.object({
  name: z.string().min(3, { message: 'Nama pelanggan minimal 3 karakter.' }),
  whatsapp: z.string().min(10, { message: 'Nomor WhatsApp tidak valid.' }),
  ktpCity: z.string().min(3, { message: 'Kota KTP minimal 3 karakter.' }),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface AddCustomerDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddCustomerDialog({
  isOpen,
  onOpenChange,
}: AddCustomerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
      ktpCity: '',
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    const session = SimpleAuth.getSession();
    if (!session) {
        toast({ variant: 'destructive', title: 'Anda harus login untuk menambah penyewa.' });
        return;
    };
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'customers'), {
        ...data,
        riskLevel: 'low' as RiskLevel,
        suspiciousFlag: false,
        tagCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await createActivityLog({
        userId: session.uid,
        message: `menambahkan penyewa baru: ${data.name}`,
        targetType: 'customer',
        targetId: docRef.id,
      });

      toast({
        title: 'Penyewa Berhasil Ditambahkan',
        description: `"${data.name}" telah ditambahkan ke daftar penyewa.`,
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding customer: ', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menambahkan Penyewa',
        description: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Penyewa Baru</DialogTitle>
          <DialogDescription>
            Masukkan data penyewa (customer) baru.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Sesuai KTP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp</FormLabel>
                  <FormControl>
                    <Input placeholder="08..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ktpCity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kota Asal (KTP)</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Jakarta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Simpan Penyewa
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
