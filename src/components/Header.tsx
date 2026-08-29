'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentAuth, AuthState } from '@/lib/auth-store';
import { syncToGoogleSheets, triggerAutoSyncIfNeeded } from '@/lib/google-sheets';
import { RefreshCw, UserCheck, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null, allowedBranches: [] });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

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

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing...');
    const res = await syncToGoogleSheets();
    setIsSyncing(false);
    setSyncStatus(res.success ? 'Synced OK' : 'Local Only');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  if (!auth.user) return null;

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

        {/* User Account Badge & Sync Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition-all flex items-center gap-1 text-xs font-semibold bg-slate-50 border border-slate-200"
            title="Sinkronkan ke Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{syncStatus || 'Sync'}</span>
          </button>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 active:scale-95 transition-all shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate max-w-[120px]">{auth.user.nama.split(' ')[0]}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
