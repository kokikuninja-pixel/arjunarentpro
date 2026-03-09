
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRoles } from '@/features/rbac/hooks';
import { usePermissions } from '@/features/rbac/hooks';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RoleList } from '@/features/rbac/components/RoleList';
import { PermissionMatrix } from '@/features/rbac/components/PermissionMatrix';
import { RoleFormDialog } from '@/features/rbac/components/RoleFormDialog';
import { canManageRole } from '@/features/rbac/utils';
import type { Role, RoleFormData } from '@/features/rbac/types';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Plus, RotateCcw, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PermissionButton } from '@/features/auth/components';

export default function RolesPage() {
  const { 
    roles, 
    loading: rolesLoading, 
    createRole,
    updateRole,
    updateRolePermissions,
    deleteRole,
    duplicateRole,
  } = useRoles();
  
  const { permissions, loading: permsLoading } = usePermissions();
  const { userProfile } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[] | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRole, setFormRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const currentUserRole = useMemo(() => {
    return roles.find(r => r.code === userProfile?.primaryRoleCode);
  }, [roles, userProfile]);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);
  
  useEffect(() => {
    if (selectedRole) {
      setEditedPermissions(null);
    }
  }, [selectedRole?.id]);

  const canEditSelectedRole = useMemo(() => {
    if (!selectedRole || !currentUserRole) return false;
    return canManageRole(currentUserRole, selectedRole);
  }, [selectedRole, currentUserRole]);

  const handleSelectRole = (role: Role) => {
    if (editedPermissions !== null) {
      if (confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        setSelectedRole(role);
      }
    } else {
      setSelectedRole(role);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!selectedRole || !editedPermissions || !userProfile) return;
    
    setIsSaving(true);
    try {
      await updateRolePermissions(selectedRole.id, editedPermissions, userProfile.id);
      setEditedPermissions(null);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFormSubmit = async (data: RoleFormData) => {
    setIsFormOpen(false);
    if (formRole && userProfile) {
      await updateRole(formRole.id, data, userProfile.id);
    } else if (userProfile) {
      const newRole = await createRole(data, userProfile.id);
      if (newRole) setSelectedRole(newRole);
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete || !userProfile) return;
    
    await deleteRole(roleToDelete.id, userProfile.id);
    if (selectedRole?.id === roleToDelete.id) {
      setSelectedRole(roles[0] || null);
    }
    setRoleToDelete(null);
  };
  
  const handleOpenForm = (role: Role | null = null) => {
    setFormRole(role);
    setIsFormOpen(true);
  };

  const isLoading = rolesLoading || permsLoading;
  const isDirty = editedPermissions !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">Manage access control for your organization.</p>
        </div>
        <PermissionButton permission="ROLES_CREATE" onClick={() => handleOpenForm()}>
          <Plus className="w-4 h-4 mr-2" /> Create Role
        </PermissionButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[60vh]">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-card rounded-lg border h-full">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Available Roles</h2>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <RoleList 
                roles={roles} 
                selectedId={selectedRole?.id || null} 
                onSelect={handleSelectRole}
                currentUserRole={currentUserRole}
                onEdit={handleOpenForm}
                onDelete={setRoleToDelete}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-card rounded-lg border h-full flex flex-col">
            {isLoading ? (
              <div className="p-6"><Skeleton className="h-full w-full" /></div>
            ) : selectedRole ? (
              <>
                <div className="p-6 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold">{selectedRole.name}</h2>
                    {selectedRole.isSystem && <Badge variant="secondary">System Role</Badge>}
                    {!canEditSelectedRole && (
                      <Badge variant="outline" className="text-yellow-600">
                        <AlertTriangle className="w-3 h-3 mr-1" /> View Only
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{selectedRole.description}</p>
                </div>
                
                <div className="flex-1 p-6 overflow-hidden">
                  <PermissionMatrix
                    permissions={permissions}
                    selectedPermissions={editedPermissions ?? selectedRole.permissions ?? []}
                    onChange={setEditedPermissions}
                    disabled={!canEditSelectedRole}
                  />
                </div>

                {canEditSelectedRole && (
                  <div className="p-4 border-t bg-muted/50 flex items-center justify-between">
                    <span className={`text-sm ${isDirty ? 'text-yellow-600' : 'text-green-600'}`}>
                      {isDirty ? 'Unsaved changes' : 'All changes saved'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditedPermissions(null)} disabled={!isDirty}>
                        <RotateCcw className="w-4 h-4 mr-2" /> Discard
                      </Button>
                      <Button size="sm" onClick={handleSaveChanges} disabled={!isDirty || isSaving}>
                        <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-6 text-center text-muted-foreground">Select a role to manage permissions.</div>
            )}
          </div>
        </div>
      </div>
      
      <RoleFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        role={formRole}
        existingRoles={roles}
      />

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{roleToDelete?.name}</strong>? This action cannot be undone. Users with this role will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRole}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
