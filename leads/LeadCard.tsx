'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lead } from '@/lib/types';
import { User, Bike } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CustomerRiskBadge } from '../customers/customer-risk-badge';

interface LeadCardProps {
  lead: Lead;
  onSelect: () => void;
}

export function LeadCard({ lead, onSelect }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { type: 'Lead', lead } });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  const timeAgo = lead.createdAt ? formatDistanceToNow(lead.createdAt.toDate(), { addSuffix: true, locale: id }) : '';

  const getStatusBorderColor = () => {
    switch(lead.status) {
        case 'SCREENING_1': return 'border-blue-400';
        case 'SCREENING_2': return 'border-indigo-400';
        case 'VERIFIED': return 'border-green-500';
        case 'REJECTED': return 'border-red-500';
        default: return 'border-gray-300';
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
        <button
        {...attributes}
        {...listeners}
        onClick={onSelect}
        className={cn(
            `w-full p-3 bg-white rounded-lg shadow-sm border-l-4 text-left cursor-grab active:cursor-grabbing`, 
            getStatusBorderColor(),
            isDragging && 'opacity-50 shadow-2xl'
        )}
        >
        <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-sm truncate pr-2">{lead.nama}</p>
            <CustomerRiskBadge riskLevel={lead.riskLevel} />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
            <Bike className="w-3 h-3" />
            {lead.requestMotor}
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <User className="w-3 h-3" />
            {lead.kotaAsalKTP}
        </p>
            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-400">{timeAgo}</span>
                <div className="flex -space-x-2">
                    {/* Placeholder for staff avatars */}
                </div>
            </div>
        </button>
    </div>
  );
}
