'use client';

import React, { useEffect, useState } from 'react';
import { fetchFromGoogleSheets, syncToGoogleSheets } from '@/lib/google-sheets';
import { Settings, RefreshCw, Database, CheckCircle2, Radio, Server } from 'lucide-react';

export default function SettingsPage() {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleTestFetchLive = async () => {
    setIsSyncing(true);
    setSyncStatus('Membaca data live dari Google Sheets...');
    const res = await fetchFromGoogleSheets();
    setIsSyncing(false);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleTestPushLive = async () => {
    setIsSyncing(true);
    setSyncStatus('Mengirim data lokal ke Google Sheets...');
    const res = await syncToGoogleSheets();
    setIsSyncing(false);
    setSyncStatus(res.message);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-600" /> Pengaturan System Backend
        </h2>
        <p className="text-xs text-slate-500 font-medium">Status Integrasi & Sinkronisasi Database Google Sheets</p>
      </div>

      {/* Sync Test Alert */}
      {syncStatus && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl font-bold flex items-center gap-2 shadow-sm">
          <RefreshCw className={`w-4 h-4 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} /> {syncStatus}
        </div>
      )}

      {/* Connection Status Card */}
      <div className="glass-card rounded-2xl p-5 space-y-4 border-2 border-emerald-300 bg-emerald-50/30">
        <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Server Database Google Sheets</h3>
              <p className="text-[11px] text-slate-500">Terhubung secara otomatis via 2-Way Live Sync</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1.5 shadow-sm shadow-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung 🟢
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <Radio className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              Setiap kali transaksi baru dicatat (Produksi, Mutasi Kirim/Terima, Kasir Penjualan, atau User Baru), data <b>secara otomatis tersimpan ke Google Spreadsheet</b> di latar belakang.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Radio className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p>
              Setiap kali HP staf membuka website atau login, aplikasi <b>otomatis membaca data *realtime* terbaru</b> dari sel-sel Google Spreadsheet Anda.
            </p>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2 border-t border-emerald-200/70">
          <button
            type="button"
            onClick={handleTestFetchLive}
            disabled={isSyncing}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Tarik Data Terbaru dari Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={handleTestPushLive}
            disabled={isSyncing}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Kirim Data Lokal ke Spreadsheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
