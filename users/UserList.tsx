'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface UserListProps {
  branchId?: string | null;
}

export function UserList({ branchId }: UserListProps) {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    let q = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
    // Jika branchId diberikan, tambahkan filter
    if (branchId) {
      q = query(q, where('branchId', '==', branchId));
    }
    return q;
  }, [firestore, branchId]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersQuery);

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'U';

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Terakhir Login</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            </TableRow>
          ))}
          {!isLoading && users?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Tidak ada pengguna yang cocok dengan filter.
              </TableCell>
            </TableRow>
          )}
          {users?.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.photoUrl || PlaceHolderImages[0].imageUrl} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="capitalize">{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.isActive ? 'default' : 'outline'}>{user.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {user.lastLogin ? new Date(user.lastLogin.toDate()).toLocaleString('id-ID') : 'Belum pernah'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
