'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserList, getRoleList, getBranchList, initializeStorageIfNeeded } from '@/lib/storage';
import { switchUserAccount, getCurrentAuth } from '@/lib/auth-store';
import { User, Role, Branch } from '@/lib/types';
import { UserCheck, ShieldCheck, Building2, KeyRound, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    initializeStorageIfNeeded();
    const uList = getUserList().filter(u => u.isAktif);
    const rList = getRoleList();
    const bList = getBranchList();

    setUsers(uList);
    setRoles(rList);
    setBranches(bList);

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
      setErrorMsg('Pilih pengguna terlebih dahulu.');
      return;
    }

    if (user.pin && user.pin !== pinInput) {
      setErrorMsg('PIN yang dimasukkan salah.');
      return;
    }

    switchUserAccount(user.id);
    window.dispatchEvent(new Event('userSwitched'));
    router.push('/');
  };

  const handleQuickSwitch = (user: User) => {
    switchUserAccount(user.id);
    window.dispatchEvent(new Event('userSwitched'));
    router.push('/');
  };

  return (
    <div className="py-2 space-y-5">
      {/* Header Banner */}
      <div className="text-center bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-md shadow-amber-200">
        <div className="inline-flex p-3 bg-white/20 backdrop-blur-md rounded-2xl mb-3">
          <Sparkles className="w-8 h-8 text-amber-200" />
        </div>
        <h2 className="text-xl font-black tracking-tight">Masuk Sistem Stok</h2>
        <p className="text-amber-100 text-xs mt-1">Usaha Sirup Markisa (Mobile Version)</p>
      </div>

      {/* Main Login Form */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
          <KeyRound className="w-4 h-4 text-amber-600" /> Masuk Akun
        </h3>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Pengguna</label>
            <select
              value={selectedUserId}
              onChange={e => {
                setSelectedUserId(e.target.value);
                const u = users.find(x => x.id === e.target.value);
                if (u) setPinInput(u.pin);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="">-- Pilih User --</option>
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Password (4-6 Digit)</label>
            <input
              type="password"
              placeholder="Masukkan PIN"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-200 active:scale-95 transition-all"
          >
            Masuk Aplikasi
          </button>
        </form>
      </div>

      {/* Quick Demo Role Switcher */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>Ganti Role Instan (Demo Mode)</span>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
        </h3>

        <div className="space-y-2">
          {users.map(u => {
            const role = roles.find(r => r.id === u.roleId);
            const assignedText =
              u.assignedBranchIds === 'ALL'
                ? 'Semua Branch'
                : branches
                    .filter(b => u.assignedBranchIds.includes(b.id))
                    .map(b => b.namaBranch)
                    .join(', ');

            return (
              <button
                key={u.id}
                onClick={() => handleQuickSwitch(u)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                    {u.nama}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-slate-600">{role?.namaRole}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <Building2 className="w-3 h-3" /> {assignedText}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-all">
                  Pilih
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
