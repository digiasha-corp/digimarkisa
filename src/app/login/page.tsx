'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserList, initializeStorageIfNeeded } from '@/lib/storage';
import { switchUserAccount } from '@/lib/auth-store';
import { KeyRound, Sparkles, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    initializeStorageIfNeeded();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = usernameInput.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      setErrorMsg('Silakan masukkan Username / ID Pengguna Anda.');
      return;
    }

    if (!pinInput) {
      setErrorMsg('Silakan masukkan PIN Keamanan Anda.');
      return;
    }

    const allUsers = getUserList().filter(u => u.isAktif);
    
    // Search by username, id, or full name (case insensitive)
    const targetUser = allUsers.find(u => {
      const uName = u.username.toLowerCase().replace(/^@/, '');
      const uNama = u.nama.toLowerCase();
      const uId = u.id.toLowerCase();
      return uName === cleanUsername || uNama === cleanUsername || uId === cleanUsername;
    });

    if (!targetUser) {
      setErrorMsg('Username atau PIN yang Anda masukkan salah.');
      return;
    }

    if (targetUser.pin && targetUser.pin !== pinInput) {
      setErrorMsg('Username atau PIN yang Anda masukkan salah.');
      return;
    }

    switchUserAccount(targetUser.id);
    window.dispatchEvent(new Event('userSwitched'));
    router.push('/');
  };

  return (
    <div className="py-4 space-y-5">
      {/* Header Banner */}
      <div className="text-center bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-md shadow-amber-200">
        <div className="inline-flex p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-3">
          <Sparkles className="w-8 h-8 text-amber-200" />
        </div>
        <h2 className="text-xl font-black tracking-tight">Masuk Sistem Stok</h2>
        <p className="text-amber-100 text-xs mt-1">Usaha Sirup Markisa (Mobile Version)</p>
      </div>

      {/* Main Login Form */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-3">
          <KeyRound className="w-4 h-4 text-amber-600" /> Login Autentikasi Pengguna
        </h3>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username / ID Pengguna</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Masukkan Username (cth: admin, produksi)"
                value={usernameInput}
                onChange={e => {
                  setUsernameInput(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN Keamanan / Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="password"
                maxLength={8}
                placeholder="Masukkan PIN Keamanan"
                value={pinInput}
                onChange={e => {
                  setPinInput(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 active:scale-95 transition-all uppercase tracking-wider"
          >
            Masuk Ke Aplikasi
          </button>
        </form>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-2xl text-[11px] text-amber-900 space-y-1 font-medium">
        <p className="font-bold">💡 Contoh Username Login Demo:</p>
        <ul className="list-disc list-inside space-y-0.5 text-slate-700">
          <li><b>Super Admin / Owner</b>: Username <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">admin</code> (PIN: <code className="font-mono">1234</code>)</li>
          <li><b>Operator Produksi</b>: Username <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">produksi</code> (PIN: <code className="font-mono">1111</code>)</li>
          <li><b>Staff Gudang</b>: Username <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">gudang</code> (PIN: <code className="font-mono">2222</code>)</li>
          <li><b>Kasir Store</b>: Username <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">kasir</code> (PIN: <code className="font-mono">3333</code>)</li>
        </ul>
      </div>
    </div>
  );
}
