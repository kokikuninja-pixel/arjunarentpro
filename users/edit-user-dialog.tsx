
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, writeBatch, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import type { UserProfile, Role, Branch } from '@/lib/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createActivityLog } from '@/lib/actions/logging';

const userSchema = z.object({
  name: z.string().min(3, { message: 'Nama lengkap diperlukan.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  role: z.string({ required_error: 'Peran harus dipilih.' }),
  branchId: z.string().nullable(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: UserProfile;
  roles: Role[];
  branches: Branch[];
}

export function EditUserDialog({ isOpen, onOpenChange, user, roles, branches }: EditUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });
  
  useEffect(() => {
    if (user) {
        form.reset({
            name: user.name,
            email: user.email,
            role: user.role,
            branchId: user.branchId,
        });
    }
  }, [user, form]);

  const onSubmit = async (data: UserFormValues) => {
    if (!currentUser || !user) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const userRef = doc(db, 'users', user.id);
      batch.update(userRef, {
        name: data.name,
        email: data.email,
        role: data.role,
        branchId: data.branchId,
        updatedAt: serverTimestamp(),
      });
      
      // Handle change in quick-access role collections
      if (user.role !== data.role) {
          // Delete from old role collection
          const oldRoleRef = doc(db, `roles_${user.role}`, user.id);
          batch.delete(oldRoleRef);
          // Add to new role collection
          const newRoleRef = doc(db, `roles_${data.role}`, user.id);
          batch.set(newRoleRef, { role: data.role, userId: user.id });
      }

      await createActivityLog({
        userId: currentUser.uid,
        message: `mengedit pengguna: ${data.name}`,
        targetType: 'user',
        targetId: user.id,
      });
      
      await batch.commit();

      toast({
        title: 'Pengguna Berhasil Diperbarui',
        description: `Data untuk ${data.name} telah disimpan.`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user: ', error);
      toast({
        variant: 'destructive',
        title: 'Gagal Memperbarui Pengguna',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna: {user.name}</DialogTitle>
          <DialogDescription>
            Perbarui detail dan peran untuk pengguna ini.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Email</FormLabel>
                  <FormControl><Input type="email" {...field} disabled /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Peran (Role)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih peran..." /></SelectTrigger></FormControl>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cabang</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value ?? 'none'}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih cabang..." /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="none">Tidak ada (Global)</SelectItem>
                        {branches.map(branch => (
                            <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
