
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, serverTimestamp, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Branch } from '@/lib/types';

export default function OnboardingPage() {
  const { user, userProfile, refreshProfile, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const completeOwnerOnboarding = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
            onboardingCompletedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        await refreshProfile();
        toast({ title: 'Welcome!', description: 'Your owner profile is ready.' });
        router.push('/owner/dashboard');
    } catch (err) {
        console.error('Owner onboarding error:', err);
        toast({ title: 'Error', description: 'Failed to complete owner setup.', variant: 'destructive' });
        setIsLoading(false);
    }
  }, [user, refreshProfile, router, toast]);

  // Redirect jika sudah complete atau handle owner
  useEffect(() => {
    const checkProfile = async () => {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (userProfile) {
        // Jika user adalah OWNER atau DEVELOPER
        if (userProfile.primaryRoleCode === 'OWNER' || userProfile.primaryRoleCode === 'DEVELOPER') {
          if (userProfile.onboardingCompletedAt) {
            router.push('/owner/dashboard');
          } else {
            await completeOwnerOnboarding();
          }
          return;
        }

        // Jika user adalah role lain dan sudah selesai onboarding
        if (userProfile.branchId) {
            router.push(`/${userProfile.branchId}/dashboard`);
            return;
        }
      }

      // Jika user adalah role lain dan BELUM selesai onboarding
      if (user?.displayName) setName(user.displayName);

      try {
        const branchesSnapshot = await getDocs(collection(db, 'branches'));
        const branchesData = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
        setBranches(branchesData);
      } catch (err) {
        console.error('Error fetching branches:', err);
        toast({ variant: 'destructive', title: 'Gagal memuat data cabang.' });
      }

      setIsChecking(false);
    };

    checkProfile();
  }, [isAuthenticated, userProfile, router, user, completeOwnerOnboarding, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim() || !branchId) {
        toast({ title: 'Please fill all fields', variant: 'destructive' });
        return;
    }

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      
      await updateDoc(userRef, {
        name: name.trim(),
        branchId: branchId,
        homeBranchId: branchId,
        accessibleBranches: [branchId], 
        updatedAt: serverTimestamp(),
        onboardingCompletedAt: serverTimestamp(),
      });

      await refreshProfile();

      toast({
        title: 'Welcome!',
        description: 'Your profile has been set up successfully.',
      });

      // Redirect to the correct branch dashboard
      const selectedBranch = branches.find(b => b.id === branchId);
      if (selectedBranch) {
          router.push(`/${selectedBranch.code}/dashboard`);
      } else {
          router.push('/login'); // Fallback
      }

    } catch (err) {
      console.error('Onboarding error:', err);
      toast({
        title: 'Error',
        description: 'Failed to complete setup. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Please provide some additional information to get started.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Home Branch</Label>
              <Select value={branchId} onValueChange={setBranchId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be your default working branch.
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading || !name || !branchId}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Complete Setup'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
