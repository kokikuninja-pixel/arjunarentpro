'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, orderBy, writeBatch, doc } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Customer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CustomerRiskBadge } from '@/components/customers/customer-risk-badge';
import Link from 'next/link';

interface CustomerListProps {
    branchId?: string;
}

export function CustomerList({ branchId }: CustomerListProps) {
  const { user, role, loading: authLoading } = useAuth();
  const firestore = useFirestore();

  const customersQuery = useMemoFirebase(() => {
    let q = query(collection(firestore, 'customers'), orderBy('nama', 'asc'));

    if (branchId) {
        q = query(q, where('branchIds', 'array-contains', branchId));
    }
    
    return q;
  }, [firestore, branchId]);
  
  const { data: customers, isLoading: dataLoading } = useCollection<Customer>(customersQuery);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { toast } = useToast();
  const canDelete = role === 'owner' || role === 'developer';
  const isLoading = authLoading || dataLoading;

  const handleSelect = (id: string, isSelected: boolean) => {
    setSelectedIds((prev) =>
      isSelected ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected && customers) {
      setSelectedIds(customers.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || !user || !canDelete) return;
    const batch = writeBatch(firestore);
    
    selectedIds.forEach((id) => {
        batch.delete(doc(firestore, 'customers', id));
    });

    try {
      await batch.commit();
      toast({ title: `${selectedIds.length} penyewa dihapus` });
      setSelectedIds([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal Menghapus' });
    }
  };

  return (
    <Card>
        <CardHeader><CardTitle>Daftar Penyewa</CardTitle><CardDescription>Kelola data semua penyewa.</CardDescription></CardHeader>
        <CardContent>
        <div className="flex items-center justify-end">
             {canDelete && selectedIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus ({selectedIds.length})</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini akan menghapus {selectedIds.length} penyewa secara permanen.</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Ya, Hapus</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </div>
        <Table>
            <TableHeader>
            <TableRow>
                {canDelete && <TableHead className="w-12"><Checkbox onCheckedChange={(checked) => handleSelectAll(!!checked)} checked={!!(customers && customers.length > 0 && selectedIds.length === customers.length)} aria-label="Select all" /></TableHead>}
                <TableHead>Nama</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Profil Risiko</TableHead>
                <TableHead>Total Sewa</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
            {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    {canDelete && <TableCell><Skeleton className="h-5 w-5" /></TableCell>}
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                </TableRow>
                ))
            ) : customers && customers.length > 0 ? (
                customers.map((customer) => (
                <TableRow key={customer.id} data-state={canDelete && selectedIds.includes(customer.id) ? "selected" : undefined}>
                    {canDelete && <TableCell><Checkbox onCheckedChange={(checked) => handleSelect(customer.id, !!checked)} checked={selectedIds.includes(customer.id)} /></TableCell>}
                    <TableCell className="font-medium hover:underline">
                    <Link href={`./${customer.id}`}>{customer.nama}</Link>
                    </TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell><CustomerRiskBadge riskLevel={customer.riskLevel} /></TableCell>
                    <TableCell>{customer.totalSewa || 0}</TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={canDelete ? 5 : 4} className="h-24 text-center">Belum ada data penyewa.</TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </CardContent>
    </Card>
  );
}
