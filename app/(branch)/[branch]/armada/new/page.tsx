
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
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
import type { Branch } from '@/lib/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createActivityLog } from '@/lib/actions/logging';
import { DatePicker } from '@/components/ui/date-picker';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter } from 'next/navigation';

const unitSchema = z.object({
  plateNumber: z.string().min(3, { message: 'Nomor plat diperlukan.' }),
  brand: z.string().min(3, { message: 'Brand unit diperlukan.' }),
  model: z.string().min(3, { message: 'Model unit diperlukan.' }),
  branchId: z.string({ required_error: 'Cabang harus dipilih.' }),
  dailyRate: z.coerce.number().min(0, { message: 'Harga sewa harus angka positif.' }),
  purchasePrice: z.coerce.number().min(0).optional(),
  purchaseDate: z.date().optional(),
  imeiGps: z.string().optional(),
  noSimCard: z.string().optional(),
  currentKm: z.coerce.number().min(0).optional(),
});

type UnitFormValues = z.infer<typeof unitSchema>;

export default function NewUnitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user, branches } = useAuth();
  const params = useParams();
  const router = useRouter();
  const branchId = params.branch as string;

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      plateNumber: '',
      brand: '',
      model: '',
      branchId: branchId ?? undefined,
      dailyRate: 100000,
      purchasePrice: undefined,
      purchaseDate: undefined,
      imeiGps: '',
      noSimCard: '',
      currentKm: 0,
    },
  });

  const onSubmit = async (data: UnitFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload: { [key: string]: any } = { ...data };
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      const docRef = await addDoc(collection(db, 'units'), {
        ...payload,
        status: 'available',
        year: new Date().getFullYear(),
        lastOilChangeKm: 0,
        nextOilChangeKm: 3000,
        pajakStnkDate: serverTimestamp(),
        qrCodeUrl: '',
        activeInvoiceId: null,
      });

      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/armada/${docRef.id}`;
      await updateDoc(docRef, { qrCodeUrl });


      await createActivityLog({
        userId: user.uid,
        message: `menambahkan unit baru: ${data.plateNumber}`,
        targetType: 'unit',
        targetId: docRef.id,
      });

      toast({
        title: 'Unit Berhasil Dibuat',
        description: `Unit "${data.brand} ${data.model}" telah ditambahkan.`,
      });
      router.push(`/${branchId}/armada`);
    } catch (error) {
      console.error('Error adding unit: ', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Menambahkan Unit',
        description: 'Terjadi kesalahan pada server. Silakan coba lagi.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold">Tambah Unit Baru</h1>
       <Card>
            <CardHeader>
                <CardTitle>Detail Unit</CardTitle>
                <CardDescription>Daftarkan unit motor baru ke dalam sistem rental Anda.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <Accordion type="multiple" defaultValue={['item-1']} className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Informasi Utama</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <FormField control={form.control} name="plateNumber" render={({ field }) => ( <FormItem><FormLabel>Nomor Plat</FormLabel><FormControl><Input placeholder="Contoh: H 1234 AB" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="brand" render={({ field }) => ( <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="Contoh: Honda" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="model" render={({ field }) => ( <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="Contoh: Vario 160" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                                </div>
                                <FormField control={form.control} name="branchId" render={({ field }) => ( <FormItem><FormLabel>Cabang</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih cabang..." /></SelectTrigger></FormControl><SelectContent>{branches.map((b) => (<SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )}/>
                                <FormField control={form.control} name="dailyRate" render={({ field }) => ( <FormItem><FormLabel>Harga Sewa/Hari (Rp)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Informasi Tambahan (Opsional)</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="purchasePrice" render={({ field }) => ( <FormItem><FormLabel>Harga Beli</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="purchaseDate" render={({ field }) => ( <FormItem className="flex flex-col"><FormLabel>Tanggal Beli</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem> )}/>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="imeiGps" render={({ field }) => ( <FormItem><FormLabel>IMEI GPS</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                                    <FormField control={form.control} name="noSimCard" render={({ field }) => ( <FormItem><FormLabel>No. SIM Card</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )}/>
                                </div>
                                <FormField control={form.control} name="currentKm" render={({ field }) => ( <FormItem><FormLabel>Kilometer Awal</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''}/></FormControl><FormMessage /></FormItem> )}/>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Batal</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Simpan Unit'}
                        </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
       </Card>
    </div>
  );
}
