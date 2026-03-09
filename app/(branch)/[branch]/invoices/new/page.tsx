'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useMemoFirebase } from '@/firebase';
import { useBranches } from '@/features/branches/hooks/use-branches';
import { InvoiceWizard } from '@/components/invoices/wizard/InvoiceWizard';
import { FullPageLoader } from '@/components/invoices/FullPageLoader';
import { db } from '@/lib/firebase';
import type { Lead } from '@/lib/types';
import { format } from 'date-fns';

function NewInvoiceFlow({ branchId }: { branchId: string }) {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const { data: branches, isLoading: branchesLoading } = useBranches();
  
  const leadRef = useMemoFirebase(() => {
    return leadId ? doc(db, 'leads', leadId) : null;
  }, [leadId]);

  const { data: lead, isLoading: leadLoading } = useDoc<Lead>(leadRef);

  const [initialWizardData, setInitialWizardData] = useState<any>(null);

  useEffect(() => {
    if (lead) {
      // Transform lead data into the format the wizard expects
      const customerData = {
        name: lead.nama,
        phone1: lead.phone,
        kotaAsal: lead.kotaAsalKTP,
        domisili: lead.domisiliTinggal,
        domisiliKerja: lead.domisiliKerja,
        tujuanSewa: lead.tujuanPenggunaan,
        sumberInfo: lead.sumberInfo,
        riskScore: lead.riskScore,
        riskLevel: lead.riskLevel,
        documents: [], // Documents are handled separately in the wizard
      };
      
      // Attempt to parse schedule, but keep it simple
      const scheduleData = {
        motorRequest: lead.requestMotor,
        // The wizard will handle date selection, just pre-fill the request
      };

      setInitialWizardData({
        0: customerData,
        1: scheduleData,
      });
    } else if (!leadId) {
        setInitialWizardData({}); // Set to empty for a blank wizard
    }
  }, [lead, leadId]);
  
  const isLoading = branchesLoading || (leadId && leadLoading) || (leadId && !initialWizardData);
  
  if (isLoading) {
    return <FullPageLoader />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        {leadId ? `Buat Invoice dari Lead` : 'Buat Invoice Baru'}
      </h1>
      {leadId && lead && (
        <p className="text-muted-foreground">
            Membuat invoice untuk permintaan sewa dari <span className="font-semibold">{lead.nama}</span>.
        </p>
      )}
      
      <InvoiceWizard 
        branchId={branchId}
        branches={branches || []}
        onSubmitted={() => {
          // Redirect or show success message after submission
          // This is handled inside the wizard's submit function for now
        }}
        isPublic={false}
        initialData={initialWizardData}
      />
    </div>
  );
}


export default function NewInvoicePage({ params }: { params: { branch: string }}) {
    return (
        <Suspense fallback={<FullPageLoader />}>
            <NewInvoiceFlow branchId={params.branch} />
        </Suspense>
    );
}
