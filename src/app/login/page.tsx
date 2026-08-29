'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserList, getRoleList, initializeStorageIfNeeded } from '@/lib/storage';
import { switchUserAccount, getCurrentAuth } from '@/lib/auth-store';
import { User, Role } from '@/lib/types';
import { KeyRound, Sparkles, Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    initializeStorageIfNeeded();
    const uList = getUserList().filter(u => u.isAktif);
    const rList = getRoleList();

    setUsers(uList);
    setRoles(rList);

    const active = getCurrentAuth().user;
    if (active) {
      setSelectedUserId(active.id);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const user = users.find(u => u.id === selectedUserId);
    if (!user) {
      setErrorMsg('Silakan pilih akun pengguna terlebih dahulu.');
      return;
    }

    if (!pinInput) {
      setErrorMsg('Silakan masukkan 4-digit PIN keamanan Anda.');
      return;
    }

    if (user.pin && user.pin !== pinInput) {
      setErrorMsg('PIN yang Anda masukkan salah. Silakan coba lagi.');
      return;
    }

    switchUserAccount(user.id);
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
          <KeyRound className="w-4 h-4 text-amber-600" /> Autentikasi Pengguna & PIN
        </h3>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Akun Pengguna</label>
            <select
              value={selectedUserId}
              onChange={e => {
                setSelectedUserId(e.target.value);
                setPinInput('');
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Pilih Akun User --</option>
              {users.map(u => {
                const role = roles.find(r => r.id === u.roleId);
                return (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({role?.namaRole || u.username})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN Keamanan (4-Digit)</label>
            <input
              type="password"
              maxLength={6}
              placeholder="Masukkan PIN Keamanan"
              value={pinInput}
              onChange={e => {
                setPinInput(e.target.value);
                setErrorMsg('');
              }}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none tracking-widest text-center"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 active:scale-95 transition-all uppercase tracking-wider"
          >
            Masuk Ke Aplikasi
          </button>
        </form>
      </div>
    </div>
  );
}
