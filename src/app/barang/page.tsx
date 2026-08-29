'use client';

import React, { useEffect, useState } from 'react';
import { getBarangList, saveBarang, deleteBarang, toggleBarangStatus, canDeleteBarang } from '@/lib/storage';
import { Barang, SatuanUkuran } from '@/lib/types';
import { Wine, Plus, Search, Power, Trash2, Edit3, ShieldAlert, CheckCircle2, ArrowLeft, Save } from 'lucide-react';

const UNITS: SatuanUkuran[] = ['ml', 'Lt', 'kg', 'gr', 'pcs', 'pack', 'botol', 'galon'];

export default function PendaftaranBarangPage() {
  const [items, setItems] = useState<Barang[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Full-Page View Mode State: 'list' | 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingItem, setEditingItem] = useState<Barang | null>(null);

  // Form State
  const [namaBarang, setNamaBarang] = useState('');
  const [kodeBarang, setKodeBarang] = useState('');
  const [nilaiUkuran, setNilaiUkuran] = useState<number>(500);
  const [satuanUkuran, setSatuanUkuran] = useState<string>('ml');
  const [keterangan, setKeterangan] = useState('');

  // Delete Audit Modal State
  const [deleteCandidate, setDeleteCandidate] = useState<Barang | null>(null);
  const [deleteAuditCheck, setDeleteAuditCheck] = useState<{ canDelete: boolean; reason?: string } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    setItems(getBarangList());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNamaBarang('');
    setKodeBarang(`SRP-${Math.floor(100 + Math.random() * 900)}`);
    setNilaiUkuran(500);
    setSatuanUkuran('ml');
    setKeterangan('');
    setViewMode('form');
  };

  const handleOpenEdit = (item: Barang) => {
    setEditingItem(item);
    setNamaBarang(item.namaBarang);
    setKodeBarang(item.kodeBarang);
    setNilaiUkuran(item.nilaiUkuran);
    setSatuanUkuran(item.satuanUkuran);
    setKeterangan(item.keterangan);
    setViewMode('form');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBarang.trim() || !kodeBarang.trim()) {
      alert('Nama Barang dan Kode Barang wajib diisi.');
      return;
    }

    const newItem: Barang = {
      id: editingItem ? editingItem.id : `brg-${Date.now()}`,
      namaBarang: namaBarang.trim(),
      kodeBarang: kodeBarang.trim().toUpperCase(),
      nilaiUkuran: Number(nilaiUkuran) || 0,
      satuanUkuran,
      keterangan: keterangan.trim(),
      isAktif: editingItem ? editingItem.isAktif : true,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    saveBarang(newItem);
    setViewMode('list');
    loadData();

    setFeedbackMsg({
      type: 'success',
      text: editingItem ? 'Data barang berhasil diperbarui!' : 'Barang baru berhasil didaftarkan!',
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggleStatus = (item: Barang) => {
    toggleBarangStatus(item.id);
    loadData();
  };

  const handleInitiateDelete = (item: Barang) => {
    setDeleteCandidate(item);
    const audit = canDeleteBarang(item.id);
    setDeleteAuditCheck(audit);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;
    const res = deleteBarang(deleteCandidate.id);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      loadData();
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setDeleteCandidate(null);
    setDeleteAuditCheck(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const filteredItems = items.filter(
    it =>
      it.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3 text-xs rounded-xl font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> {feedbackMsg.text}
        </div>
      )}

      {/* MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-600" /> Pendaftaran Barang
              </h2>
              <p className="text-xs text-slate-500 font-medium">Master produk sirup markisa & varian ukuran</p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari kode or nama barang..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Product List */}
          <div className="space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 glass-card rounded-2xl text-slate-400 text-xs">
                Tidak ada barang terdaftar.
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className={`p-3.5 glass-card rounded-2xl transition-all border ${
                    item.isAktif ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {item.kodeBarang}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isAktif ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-1">{item.namaBarang}</h3>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                          Ukuran: {item.nilaiUkuran} {item.satuanUkuran}
                        </span>
                      </div>

                      {item.keterangan && (
                        <p className="text-xs text-slate-500 italic mt-1.5">{item.keterangan}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        title={item.isAktif ? 'Non-aktifkan Barang' : 'Aktifkan Barang'}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                          item.isAktif ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs"
                        title="Edit Barang"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleInitiateDelete(item)}
                        className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 text-xs"
                        title="Hapus Barang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODE 2: DEDICATED FULL-PAGE FORM VIEW */}
      {viewMode === 'form' && (
        <div className="space-y-4">
          {/* Back Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" /> Kembali ke Daftar
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm">
              {editingItem ? 'Edit Data Barang' : 'Pendaftaran Barang Baru'}
            </h3>
          </div>

          {/* Full-Page Form Container */}
          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Barang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sirup Markisa Murni Extra Super"
                  value={namaBarang}
                  onChange={e => setNamaBarang(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Barang (SKU / Barcode) *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SRP-MRN-500ML"
                  value={kodeBarang}
                  onChange={e => setKodeBarang(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Angka Ukuran *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Contoh: 500 atau 1"
                    value={nilaiUkuran}
                    onChange={e => setNilaiUkuran(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Ukuran *</label>
                  <select
                    value={satuanUkuran}
                    onChange={e => setSatuanUkuran(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {UNITS.map(u => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan Produk</label>
                <textarea
                  rows={4}
                  placeholder="Catatan tambahan mengenai produk sirup markisa ini..."
                  value={keterangan}
                  onChange={e => setKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-600 text-white rounded-xl text-xs font-extrabold hover:bg-amber-700 shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan Barang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation & Audit Check Modal */}
      {deleteCandidate && deleteAuditCheck && (
        <div className="modal-overlay">
          <div className="modal-dialog max-w-sm text-center">
            <div className="p-5 space-y-4">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${deleteAuditCheck.canDelete ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus "{deleteCandidate.namaBarang}"?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Kode: <span className="font-mono font-bold text-slate-700">{deleteCandidate.kodeBarang}</span>
                </p>
              </div>

              {!deleteAuditCheck.canDelete ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs space-y-1">
                  <div className="font-bold text-rose-800">⚠️ Barang Tidak Dapat Dihapus!</div>
                  <div className="text-rose-700">{deleteAuditCheck.reason}</div>
                  <div className="text-slate-600 text-[11px] mt-1 pt-1 border-t border-rose-200">
                    💡 Solusi: Anda disarankan untuk menggunakan tombol <b>Non-Aktifkan</b> agar barang tidak muncul di transaksi baru tanpa merusak riwayat database.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-800">
                  ✅ Barang ini belum pernah dicatat dalam transaksi apapun dan aman untuk dihapus permanen.
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setDeleteCandidate(null);
                    setDeleteAuditCheck(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Kembali
                </button>
                {deleteAuditCheck.canDelete && (
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-200"
                  >
                    Ya, Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
