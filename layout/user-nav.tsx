'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

export function UserNav() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  
  if (loading || !user) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'A';
  
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar-1');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar?.imageUrl} alt={user.name} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem asChild>
              <Link href="/settings/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
             <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
