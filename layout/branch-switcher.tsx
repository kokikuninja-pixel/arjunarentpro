"use client";

import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useParams, useRouter } from 'next/navigation';

export function BranchSwitcher() {
  const { role, selectedBranchId, setSelectedBranchId, loading, branches } = useAuth();
  const params = useParams();
  const router = useRouter();

  const handleBranchChange = (newBranchId: string) => {
    if (setSelectedBranchId) {
      // If "All Branches" is selected, set the context to null
      if (newBranchId === 'all') {
        setSelectedBranchId(null);
      } else {
        setSelectedBranchId(newBranchId);
      }
    }
  };
  
  if (loading) {
    return <Skeleton className="h-9 w-48 hidden md:flex" />;
  }

  if (!branches || branches.length === 0) {
    return null;
  }

  const canSwitch = role === 'owner' || role === 'developer';
  
  // Use params.branch if on a branch-specific page, otherwise use the context's selectedBranchId.
  // This ensures the switcher always reflects the content being viewed.
  const displayBranchId = params.branch as string || selectedBranchId;
  const selectedBranch = branches.find((b) => b.id === displayBranchId);

  const renderContent = () => {
    if (canSwitch) {
      return (
        <Select
          value={displayBranchId ?? 'all'}
          onValueChange={handleBranchChange}
        >
          <SelectTrigger className="w-auto h-9 border-0 gap-2 font-semibold">
            <Building className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Pilih cabang..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Cabang</SelectItem>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (selectedBranch) {
      return (
        <div className="flex h-9 items-center gap-2 rounded-md px-3">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{selectedBranch.name}</span>
        </div>
      );
    }

    return null;
  };

  return <div className="hidden md:flex">{renderContent()}</div>;
}
