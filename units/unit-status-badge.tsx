'use client';

import { Badge } from "@/components/ui/badge";
import { UnitStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  UnitStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Tersedia",
    className: "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  },
  rented: {
    label: "Disewa",
    className: "bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20",
  },
  maintenance: {
    label: "Perawatan",
    className: "bg-gray-500/20 text-gray-700 border-gray-500/30 hover:bg-gray-500/30 dark:text-gray-400 dark:bg-gray-500/10 dark:border-gray-500/20",
  },
  reserved: {
    label: "Dipesan",
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20",
  },
};

export function UnitStatusBadge({ status }: { status: UnitStatus | undefined }) {
  if (!status) return null;
  const style = statusStyles[status];

  if (!style) {
    return <Badge variant="outline" className="font-semibold capitalize">{status}</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold capitalize text-xs", style.className)}
    >
      {style.label}
    </Badge>
  );
}
