'use client';

import { useRef, useState, useActionState } from 'react';
import { submitBookingRequest, FormState } from '@/lib/actions/booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface BookingFormProps {
  bookingCode: string;
}

// A simple pending component for the form
function Pending({ pending }: { pending: boolean }) {
    if (!pending) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
    );
}

export function BookingForm({ bookingCode }: BookingFormProps) {
  const initialState: FormState = { success: false, message: '' };
  const [state, formAction] = useActionState(submitBookingRequest, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // This state will be used for file uploads later
  const [files, setFiles] = useState({
    ktp: null,
    sim: null,
    selfie: null,
  });

  if (state.success) {
    return (
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle>Pengajuan Terkirim!</CardTitle>
                <CardDescription>Terima kasih telah mengajukan sewa.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800 font-medium">
                        {state.message}
                    </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground mt-4">
                    Tim kami akan segera memverifikasi data Anda. Harap tunggu konfirmasi lebih lanjut melalui WhatsApp.
                </p>
            </CardContent>
        </Card>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6 w-full max-w-lg">
        {/* <Pending pending={pending} /> */}
        <input type="hidden" name="booking_code" value={bookingCode} />
      
      {/* Show non-field errors */}
      {!state.success && state.message && !state.errors && (
          <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
          </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>1. Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap (sesuai KTP)</Label>
            <Input id="name" name="name" required />
            {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" required />
            {state.errors?.whatsapp && <p className="text-sm text-destructive">{state.errors.whatsapp[0]}</p>}
          </div>
           <div className="space-y-2">
            <Label htmlFor="address">Alamat Singkat (Kota/Daerah)</Label>
            <Input id="address" name="address" required />
            {state.errors?.address && <p className="text-sm text-destructive">{state.errors.address[0]}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Informasi Sewa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input id="start_date" name="start_date" type="date" required />
               {state.errors?.start_date && <p className="text-sm text-destructive">{state.errors.start_date[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Selesai</Label>
              <Input id="end_date" name="end_date" type="date" required />
              {state.errors?.end_date && <p className="text-sm text-destructive">{state.errors.end_date[0]}</p>}
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea id="notes" name="notes" placeholder="Contoh: Minta helm 2, atau request jam antar." />
             {state.errors?.notes && <p className="text-sm text-destructive">{state.errors.notes[0]}</p>}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>3. Unggah Dokumen</CardTitle>
            <CardDescription>Pastikan foto jelas dan tidak buram. Ukuran file maksimal 5MB.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="ktp">Foto KTP</Label>
                <Input id="ktp" name="ktp" type="file" required accept="image/png, image/jpeg" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="sim">Foto SIM C</Label>
                <Input id="sim" name="sim" type="file" required accept="image/png, image/jpeg" />
            </div>
             <div className="space-y-2">
                <Label htmlFor="selfie">Foto Selfie dengan KTP</Label>
                <Input id="selfie" name="selfie" type="file" required accept="image/png, image/jpeg" />
            </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg">
         {/* {pending ? <Loader2 className="animate-spin" /> : 'Kirim Pengajuan'} */}
         Kirim Pengajuan
      </Button>
    </form>
  );
}
