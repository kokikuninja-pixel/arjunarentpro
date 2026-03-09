'use client';
import { Task, TaskType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Phone } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  showActions?: boolean;
  onStart?: () => void;
  isAvailable?: boolean;
}

const typeIcons: Record<TaskType, string> = {
  delivery: '📦',
  pickup: '📥',
  return: '🔄',
  transfer: '↔️'
};

export function TaskCard({ task, onClick, showActions, onStart, isAvailable }: TaskCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-shadow hover:shadow-md ${
        task.priority === 'urgent' ? 'border-red-300 bg-red-50' :
        task.priority === 'high' ? 'border-orange-300' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
            {typeIcons[task.type]}
          </div>
          <div>
            <h3 className="font-bold capitalize">{task.type}</h3>
            <p className="text-sm text-gray-500 line-clamp-1">{task.to.address}</p>
            <p className="text-xs text-gray-400 mt-1">
              {task.scheduledTime ? formatDistanceToNow(task.scheduledTime.toDate(), { addSuffix: true, locale: id }) : 'N/A'}
            </p>
          </div>
        </div>
        
        {isAvailable && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Ambil
          </span>
        )}
      </div>

      {showActions && task.status === 'assigned' && onStart && (
        <div className="mt-3 pt-3 border-t flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="flex-1 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Mulai
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${task.to.contactPhone}`;
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>
      )}

      {task.status === 'ongoing' && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Sedang berlangsung
          </div>
        </div>
      )}
    </div>
  );
}
