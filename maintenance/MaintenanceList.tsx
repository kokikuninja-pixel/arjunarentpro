'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MaintenanceLog } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface MaintenanceListProps {
  branchId?: string;
}

export function MaintenanceList({ branchId }: MaintenanceListProps) {
  const firestore = useFirestore();

  const logsQuery = useMemoFirebase(() => {
    let q = query(collection(firestore, 'maintenance_logs'), orderBy('date', 'desc'));
    if (branchId) {
      q = query(q, where('branchId', '==', branchId));
    }
    return q;
  }, [firestore, branchId]);

  const { data: logs, isLoading } = useCollection<MaintenanceLog>(logsQuery);

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = date.toDate ? date.toDate() : new Date(date);
    return format(d, 'dd MMM yyyy');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Jenis Servis</TableHead>
          <TableHead>Mekanik</TableHead>
          <TableHead>Catatan</TableHead>
          <TableHead className="text-right">Biaya</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
              <TableCell><Skeleton className="h-5 w-40" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
            </TableRow>
          ))
        ) : logs && logs.length > 0 ? (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{formatDate(log.date)}</TableCell>
              <TableCell>
                <div className="font-mono font-semibold">{(log.unit as any)?.plateNumber}</div>
                <div className="text-xs text-muted-foreground">{(log.unit as any)?.brand} {(log.unit as any)?.model}</div>
              </TableCell>
              <TableCell>{log.type}</TableCell>
              <TableCell>{log.mechanic}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{log.notes}</TableCell>
              <TableCell className="text-right font-mono">{formatCurrency(log.cost)}</TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">Belum ada log perawatan.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
