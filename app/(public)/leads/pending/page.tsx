
import { MailCheck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LeadPendingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <MailCheck className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Permintaan Terkirim!</CardTitle>
          <CardDescription>
            Terima kasih telah mengajukan permintaan sewa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tim kami akan segera memproses permintaan Anda dan akan menghubungi Anda melalui WhatsApp untuk tahap screening selanjutnya. Mohon tunggu kabar dari kami.
          </p>
          <Button asChild>
            <Link href="/">Kembali ke Halaman Utama</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
