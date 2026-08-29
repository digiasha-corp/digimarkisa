'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentAuth, AuthState, logout } from '@/lib/auth-store';
import { triggerAutoSyncIfNeeded } from '@/lib/google-sheets';
import { UserCheck, Building2, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null, allowedBranches: [] });

  useEffect(() => {
    setAuth(getCurrentAuth());

    const handleStorage = () => setAuth(getCurrentAuth());
    const handleMutation = () => {
      triggerAutoSyncIfNeeded();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('userSwitched', handleStorage);
    window.addEventListener('storageMutation', handleMutation);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userSwitched', handleStorage);
      window.removeEventListener('storageMutation', handleMutation);
    };
  }, []);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari akun ini?')) {
      logout();
      window.dispatchEvent(new Event('userSwitched'));
      router.push('/login');
    }
  };

  // Hide Header completely on Login Page or when user is not logged in
  if (pathname === '/login' || !auth.user) return null;

  return (
    <header className="sticky top-0 z-40 glass-header px-4 py-3 border-b border-slate-100 w-full min-w-[320px]">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand & Active Branch */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-amber-200">
            🍹
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
              Sirup Markisa
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                Stok
              </span>
            </h1>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate max-w-[200px] sm:max-w-md">
                {auth.user.assignedBranchIds === 'ALL'
                  ? 'Semua Branch (Admin)'
                  : auth.allowedBranches.length > 0
                  ? auth.allowedBranches.map(b => b.namaBranch).join(', ')
                  : 'Tanpa Branch'}
              </span>
            </div>
          </div>
        </div>

        {/* User Account Badge & Logout */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
            title="Ganti Akun"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[100px]">{auth.user?.nama ? auth.user.nama.split(' ')[0] : 'User'}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 active:scale-95 transition-all bg-rose-50/60 border border-rose-200"
            title="Keluar / Logout"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
