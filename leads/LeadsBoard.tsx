'use client';

import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { Lead } from '@/lib/types';
import { LeadColumn } from './LeadColumn';
import { LeadCard } from './LeadCard';
import { updateLeadStatus } from '@/lib/actions/leads';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LeadDetailModal } from './LeadDetailModal';

type LeadStatus = Lead['status'];

const COLUMNS: { id: LeadStatus; title: string }[] = [
  { id: 'SCREENING_1', title: 'Screening 1' },
  { id: 'SCREENING_2', title: 'Screening 2' },
  { id: 'VERIFIED', title: 'Verified' },
  { id: 'REJECTED', title: 'Rejected' },
];

export function LeadsBoard() {
  const firestore = useFirestore();
  const { user, selectedBranchId, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const leadsQuery = useMemoFirebase(() => {
    if (!selectedBranchId) return null; // Jangan query jika tidak ada cabang terpilih
    
    return query(
      collection(firestore, 'leads'),
      where('branchId', '==', selectedBranchId),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, selectedBranchId]);

  const { data: allLeads, isLoading: dataLoading } = useCollection<Lead>(leadsQuery);
  const isLoading = authLoading || dataLoading;

  const leadsByColumn = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      SCREENING_1: [],
      SCREENING_2: [],
      VERIFIED: [],
      REJECTED: [],
    };
    allLeads?.forEach((lead) => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  }, [allLeads]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;

    if (!over || !over.data.current?.accepts.includes('Lead') || active.data.current?.lead.status === over.id) return;

    const activeLeadData = active.data.current?.lead as Lead;
    if (!activeLeadData) return;

    const overColumnId = over.id as LeadStatus;
    
    toast({ title: `Memindahkan lead ke ${overColumnId}...` });
    const result = await updateLeadStatus(active.id as string, overColumnId, user?.uid, user?.displayName || undefined);
    if (result.success) {
        toast({ title: 'Status lead diperbarui!' });
    } else {
        toast({ variant: 'destructive', title: 'Gagal memperbarui status', description: result.error });
    }
  }

  function handleDragStart(event: any) {
    if (event.active.data.current?.type === 'Lead') {
      setActiveLead(event.active.data.current.lead);
    }
  }

  if (isLoading) {
    return (
        <div className="flex gap-4">
            {COLUMNS.map(col => (
                <div key={col.id} className="w-1/4 p-3 bg-gray-100 rounded-lg">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <div className="space-y-2">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            ))}
        </div>
    )
  }

  if (!selectedBranchId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
        <p className="text-muted-foreground">Pilih cabang untuk melihat leads.</p>
      </div>
    );
  }

  return (
    <>
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((col) => (
          <LeadColumn
            key={col.id}
            id={col.id}
            title={col.title}
            leads={leadsByColumn[col.id] || []}
            onCardClick={(lead) => setSelectedLead(lead)}
          />
        ))}
      </div>
      
      {typeof document !== "undefined" && createPortal(
        <DragOverlay>
          {activeLead && (
            <LeadCard
              lead={activeLead}
              onSelect={() => {}}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
    
    <LeadDetailModal 
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
    />
    </>
  );
}
