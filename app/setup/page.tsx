'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, ShieldCheck, ShieldOff, Wrench } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { initialSetup, type SetupFormValues } from '@/lib/actions/setup';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { runFullSeed } from '@/lib/actions/seed-action';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const setupSchema = z.object({
  name: z.string().min(3, { message: 'Nama lengkap diperlukan.' }),
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

export default function SetupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState<boolean | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check if an owner already exists to lock down this page
    const checkSetupStatus = async () => {
      try {
        const ownerUsersQuery = query(
          collection(db, 'users'),
          where('primaryRoleCode', '==', 'OWNER'),
          limit(1)
        );
        const snapshot = await getDocs(ownerUsersQuery);
        setIsSetupComplete(!snapshot.empty);
      } catch (error) {
        console.error('Error checking setup status:', error);
        setIsSetupComplete(false); // Assume not complete if check fails
        toast({
          variant: 'destructive',
          title: 'Gagal memverifikasi status setup.',
        });
      }
    };
    checkSetupStatus();
  }, [toast]);

  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SetupFormValues) => {
    if (isSetupComplete) {
      toast({ variant: 'destructive', title: 'Setup sudah selesai.' });
      return;
    }
    setIsSubmitting(true);
    
    const result = await initialSetup(data);
    
    if (result.success) {
      toast({
        title: 'Akun Owner Berhasil Dibuat!',
        description: 'Anda akan diarahkan ke halaman login.',
      });
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      toast({
        variant: 'destructive',
        title: 'Gagal Membuat Akun',
        description: result.error,
      });
    }

    setIsSubmitting(false);
  };
  
  const handleRunSeed = async () => {
    setIsSeeding(true);
    const result = await runFullSeed();
    if (result.success) {
      toast({
        title: 'Seeding Success',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: result.message,
      });
    }
    setIsSeeding(false);
  };

  if (isSetupComplete === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="ml-2">Memeriksa konfigurasi...</p>
      </div>
    );
  }

  if (isSetupComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900">Setup Selesai</h1>
              <p className="text-gray-600 mt-2">
                Akun owner sudah ada. Anda bisa lanjut ke halaman login.
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href="/login">Lanjut ke Halaman Login</Link>
              </Button>
            </div>
            
            <Card>
                <CardHeader>
                <CardTitle>Seed Default Data</CardTitle>
                <CardDescription>
                    Jika data default (seperti roles, permissions) tidak ada, gunakan tool ini untuk menambahkannya.
                </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <Alert>
                    <Wrench className="h-4 w-4" />
                    <AlertTitle>Non-Destructive Action</AlertTitle>
                    <AlertDescription>
                    Proses ini hanya akan menambah data yang hilang dan tidak akan menimpa data yang sudah ada. Aman untuk dijalankan beberapa kali.
                    </AlertDescription>
                </Alert>

                <Button onClick={handleRunSeed} disabled={isSeeding} size="lg" className="w-full">
                    {isSeeding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Wrench className="mr-2 h-4 w-4" />
                    )}
                    {isSeeding ? 'Seeding Data...' : 'Run Initial Data Seed'}
                </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <ShieldOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Setup Akun Owner</h1>
          <p className="text-gray-500 mt-2">
            Buat akun administrator utama pertama untuk sistem ini.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Admin Utama" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="owner@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimal 6 karakter"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Buat Akun Owner
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
