'use client';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DollarSign } from 'lucide-react';
import { OverviewCard } from './overview-card';
import { Skeleton } from '../ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function RevenueCard() {
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const { selectedBranchId, role } = useAuth();

  useEffect(() => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let q = query(
        collection(db, 'invoices'),
        where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
        where('status', 'in', ['RENTED', 'OVERTIME', 'DONE'])
    );

    if (selectedBranchId && role !== 'owner' && role !== 'developer') {
        q = query(q, where('branchId', '==', selectedBranchId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const totalRevenue = snapshot.docs.reduce((sum, doc) => {
            return sum + (doc.data().financial?.paidAmount || 0);
        }, 0);
        setRevenue(totalRevenue);
        setLoading(false);
    },
    (error) => {
        console.error("Error fetching revenue:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedBranchId, role]);

  if (loading) {
      return (
          <OverviewCard
              title="Pendapatan Bulan Ini"
              value={<Skeleton className="h-8 w-24" />}
              description={<Skeleton className="h-4 w-20" />}
              icon={DollarSign}
          />
      )
  }

  return (
    <OverviewCard
      title="Pendapatan Bulan Ini"
      value={formatCurrency(revenue)}
      description="Total pembayaran diterima."
      icon={DollarSign}
      variant="success"
    />
  );
}
