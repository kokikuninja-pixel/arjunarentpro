'use client';

import { useMemo, useEffect, useState } from 'react';
import { collection, query, orderBy, limit, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { ActivityLog } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '../ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ActivityLogCardProps {
    scope?: 'global' | 'branch';
    branchId?: string;
}

export function ActivityLogCard({ scope = 'branch', branchId }: ActivityLogCardProps) {
  const firestore = useFirestore();

  const activityLogsQuery = useMemoFirebase(() => {
    let q = query(collection(firestore, 'activity_logs'), orderBy('createdAt', 'desc'), limit(5));
    if (scope === 'branch' && branchId) {
      q = query(q, where('branchId', '==', branchId));
    }
    return q;
  }, [firestore, scope, branchId]);

  const { data: activities, isLoading: loading } = useCollection<ActivityLog>(activityLogsQuery);

  const activitiesWithAvatars = useMemo(() => {
    if (!activities) return [];
    return activities.map((activity, index) => ({
      ...activity,
      user: {
        name: activity.user?.name || `User ${activity.userId.substring(0, 4)}`,
        avatarUrl:
          PlaceHolderImages.find((img) => img.id === `user-avatar-${(index % 2) + 1}`)
            ?.imageUrl ?? '',
      },
    }));
  }, [activities]);

  const formatDate = (date: any) => {
    if (!date) return '';
    if (date.toDate) {
      return date.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardDescription>Log dari aksi terbaru dalam sistem.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activitiesWithAvatars.length > 0 ? (
          <div className="space-y-4">
            {activitiesWithAvatars.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={(activity.user as any)?.avatarUrl} alt={(activity.user as any)?.name} />
                  <AvatarFallback>{(activity.user as any)?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p>
                    <span className="font-medium">{(activity.user as any)?.name}</span>{' '}
                    {activity.message}.
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center h-24 flex items-center justify-center">
            Belum ada aktivitas.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
