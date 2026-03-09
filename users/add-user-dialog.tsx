'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
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
import type { Branch, Role } from '@/lib/types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { createActivityLog } from '@/lib/actions/logging';

const userSchema = z.object({
  name: z.string().min(3, { message: 'Nama lengkap diperlukan.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
  roleId: z.string({ required_error: 'Peran harus dipilih.'}),
  branchId: z.string().nullable(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  roles: Role[];
  branches: Branch[];
}

export function AddUserDialog({ isOpen, onOpenChange, roles, branches }: AddUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      roleId: undefined,
      branchId: null,
    },
  });

  const onSubmit = async (data: UserFormValues) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const auth = getAuth(); 
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const newUserId = userCredential.user.uid;

      const batch = writeBatch(db);
      
      const selectedRole = roles.find(r => r.id === data.roleId);
      if (!selectedRole) throw new Error("Role tidak valid.");

      const userRef = doc(db, 'users', newUserId);
      batch.set(userRef, {
        name: data.name,
        email: data.email,
        primaryRoleId: data.roleId,
        primaryRoleCode: selectedRole.code,
        branchId: data.branchId,
        isActive: true,
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await createActivityLog({
        userId: currentUser.uid,
        message: `membuat pengguna baru: ${data.name} dengan peran ${selectedRole.name}`,
        targetType: 'user',
        targetId: newUserId,
      });

      await batch.commit();

      toast({ title: 'Pengguna Berhasil Dibuat' });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user: ', error);
      let errorMessage = 'Gagal Membuat Pengguna';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah digunakan oleh akun lain.';
      }
      toast({ variant: 'destructive', title: errorMessage, description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Buat akun baru untuk staf atau admin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="roleId" render={({ field }) => (
                <FormItem><FormLabel>Peran</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih peran..." /></SelectTrigger></FormControl>
                    <SelectContent>{roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem><FormLabel>Cabang</FormLabel>
                    <Select onValueChange={(v) => field.onChange(v === 'none' ? null : v)} value={field.value ?? 'none'}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih cabang..." /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="none">Tidak ada (Global)</SelectItem>
                        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                    </Select><FormMessage />
                </FormItem>
            )}/>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Pengguna
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
