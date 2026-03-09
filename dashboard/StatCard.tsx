'use client';

interface StatCardProps {
  label: string;
  value: number | string;
  isAlert?: boolean;
}

export function StatCard({ label, value, isAlert = false }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border bg-card p-4 text-card-foreground shadow-sm ${
        isAlert ? 'border-red-500/50 bg-red-50/50 text-red-900' : ''
      }`}
    >
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
