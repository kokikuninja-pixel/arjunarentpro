'use client';

import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const riskStyles: Record<
  RiskLevel,
  { label: string; className: string }
> = {
  low: {
    label: "Rendah",
    className: "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:text-green-400 dark:bg-green-500/10 dark:border-green-500/20",
  },
  medium: {
    label: "Menengah",
    className: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30 hover:bg-yellow-500/30 dark:text-yellow-400 dark:bg-yellow-500/10 dark:border-yellow-500/20",
  },
  high: {
    label: "Tinggi",
    className: "bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
  },
};

export function CustomerRiskBadge({ riskLevel }: { riskLevel: RiskLevel | undefined }) {
  if (!riskLevel) {
    return <Badge variant="outline">Belum diatur</Badge>;
  }
  
  const style = riskStyles[riskLevel];

  if (!style) {
    return <Badge variant="outline" className="capitalize">{riskLevel}</Badge>;
  }

  return (
    <Badge
      variant="outline"
      className={cn("font-semibold capitalize text-xs px-2.5 py-1", style.className)}
    >
      {style.label}
    </Badge>
  );
}
