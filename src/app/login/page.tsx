'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserList, saveUser, initializeStorageIfNeeded } from '@/lib/storage';
import { switchUserAccount } from '@/lib/auth-store';
import { User as UserType } from '@/lib/types';
import { KeyRound, Sparkles, Lock, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

import { fetchFromGoogleSheets } from '@/lib/google-sheets';

export default function LoginPage() {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isFetchingLive, setIsFetchingLive] = useState<boolean>(false);

  // Forced Change PIN State
  const [pendingUser, setPendingUser] = useState<UserType | null>(null);
  const [newPin, setNewPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState<string>('');

  useEffect(() => {
    initializeStorageIfNeeded();
    fetchFromGoogleSheets().catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = usernameInput.trim().toLowerCase().replace(/^@/, '');
    if (!cleanUsername) {
      setErrorMsg('Silakan masukkan Username / ID Pengguna Anda.');
      return;
    }

    setIsFetchingLive(true);
    await fetchFromGoogleSheets().catch(() => {});
    setIsFetchingLive(false);

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

    // Check if user has empty PIN or default PIN
    const isDefaultOrEmptyPin = !targetUser.pin || targetUser.pin === '1234' || targetUser.pin === '1111' || targetUser.pin === '2222' || targetUser.pin === '3333';

    if (isDefaultOrEmptyPin) {
      // If PIN is default/empty, verify if they entered blank or default PIN to trigger forced change
      if (!pinInput || pinInput === targetUser.pin || targetUser.pin === '1234') {
        setPendingUser(targetUser);
        setErrorMsg('');
        return;
      }
    }

    if (targetUser.pin && targetUser.pin !== pinInput) {
      setErrorMsg('Username atau PIN yang Anda masukkan salah.');
      return;
    }

    // Success login
    switchUserAccount(targetUser.id);
    window.dispatchEvent(new Event('userSwitched'));
    router.push('/');
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!pendingUser) return;

    if (!newPin || newPin.length < 4) {
      setErrorMsg('PIN Baru minimal harus terdiri dari 4 digit angka.');
      return;
    }

    if (newPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN Baru tidak cocok. Silakan periksa kembali.');
      return;
    }

    if (newPin === '1234') {
      setErrorMsg('Jangan menggunakan PIN bawaan "1234". Buat PIN rahasia unik Anda.');
      return;
    }

    // Save updated user PIN
    const updatedUser: UserType = {
      ...pendingUser,
      pin: newPin,
    };

    saveUser(updatedUser);
    switchUserAccount(updatedUser.id);
    window.dispatchEvent(new Event('userSwitched'));

    setPinSuccessMsg('PIN Baru Anda berhasil dibuat! Mengalihkan ke Dashboard...');
    setTimeout(() => {
      router.push('/');
    }, 1500);
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

      {/* VIEW 1: NORMAL LOGIN FORM */}
      {!pendingUser ? (
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
                  placeholder="Masukkan PIN Keamanan (atau Kosongkan jika Pendaftaran Baru)"
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
      ) : (
        /* VIEW 2: FORCED FIRST-TIME PIN SETUP FORM */
        <div className="glass-card rounded-2xl p-6 space-y-4 border-2 border-amber-400">
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-amber-900">Wajib Buat PIN Baru (Pertama Kali)</h4>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                Halo <b>{pendingUser.nama}</b>, PIN akun Anda saat ini masih PIN bawaan/kosong. Demi keamanan, silakan buat PIN pribadi rahasia Anda.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {pinSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{pinSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveNewPin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Buat PIN Baru (4-6 Digit Angka) *</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="Masukkan 4-6 Digit PIN Baru"
                value={newPin}
                onChange={e => {
                  setNewPin(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Konfirmasi PIN Baru *</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="Ulangi PIN Baru Anda"
                value={confirmPin}
                onChange={e => {
                  setConfirmPin(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPendingUser(null);
                  setNewPin('');
                  setConfirmPin('');
                  setErrorMsg('');
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 active:scale-95 transition-all uppercase tracking-wider"
              >
                Simpan PIN Baru
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
