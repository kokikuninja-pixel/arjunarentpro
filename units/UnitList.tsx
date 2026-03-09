'use client';

import { useState, useMemo } from 'react';
import { collection, query, where, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { db } from '@/lib/firebase';
import type { Unit, UnitStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Trash2, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { EditUnitDialog } from '@/components/units/edit-unit-dialog';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { UnitCard } from '@/components/units/unit-card';
import { Input } from '@/components/ui/input';

interface UnitListProps {
  branchId?: string; // Optional: If not provided, show all (for owner)
}

export function UnitList({ branchId }: UnitListProps) {
  const { user, branches, loading: authLoading } = useAuth();
  const firestore = useFirestore();

  const unitsQuery = useMemoFirebase(() => {
    const baseQuery = collection(firestore, 'units');
    if (branchId) {
      return query(baseQuery, where('branchId', '==', branchId), orderBy('plateNumber', 'asc'));
    }
    // For global view (owner), no branch filter
    return query(baseQuery, orderBy('plateNumber', 'asc'));
  }, [firestore, branchId]);
  
  const { data: units, isLoading: dataLoading } = useCollection<Unit>(unitsQuery);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UnitStatus | 'all'>('all');
  const isLoading = authLoading || dataLoading;

  const canDelete = user?.role === 'owner' || user?.role === 'developer';

  const filteredUnits = useMemo(() => {
    return (units || []).filter(unit => 
        (statusFilter === 'all' || unit.status === statusFilter) &&
        (unit.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
         unit.model.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [units, statusFilter, searchTerm]);

  const handleEditClick = (unit: Unit) => {
    setEditingUnit(unit);
    setIsEditDialogOpen(true);
  };
  
  const handleStatusChange = async (unitId: string, newStatus: UnitStatus) => {
      try {
        await updateDoc(doc(db, 'units', unitId), { status: newStatus });
        toast({ title: "Status Diperbarui" });
      } catch (error) {
        toast({ variant: 'destructive', title: "Gagal memperbarui status" });
      }
  };

  const handleSelectUnit = (unitId: string, isSelected: boolean) => {
    setSelectedUnitIds((prev) =>
      isSelected ? [...prev, unitId] : prev.filter((id) => id !== unitId)
    );
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedUnitIds(filteredUnits.map((u) => u.id));
    } else {
      setSelectedUnitIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUnitIds.length === 0 || !user || !canDelete) return;
    const batch = writeBatch(firestore);
    
    selectedUnitIds.forEach((id) => {
        batch.delete(doc(firestore, 'units', id));
    });

    try {
      await batch.commit();
      toast({ title: `${selectedUnitIds.length} Unit Dihapus` });
      setSelectedUnitIds([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Gagal Menghapus Unit' });
    }
  };


  return (
    <>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Input 
                placeholder="Cari nopol atau model..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex items-center gap-2">
                 {selectedUnitIds.length > 0 && canDelete && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus ({selectedUnitIds.length})</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Anda yakin?</AlertDialogTitle><AlertDialogDescription>Aksi ini akan menghapus {selectedUnitIds.length} unit secara permanen.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Ya, Hapus</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline"><Filter className="mr-2 h-4 w-4"/>Filter Status</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setStatusFilter('all')}>Semua Status</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setStatusFilter('available')}>Tersedia</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setStatusFilter('rented')}>Disewa</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setStatusFilter('reserved')}>Dipesan</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setStatusFilter('maintenance')}>Perawatan</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {Array.from({length: 8}).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
            </div>
        ) : filteredUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                <div className="col-span-full flex items-center gap-2">
                    <Checkbox id="select-all" onCheckedChange={handleSelectAll} checked={units && units.length > 0 && selectedUnitIds.length === units.length} />
                    <label htmlFor="select-all" className="text-sm font-medium">Pilih Semua</label>
                </div>
                {filteredUnits.map(unit => (
                    <UnitCard 
                        key={unit.id}
                        unit={unit}
                        onSelect={(checked) => handleSelectUnit(unit.id, checked)}
                        isSelected={selectedUnitIds.includes(unit.id)}
                        onEdit={handleEditClick}
                        onStatusChange={handleStatusChange}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 text-muted-foreground">
                <p>Tidak ada unit yang cocok dengan filter Anda.</p>
            </div>
        )}
      {editingUnit && (
        <EditUnitDialog isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} unit={editingUnit} branches={branches} />
      )}
    </>
  );
}
