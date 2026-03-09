'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { InvoiceWizard } from '@/components/invoices/wizard/InvoiceWizard';
import { useBranches } from '@/features/branches/hooks/use-branches';
import { notFound } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function BookingRequestPage() {
  const searchParams = useSearchParams();
  const branchCode = searchParams.get('branch');

  const { data: branches, isLoading } = useBranches({ onlyActive: true });
  const branch = useMemo(
    () => branches?.find((b) => b.code === branchCode),
    [branches, branchCode]
  );
  
  const [step, setStep] = useState(1);

  if (!branchCode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Silakan pilih cabang terlebih dahulu dari halaman utama.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!branch) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Form Pemesanan</h1>
          <p className="text-muted-foreground mt-2">
            {branch.name} - {branch.address}
          </p>
        </div>

        <InvoiceWizard 
          branchId={branch.id}
          branches={branches || []}
          onSubmitted={() => {
            // handle submission
          }}
          isPublic={true}
        />
      </div>
    </div>
  );
}
