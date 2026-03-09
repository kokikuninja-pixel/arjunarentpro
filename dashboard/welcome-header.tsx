'use client';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export function WelcomeHeader() {
  const { user, selectedBranchId } = useAuth();
  const newInvoiceHref = selectedBranchId ? `/invoices/new?branch=${selectedBranchId}` : '/branches';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {user?.name.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p className="text-muted-foreground">
          Berikut adalah ringkasan operasional Anda hari ini.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href={newInvoiceHref}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Buat Invoice
          </Link>
        </Button>
      </div>
    </div>
  );
}
