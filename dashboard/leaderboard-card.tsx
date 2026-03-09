'use client';

import { useMemo } from 'react';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/types';
import { Crown, Medal, Trophy } from 'lucide-react';
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

interface LeaderboardCardProps {}

export function LeaderboardCard({}: LeaderboardCardProps) {
  const firestore = useFirestore();
  const usersQuery = useMemoFirebase(
    () => query(collection(firestore, 'users'), orderBy('points', 'desc'), limit(5)),
    [firestore]
  );
  const { data: usersData, isLoading: loading } = useCollection<UserProfile>(usersQuery);

  const users = useMemo(() => {
    if (!usersData) return [];
    return usersData.map((user, index) => ({
      ...user,
      avatarUrl:
        PlaceHolderImages.find((img) => img.id === `user-avatar-${(index % 2) + 1}`)
          ?.imageUrl ?? '',
    }));
  }, [usersData]);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-orange-600" />;
    return <span className="text-sm font-bold w-5 text-center">{rank + 1}</span>;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top performers bulan ini.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user, index) => (
              <div key={user.id} className="flex items-center gap-4">
                <div className="w-6 flex justify-center">{getRankIcon(index)}</div>
                <Avatar className="h-10 w-10 border-2 border-border">
                  <AvatarImage src={(user as any).avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-sm truncate">
                    {user.nickname ? `${user.nickname}` : user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{user.name}</p>
                </div>
                <div className="font-bold text-sm tabular-nums text-right">
                  {(user.points || 0).toLocaleString()}
                  <span className="text-xs text-muted-foreground ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center h-24 flex items-center justify-center">
            Belum ada data poin pengguna.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
