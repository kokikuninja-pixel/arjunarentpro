'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useFilteredNavigation } from '@/features/auth/hooks/use-navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '../ui/skeleton';
import { ChevronRight } from 'lucide-react';
import type { NavLink } from '@/lib/config';
import { useAuth } from '@/features/auth/hooks/use-auth';

interface MobileNavProps {
  setOpen: (open: boolean) => void;
}

function NavItemMobile({
  item,
  pathname,
  onClick,
  depth = 0,
}: {
  item: NavLink;
  pathname: string;
  onClick: () => void;
  depth?: number;
}) {
  const { selectedBranchId } = useAuth();
  const [isExpanded, setIsExpanded] = useState(pathname.startsWith(item.href));
  
  const isGlobalLink = item.scope === 'owner';
  const href = isGlobalLink ? item.href : (selectedBranchId ? `/${selectedBranchId}${item.href}` : '#');
  const isActive = pathname === href || (item.children && pathname.startsWith(href));
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="space-y-1">
            <CollapsibleTrigger asChild>
                <button
                    className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors font-medium',
                        isActive
                        ? 'bg-muted text-foreground'
                        : 'text-muted-foreground hover:bg-muted/50'
                    )}
                >
                    <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                    </div>
                    <ChevronRight className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')} />
                </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-4">
                {item.children!.map((child: NavLink) => {
                    const childHref = isGlobalLink ? child.href : (selectedBranchId ? `/${selectedBranchId}${child.href}` : '#');
                    return (
                        <Link
                            key={child.href}
                            href={childHref}
                            onClick={onClick}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                                pathname === childHref
                                ? 'bg-accent text-accent-foreground'
                                : 'text-muted-foreground hover:bg-muted/50'
                            )}
                        >
                            <span className="w-4 h-4" /> {/* Spacer */}
                            {child.name}
                        </Link>
                    )
                })}
            </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted/50'
      )}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.name}</span>
    </Link>
  );
}


export function MobileNav({ setOpen }: MobileNavProps) {
  const { navItems, loading } = useFilteredNavigation();
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
        <Link
            href="/"
            className="flex items-center gap-2 p-4 border-b -ml-6 -mt-6 mb-4"
            onClick={() => setOpen(false)}
        >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center ml-6">
                <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="font-bold">MotoRent</span>
        </Link>
      
        <nav className="flex-1 overflow-auto py-2">
            {loading ? (
                <div className="p-2 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : (
                <div className="space-y-1 px-2">
                    {navItems.map((item) => (
                        <NavItemMobile
                            key={item.name}
                            item={item}
                            pathname={pathname}
                            onClick={() => setOpen(false)}
                        />
                    ))}
                    
                    {navItems.length === 0 && (
                        <p className="p-4 text-sm text-muted-foreground text-center">
                            No accessible menu items
                        </p>
                    )}
                </div>
            )}
        </nav>
    </div>
  );
}
