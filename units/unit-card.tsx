'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Unit, UnitStatus } from '@/lib/types';
import { Wrench, Gauge, Droplet, CalendarDays, Edit, Wifi, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { UnitStatusBadge } from './unit-status-badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu';

interface UnitCardProps {
  unit: Unit;
  onSelect: (checked: boolean) => void;
  isSelected: boolean;
  onEdit: (unit: Unit) => void;
  onStatusChange: (unitId: string, newStatus: UnitStatus) => void;
}
  
const getOilStatusColor = (km: number | undefined, nextKm: number | undefined) => {
    if (km === undefined || nextKm === undefined) return 'text-muted-foreground';
    const remaining = nextKm - km;
    if (remaining < 200) return 'text-red-500';
    if (remaining < 500) return 'text-yellow-500';
    return 'text-green-500';
};

const unitStatuses: { value: UnitStatus; label: string }[] = [
    { value: 'available', label: 'Tersedia' },
    { value: 'reserved', label: 'Dipesan' },
    { value: 'rented', label: 'Disewa' },
    { value: 'maintenance', label: 'Perawatan' },
];

export function UnitCard({ unit, onSelect, isSelected, onEdit, onStatusChange }: UnitCardProps) {
    const { branches } = useAuth();
    const branch = branches.find(b => b.id === unit.branchId);

    const formatDate = (date: any) => {
        if (!date) return '-';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }
    
    const remainingKmOli = (unit.nextOilChangeKm || 0) - (unit.currentKm || 0);

  return (
    <Card className={cn("flex flex-col overflow-hidden rounded-xl shadow-sm border transition-all duration-200", isSelected && "border-primary ring-2 ring-primary/50")}>
       <Link href={`/units/${unit.id}`} className="hover:bg-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                  <Checkbox
                      className="h-5 w-5 bg-background/50 border-border data-[state=checked]:bg-primary"
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        onSelect(!!checked);
                      }}
                      onClick={(e) => e.stopPropagation()} 
                      aria-label={`Select ${unit.plateNumber}`}
                  />
                  <div>
                      <CardTitle className="text-base font-bold tracking-tight uppercase font-mono">{unit.plateNumber}</CardTitle>
                      <CardDescription className="text-xs">{branch?.name ?? 'Memuat...'}</CardDescription>
                  </div>
              </div>
              <UnitStatusBadge status={unit.status} />
        </CardHeader>
       </Link>
      
      <CardContent className="flex-1 p-4 pt-0 space-y-3">
        {/* GPS Info */}
        <div className="space-y-1 text-xs">
            <p className="font-medium text-muted-foreground">GPS &amp; Pajak</p>
            <div className="flex justify-between items-center">
                <div className={cn("flex items-center gap-1.5 font-semibold text-muted-foreground")}>
                  <Wifi className="h-3 w-3" />
                  <span>{unit.imeiGps ? 'Terpasang' : 'Tidak Ada'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-3 w-3"/>
                    <span>Pajak: {formatDate(unit.pajakStnkDate)}</span>
                </div>
            </div>
        </div>

        <Separator />

        {/* Oil & KM Info */}
        <div className="space-y-1 text-xs">
            <p className="font-medium text-muted-foreground">Oli &amp; Kilometer</p>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                    <Gauge className="h-3 w-3"/>
                    <span>{unit.currentKm?.toLocaleString('id-ID') ?? 0} km</span>
                </div>
                <div className={cn("flex items-center gap-1.5 font-semibold", getOilStatusColor(unit.currentKm, unit.nextOilChangeKm))}>
                    <Droplet className="h-3 w-3"/>
                    <span>Sisa Oli: {remainingKmOli > 0 ? remainingKmOli.toLocaleString('id-ID') : 0} km</span>
                </div>
            </div>
             <div className="flex items-center gap-1.5 text-muted-foreground">
                <Wrench className="h-3 w-3" />
                <span>Ganti terakhir: {unit.lastOilChangeKm?.toLocaleString('id-ID')} km</span>
            </div>
        </div>

      </CardContent>

      <CardFooter className="p-2 bg-muted/50 border-t">
        <div className="w-full flex items-center justify-between">
            <Button size="sm" variant="ghost" onClick={() => onEdit(unit)}>
                <Edit className="mr-2 h-3 w-3"/> Edit
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                        Ubah Status
                        <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                {unitStatuses.map((s) => (
                    <DropdownMenuItem
                        key={s.value}
                        disabled={unit.status === s.value}
                        onSelect={() => onStatusChange(unit.id, s.value)}
                    >
                        {s.label}
                    </DropdownMenuItem>
                ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  );
}
