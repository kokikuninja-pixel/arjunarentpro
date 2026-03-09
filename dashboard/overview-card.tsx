'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  value: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  variant?: 'default' | 'destructive' | 'success';
}

export function OverviewCard({
  title,
  value,
  description,
  icon: Icon,
  variant = 'default',
}: OverviewCardProps) {
  
  const variantClasses = {
    default: 'hover:border-primary/50',
    destructive: 'hover:border-destructive/80',
    success: 'hover:border-green-500/80',
  }
  
  const iconVariantClasses = {
    default: 'text-muted-foreground',
    destructive: 'text-destructive',
    success: 'text-green-500',
  }

  return (
    <Card className={`${variantClasses[variant]} transition-colors duration-300`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconVariantClasses[variant]}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </CardContent>
    </Card>
  );
}
