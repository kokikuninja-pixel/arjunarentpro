'use client';
import { Task } from '@/lib/types';

interface MapViewProps {
  tasks: Task[];
  userLocation: any;
  onTaskSelect: (task: Task) => void;
}

export function MapView({ tasks, userLocation, onTaskSelect }: MapViewProps) {
  return (
    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">Map view placeholder</p>
    </div>
  );
}
