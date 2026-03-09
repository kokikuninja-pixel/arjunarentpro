'use client';

import { SortableContext } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import type { Lead } from '@/lib/types';
import { LeadCard } from './LeadCard';
import { useMemo } from 'react';
import { ScrollArea } from '../ui/scroll-area';

interface LeadColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  onCardClick: (lead: Lead) => void;
}

export function LeadColumn({ id, title, leads, onCardClick }: LeadColumnProps) {
  const { setNodeRef } = useDroppable({ id, data: { type: 'Column', accepts: ['Lead'] } });
  const leadIds = useMemo(() => leads.map(l => l.id), [leads]);

  return (
    <div className="w-full md:w-[300px] flex-shrink-0 h-full">
        <div className="bg-gray-100 rounded-lg flex flex-col h-full">
            <h3 className="font-bold text-gray-800 p-3 border-b border-gray-200">{title} ({leads.length})</h3>
            <ScrollArea className="flex-1">
                <div ref={setNodeRef} className="p-3 space-y-2 min-h-24">
                    <SortableContext items={leadIds}>
                    {leads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} onSelect={() => onCardClick(lead)} />
                    ))}
                    </SortableContext>
                </div>
            </ScrollArea>
        </div>
    </div>
  );
}
