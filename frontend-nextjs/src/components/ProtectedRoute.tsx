/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token, hydrated } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || !user) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, [hydrated, token, user, router]);

  if (!hydrated || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm">Memuat...</p>
      </div>
    );
  }

  return <>{children}</>;
}