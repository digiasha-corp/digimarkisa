'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentAuth } from '@/lib/auth-store';
import { initializeStorageIfNeeded } from '@/lib/storage';
import { fetchFromGoogleSheets } from '@/lib/google-sheets';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    initializeStorageIfNeeded();

    // Fetch live data from Google Sheets on initial load
    fetchFromGoogleSheets().catch(() => {});

    const auth = getCurrentAuth();

    if (pathname !== '/login' && !auth.user) {
      router.push('/login');
    } else {
      setChecked(true);
    }

    const handleSwitched = () => {
      const updated = getCurrentAuth();
      if (!updated.user && pathname !== '/login') {
        router.push('/login');
      }
    };

    window.addEventListener('userSwitched', handleSwitched);
    return () => {
      window.removeEventListener('userSwitched', handleSwitched);
    };
  }, [pathname, router]);

  if (pathname !== '/login' && !checked) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
