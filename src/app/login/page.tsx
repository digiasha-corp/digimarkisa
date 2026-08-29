'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserList, saveUser, initializeStorageIfNeeded } from '@/lib/storage';
import { switchUserAccount } from '@/lib/auth-store';
import { User as UserType } from '@/lib/types';
import { KeyRound, Sparkles, Lock, User, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';
import { fetchFromGoogleSheets } from '@/lib/google-sheets';

export default function LoginPage() {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Memverifikasi Akun...');

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

    const cleanUsername = usernameInput.trim().replace(/^@/, '');
    if (!cleanUsername) {
      setErrorMsg('Silakan masukkan Username / ID Pengguna Anda.');
      return;
    }

    setIsLoggingIn(true);
    setLoadingText('Memverifikasi Akun & Mengambil Data Sheets...');

    await fetchFromGoogleSheets().catch(() => {});

    const allUsers = getUserList().filter(u => u.isAktif);
    
    // Strict Case-Sensitive Username Search
    const targetUser = allUsers.find(u => {
      const uName = String(u.username || '').trim().replace(/^@/, '');
      const uNama = String(u.nama || '').trim();
      const uId = String(u.id || '').trim();

      return uName === cleanUsername || uNama === cleanUsername || uId === cleanUsername;
    });

    if (!targetUser) {
      setIsLoggingIn(false);
      setErrorMsg('Username atau PIN yang Anda masukkan salah.');
      return;
    }

    const userPin = String(targetUser.pin ?? '').trim();
    const inputPin = String(pinInput ?? '').trim();

    // Check if user has empty PIN or default PIN
    const isDefaultOrEmptyPin = !userPin || userPin === '1234' || userPin === '1111' || userPin === '2222' || userPin === '3333';

    if (isDefaultOrEmptyPin) {
      if (!inputPin || inputPin === userPin || userPin === '1234') {
        setIsLoggingIn(false);
        setPendingUser(targetUser);
        setErrorMsg('');
        return;
      }
    }

    if (userPin && userPin !== inputPin) {
      setIsLoggingIn(false);
      setErrorMsg('Username atau PIN yang Anda masukkan salah.');
      return;
    }

    // Success login animation & redirect
    setLoadingText('Login Berhasil! Menyiapkan Halaman...');
    switchUserAccount(targetUser.id);
    window.dispatchEvent(new Event('userSwitched'));

    setTimeout(() => {
      router.push('/');
    }, 600);
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

    setIsLoggingIn(true);
    setLoadingText('Menyimpan PIN Baru...');

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
    }, 1000);
  };

  return (
    <div className="py-4 space-y-5 relative">
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
        <div className="glass-card rounded-2xl p-6 space-y-4 relative overflow-hidden">
          {/* Loading Overlay */}
          {isLoggingIn && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{loadingText}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Mohon tunggu sebentar...</p>
              </div>
            </div>
          )}

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
                  disabled={isLoggingIn}
                  placeholder="Masukkan Username (cth: admin, produksi)"
                  value={usernameInput}
                  onChange={e => {
                    setUsernameInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none disabled:opacity-50"
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
                  disabled={isLoggingIn}
                  placeholder="Masukkan PIN Keamanan"
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-9 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none tracking-wider disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memproses Login...</span>
                </>
              ) : (
                <span>Masuk Ke Aplikasi</span>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* VIEW 2: FORCED FIRST-TIME PIN SETUP FORM */
        <div className="glass-card rounded-2xl p-6 space-y-4 border-2 border-amber-400 relative overflow-hidden">
          {/* Loading Overlay */}
          {isLoggingIn && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-20 flex flex-col items-center justify-center p-6 text-center space-y-3 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{loadingText}</h4>
                <p className="text-xs text-slate-500 mt-0.5">Mohon tunggu sebentar...</p>
              </div>
            </div>
          )}

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
                disabled={isLoggingIn}
                placeholder="Masukkan 4-6 Digit PIN Baru"
                value={newPin}
                onChange={e => {
                  setNewPin(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Konfirmasi PIN Baru *</label>
              <input
                type="password"
                maxLength={6}
                required
                disabled={isLoggingIn}
                placeholder="Ulangi PIN Baru Anda"
                value={confirmPin}
                onChange={e => {
                  setConfirmPin(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none text-center tracking-widest disabled:opacity-50"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                disabled={isLoggingIn}
                onClick={() => {
                  setPendingUser(null);
                  setNewPin('');
                  setConfirmPin('');
                  setErrorMsg('');
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-md shadow-amber-200 active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <span>Simpan PIN Baru</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
