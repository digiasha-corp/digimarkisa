'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getGoogleSheetsConfig, saveGoogleSheetsConfig } from '@/lib/storage';
import { generateGoogleAppsScriptCode, syncToGoogleSheets } from '@/lib/google-sheets';
import { GoogleSheetsConfig } from '@/lib/types';
import { Settings, Copy, RefreshCw, Database, Code, CheckCircle2, ToggleLeft, ToggleRight, Radio } from 'lucide-react';

export default function SettingsPage() {
  const [config, setConfig] = useState<GoogleSheetsConfig>({ webAppUrl: '', autoSync: false });
  const [copied, setCopied] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scriptCode = generateGoogleAppsScriptCode();

  useEffect(() => {
    setConfig(getGoogleSheetsConfig());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveGoogleSheetsConfig(config);
    setSyncStatus('Pengaturan berhasil disimpan!');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleToggleAutoSync = () => {
    const updated = { ...config, autoSync: !config.autoSync };
    setConfig(updated);
    saveGoogleSheetsConfig(updated);
  };

  const handleCopyScript = () => {
    try {
      if (textareaRef.current) {
        textareaRef.current.select();
        textareaRef.current.setSelectionRange(0, 99999);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(scriptCode).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        }).catch(() => {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        });
      } else {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      alert('Silakan pilih dan salin kode teks secara manual dari kotak di bawah.');
    }
  };

  const handleTestSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Menguji koneksi ke Google Sheets...');
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
          <Settings className="w-5 h-5 text-amber-600" /> Pengaturan Backend
        </h2>
        <p className="text-xs text-slate-500 font-medium">Integrasi Google Sheets & Konfigurasi Sinkronisasi</p>
      </div>

      {/* Sync Test Alert */}
      {syncStatus && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl font-bold flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 text-amber-600 ${isSyncing ? 'animate-spin' : ''}`} /> {syncStatus}
        </div>
      )}

      {/* Mode Sinkronisasi Explanation Card */}
      <div className="glass-card rounded-2xl p-4 space-y-3 bg-amber-50/40 border border-amber-200">
        <h3 className="font-bold text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <Radio className="w-4 h-4 text-amber-600" /> Mode Sinkronisasi Data Spreadsheet
        </h3>

        <div className="space-y-2 text-xs text-slate-700">
          <div className="flex items-start gap-2">
            <span className="p-1 bg-amber-100 text-amber-800 rounded font-bold text-[10px]">1</span>
            <div>
              <b>Mode Manual (Tombol Sync)</b>: Data disimpan lokal di HP. Admin/Petugas menekan tombol <b>"Sync"</b> di header atas atau <b>"Tes Sync"</b> saat ingin mengirim rekapan ke Google Sheets.
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="p-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">2</span>
            <div>
              <b>Mode Otomatis (Auto-Sync Setiap Transaksi)</b>: Setiap kali ada transaksi baru (Input Produksi, Kirim Mutasi, Terima Barang, atau Penjualan Kasir), aplikasi secara <b>otomatis mengirim data di latar belakang</b> ke Google Sheets tanpa perlu tekan tombol secara manual.
            </div>
          </div>
        </div>

        {/* Auto Sync Toggle Button */}
        <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800">Status Auto-Sync Transaksi:</span>
          <button
            type="button"
            onClick={handleToggleAutoSync}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              config.autoSync
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {config.autoSync ? (
              <>
                <ToggleRight className="w-4 h-4" /> Auto-Sync AKTIF
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-500" /> Auto-Sync NON-AKTIF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Config Form */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-600" /> Google Sheets API Web App URL
        </h3>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Google Apps Script Web App URL</label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={config.webAppUrl}
              onChange={e => setConfig({ ...config, webAppUrl: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Simpan Konfigurasi
            </button>
            <button
              type="button"
              onClick={handleTestSync}
              disabled={isSyncing || !config.webAppUrl}
              className="flex-1 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 disabled:opacity-50"
            >
              Tes Sync Sekarang
            </button>
          </div>
        </form>
      </div>

      {/* Google Apps Script Code Copy Card */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Code className="w-4 h-4 text-amber-600" /> Script Backend Google Apps Script
          </h3>
          <button
            type="button"
            onClick={handleCopyScript}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 active:scale-95 transition-all shadow-md shadow-amber-200"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
            <span>{copied ? 'Tercopy ke Clipboard!' : 'Salin Kode Script'}</span>
          </button>
        </div>

        {copied && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Kode Apps Script berhasil tersalin ke clipboard! Buka Google Apps Script lalu tekan Ctrl+V (Paste).
          </div>
        )}

        <p className="text-xs text-slate-600">
          Salin kode di bawah ini lalu tempelkan ke Google Apps Script di Spreadsheet Anda.
        </p>

        {/* Interactive Selectable Textarea */}
        <textarea
          ref={textareaRef}
          readOnly
          value={scriptCode}
          onClick={e => (e.target as HTMLTextAreaElement).select()}
          className="w-full h-56 p-3 bg-slate-900 text-amber-300 rounded-xl text-[11px] font-mono outline-none border border-slate-800 resize-y"
        />
      </div>
    </div>
  );
}
