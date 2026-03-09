"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from '@/context/theme-provider';
import { FirebaseProvider } from '@/firebase/provider';
import { app, auth, db as firestore } from '@/lib/firebase';
import { AuthProvider } from '@/features/auth/components/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <FirebaseProvider firebaseApp={app} auth={auth} firestore={firestore}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </FirebaseProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
