/**
 * @fileOverview Halaman login standar untuk otentikasi pengguna.
 * @description
 * Halaman ini menyediakan antarmuka bagi pengguna untuk memasukkan email dan password.
 * Fungsi utamanya adalah:
 * 1. Menampilkan form login yang terdiri dari input email dan password.
 * 2. Menangani pengiriman form, memanggil fungsi otentikasi dari `SimpleAuth`.
 * 3. Menampilkan pesan error jika proses login gagal (misalnya, password salah).
 * 4. Secara otomatis mengarahkan pengguna yang sudah terotentikasi ke halaman utama (`/`)
 *    untuk menghindari login ganda.
 * 5. Menampilkan indikator loading selama proses otentikasi berlangsung.
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleAuth } from '@/lib/auth/simple-auth';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/use-auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, loading, userProfile, selectedBranchId } = useAuth();
  const router = useRouter();

  // This effect handles redirecting the user if they are already logged in.
  useEffect(() => {
    if (!loading && user && userProfile) {
      if (userProfile.onboardingCompletedAt) {
          if (userProfile.primaryRoleCode === 'OWNER' || userProfile.primaryRoleCode === 'DEVELOPER') {
              router.replace('/owner/dashboard');
          } else if (userProfile.branchId) {
              router.replace(`/${userProfile.branchId}/dashboard`);
          }
      } else {
          router.replace('/onboarding');
      }
    }
  }, [user, userProfile, loading, router]);


  // While checking auth or redirecting, show a loader.
  if (loading || (!loading && user)) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
        </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await SimpleAuth.login(email, password);
      // On success, we don't need to do anything. The AuthProvider's onAuthStateChanged
      // listener will detect the login, fetch the profile, and the useEffect in this
      // component will handle the redirect based on the profile status.
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your email and password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="text-gray-500 mt-2">Masuk ke sistem management</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="admin@example.com"
                required
                autoCapitalize="none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
