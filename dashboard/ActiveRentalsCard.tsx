'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bike } from 'lucide-react';
import { OverviewCard } from './overview-card';
import { Skeleton } from '../ui/skeleton';

interface ActiveRentalsCardProps {
  scope?: 'global' | 'branch';
  branchId?: string;
}

export function ActiveRentalsCard({ scope = 'branch', branchId }: ActiveRentalsCardProps) {
  const [activeRentals, setActiveRentals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (scope === 'branch' && !branchId) {
        setLoading(false);
        setActiveRentals(0);
        return;
    }

    setLoading(true);
    let q = query(collection(db, 'invoices'), where('status', 'in', ['RENTED', 'OVERTIME']));

    if (scope === 'branch' && branchId) {
        q = query(q, where('branchId', '==', branchId));
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
  }, [branchId, scope]);

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
