'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertTriangle } from 'lucide-react';
import { OverviewCard } from './overview-card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import type { Invoice } from '@/lib/types';

export function ActiveDebtsCard() {
  const [debtData, setDebtData] = useState<{ count: number, total: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Query for potentially active invoices to avoid fetching the entire collection
    const q = query(collection(db, 'invoices'), where('status', 'in', ['DRAFT', 'BOOKING', 'RENTED', 'OVERTIME', 'DONE']));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const invoicesWithDebt = snapshot.docs
          .map(doc => doc.data() as Invoice)
          .filter(inv => inv.financial?.remainingBalance > 0);
        
        const count = invoicesWithDebt.length;
        const total = invoicesWithDebt.reduce((sum, inv) => sum + (inv.financial.remainingBalance || 0), 0);

        setDebtData({ count, total });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching active debts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
        <OverviewCard
            title="Piutang Aktif"
            value={<Skeleton className="h-8 w-12" />}
            description={<Skeleton className="h-4 w-32" />}
            icon={AlertTriangle}
            variant="destructive"
        />
    )
  }

  return (
    <OverviewCard
      title="Piutang Aktif"
      value={debtData?.count.toString() ?? '0'}
      description={
        <span>
            Total <span className="font-semibold">{formatCurrency(debtData?.total)}</span> dari {debtData?.count} invoice.
        </span>
      }
      icon={AlertTriangle}
      variant={(debtData?.count ?? 0) > 0 ? "destructive" : "default"}
    />
  );
}
