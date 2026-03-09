'use client';

import { useState } from 'react';
import { UserList } from '@/components/users/UserList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { AddUserDialog } from '@/components/users/add-user-dialog';
import { useRoles } from '@/features/rbac/hooks';

export default function UsersPage() {
  const { selectedBranchId, branches } = useAuth();
  const { roles, loading: rolesLoading } = useRoles();
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
            <p className="text-muted-foreground">
              {selectedBranch ? `Menampilkan pengguna untuk cabang: ${selectedBranch.name}` : 'Pilih cabang untuk memfilter'}
            </p>
          </div>
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        </div>

        <UserList branchId={selectedBranchId} />
      </div>

      {!rolesLoading && (
        <AddUserDialog
          isOpen={isAddUserOpen}
          onOpenChange={setIsAddUserOpen}
          roles={roles}
          branches={branches}
        />
      )}
    </>
  );
}
