'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bike } from 'lucide-react';
import { OverviewCard } from './overview-card';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';

export function ActiveRentalsCard() {
  const [activeRentals, setActiveRentals] = useState(0);
  const [loading, setLoading] = useState(true);
  const { selectedBranchId, role } = useAuth();

  useEffect(() => {
    let q = query(collection(db, 'invoices'), where('status', 'in', ['RENTED', 'OVERTIME']));

    if (selectedBranchId && role !== 'owner' && role !== 'developer') {
        q = query(q, where('branchId', '==', selectedBranchId));
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        setActiveRentals(snapshot.size);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching active rentals:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedBranchId, role]);

  if (loading) {
      return (
          <OverviewCard
              title="Rental Aktif"
              value={<Skeleton className="h-8 w-12" />}
              description={<Skeleton className="h-4 w-24" />}
              icon={Bike}
          />
      )
  }

  return (
    <OverviewCard
      title="Rental Aktif"
      value={activeRentals.toString()}
      description="Jumlah unit yang sedang disewa."
      icon={Bike}
    />
  );
}
