'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useEffect, useState } from 'react';
import { getIdTokenResult } from 'firebase/auth';

export function AuthDebug() {
  const { user, role, isOwnerOrDev, loading } = useAuth();
  const [tokenClaims, setTokenClaims] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getIdTokenResult(user, true).then((result) => {
        setTokenClaims(result.claims);
      });
    }
  }, [user]);

  if (loading) {
    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
            <h3 className="font-bold mb-2">Auth Debug</h3>
            <p>Loading auth state...</p>
        </div>
    );
  }

  if (!user) return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <p>Not logged in</p>
    </div>
  );

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <p>Email: {user.email}</p>
        <p>UID: {user.uid}</p>
        <p>Role (from hook): {role || 'NULL'}</p>
        <p>isOwnerOrDev: {isOwnerOrDev ? 'YES' : 'NO'}</p>
        <hr className="my-2 opacity-20" />
        <p className="font-semibold">Token Claims:</p>
        <pre className="overflow-auto max-h-32 text-wrap bg-white/10 p-2 rounded text-xs">
          {JSON.stringify(tokenClaims, null, 2)}
        </pre>
      </div>
    </div>
  );
}
