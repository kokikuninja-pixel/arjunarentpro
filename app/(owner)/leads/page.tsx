"use client";

import { LeadsBoard } from '@/components/leads/LeadsBoard';

export default function LeadsPage() {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold">Leads & Screening</h1>
        <p className="text-muted-foreground">
          Tinjau dan kelola permintaan sewa yang masuk.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
         <LeadsBoard />
      </div>
    </div>
  );
}