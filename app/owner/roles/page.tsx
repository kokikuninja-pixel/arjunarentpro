'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRoles, usePermissions } from '@/features/rbac/hooks';
import { RoleList } from '@/features/rbac/components/RoleList';
import { PermissionMatrix } from '@/features/rbac/components/PermissionMatrix';
import { Skeleton } from '@/components/ui/skeleton';
import { Role } from '@/features/rbac/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { canManageRole } from '@/features/rbac/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Shield, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { RoleFormDialog } from '@/features/rbac/components/RoleFormDialog';
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
import { Badge } from '@/components/ui/badge';

export default function RolesPage() {
  const { roles, loading: rolesLoading, createRole, updateRole, deleteRole, updateRolePermissions } = useRoles();
  const { permissions, loading: permsLoading } = usePermissions();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[] | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formRole, setFormRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine current user level and super admin status
  const { currentUserRoleLevel, isSuperAdmin } = useMemo(() => {
    const userRole = roles.find(r => r.code === userProfile?.role);
    return {
      currentUserRoleLevel: userRole?.level ?? 99,
      isSuperAdmin: userProfile?.role === 'developer', // developer is super_admin for now
    };
  }, [roles, userProfile]);

  // Auto-select first role on load
  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);
  
  // Reset edited permissions when role changes
  useEffect(() => {
    if (selectedRole) {
      setEditedPermissions(null);
    }
  }, [selectedRole?.id]);

  const handleSelectRole = useCallback((role: Role) => {
    // Check unsaved changes
    if (editedPermissions !== null) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }
    setSelectedRole(role);
  }, [editedPermissions]);

  const handlePermissionsChange = useCallback((newPermissions: string[]) => {
    setEditedPermissions(newPermissions);
  }, []);
  
  const handleSaveChanges = async () => {
    if (!selectedRole || !editedPermissions) return;
    
    setIsSaving(true);
    try {
      await updateRolePermissions(selectedRole.id, editedPermissions);
      setEditedPermissions(null);
      toast({
        title: 'Success',
        description: `Permissions for "${selectedRole.name}" updated successfully.`,
      });
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDiscardChanges = () => {
    setEditedPermissions(null);
    toast({
      title: 'Changes Discarded',
      description: 'Permission changes have been reverted.',
    });
  };
  
  const handleOpenForm = (role: Role | null) => {
    setFormRole(role);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (formRole) {
      await updateRole(formRole.id, data);
    } else {
      const newRole = await createRole(data);
      if (newRole) {
        setSelectedRole(newRole);
      }
    }
    setIsFormOpen(false);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      await deleteRole(roleToDelete.id);
      if (selectedRole?.id === roleToDelete.id) {
        setSelectedRole(roles.find(r => r.id !== roleToDelete.id) || null);
      }
    } catch (error) {
      // Error handled by hook
    } finally {
      setRoleToDelete(null);
    }
  };

  const isLoading = rolesLoading || permsLoading;
  const isDirty = editedPermissions !== null;
  const canEditSelectedRole = selectedRole 
    ? canManageRole(currentUserRoleLevel, selectedRole.level, isSuperAdmin) 
    : false;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage access control and permissions for your organization.
          </p>
        </div>
        <Button onClick={() => handleOpenForm(null)} className="gap-2">
          <Shield className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[60vh]">
        {/* Left Column: Role List */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="bg-card rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Available Roles</h2>
              <p className="text-xs text-muted-foreground">
                {roles.length} roles • {isSuperAdmin ? 'Full access' : 'Limited by hierarchy'}
              </p>
            </div>
            {isLoading ? (
              <div className="p-4 space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <RoleList 
                roles={roles} 
                selectedId={selectedRole?.id || null} 
                onSelect={handleSelectRole}
                currentUserRoleLevel={currentUserRoleLevel}
                isSuperAdmin={isSuperAdmin}
                onEdit={handleOpenForm}
                onDelete={setRoleToDelete}
              />
            )}
          </div>
        </div>

        {/* Right Column: Permission Matrix */}
        <div className="lg:col-span-8 xl:col-span-9">
          <div className="bg-card rounded-lg border h-full flex flex-col">
            {isLoading ? (
              <div className="p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </div>
            ) : selectedRole ? (
              <>
                <div className="p-6 border-b flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{selectedRole.name}</h2>
                      {selectedRole.isSystem && (
                        <Badge variant="secondary">System Role</Badge>
                      )}
                      {!canEditSelectedRole && (
                        <Badge variant="outline" className="text-yellow-600">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          View Only
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {selectedRole.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Level: {selectedRole.level}</span>
                      <span>•</span>
                      <span>Scope: {selectedRole.defaultScope}</span>
                      <span>•</span>
                      <span>{selectedRole.permissions?.length || 0} permissions</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-hidden">
                  <PermissionMatrix
                    permissions={permissions}
                    selectedPermissions={editedPermissions || selectedRole.permissions || []}
                    onChange={handlePermissionsChange}
                    disabled={!canEditSelectedRole}
                  />
                </div>

                {/* Action Bar */}
                {canEditSelectedRole && (
                  <div className="p-4 border-t bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {isDirty ? (
                        <>
                          <span className="text-yellow-600 font-medium">Unsaved changes</span>
                          <span className="text-muted-foreground">
                            ({editedPermissions?.length || 0} permissions selected)
                          </span>
                        </>
                      ) : (
                        <span className="text-green-600 flex items-center gap-1">
                          <Save className="w-4 h-4" />
                          All changes saved
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isDirty && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleDiscardChanges}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Discard
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={handleSaveChanges}
                        disabled={!isDirty || isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                )}

                {!canEditSelectedRole && (
                  <div className="p-4 border-t bg-yellow-50/50">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      You cannot edit this role because it has higher or equal authority level than your current role.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a role to view and manage permissions.</p>
                </div>
              </div>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{roleToDelete?.name}</strong>?
              This action cannot be undone. Users with this role will need to be reassigned.
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
