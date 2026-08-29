'use client';

import React, { useEffect, useState } from 'react';
import { getBranchList, saveBranch, toggleBranchStatus } from '@/lib/storage';
import { Branch, TipeBranch } from '@/lib/types';
import { Building, Plus, Factory, Warehouse, Store, Power, Edit3, CheckSquare, Square, ArrowLeft, Save } from 'lucide-react';

const TIPE_OPTIONS: { type: TipeBranch; label: string; icon: any; color: string }[] = [
  { type: 'Produksi', label: 'Produksi (Pabrik)', icon: Factory, color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { type: 'Gudang', label: 'Gudang (Storage)', icon: Warehouse, color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { type: 'Store', label: 'Store (Outlet Toko)', icon: Store, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
];

export default function BranchManagementPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  // Full-Page View Mode State: 'list' | 'form'
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [namaBranch, setNamaBranch] = useState('');
  const [kodeBranch, setKodeBranch] = useState('');
  const [selectedTipes, setSelectedTipes] = useState<TipeBranch[]>(['Gudang']);
  const [alamat, setAlamat] = useState('');

  const loadData = () => {
    setBranches(getBranchList());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setNamaBranch('');
    setKodeBranch(`BCH-${Math.floor(100 + Math.random() * 900)}`);
    setSelectedTipes(['Produksi', 'Gudang', 'Store']);
    setAlamat('');
    setViewMode('form');
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setNamaBranch(b.namaBranch);
    setKodeBranch(b.kodeBranch);
    setSelectedTipes(Array.isArray(b.tipe) ? b.tipe : [b.tipe]);
    setAlamat(b.alamat);
    setViewMode('form');
  };

  const handleToggleTipe = (type: TipeBranch) => {
    if (selectedTipes.includes(type)) {
      if (selectedTipes.length === 1) {
        alert('Setidaknya 1 tipe fungsi branch harus dipilih.');
        return;
      }
      setSelectedTipes(selectedTipes.filter(t => t !== type));
    } else {
      setSelectedTipes([...selectedTipes, type]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBranch.trim() || !kodeBranch.trim()) {
      alert('Nama dan Kode Branch wajib diisi.');
      return;
    }

    const newBranch: Branch = {
      id: editingBranch ? editingBranch.id : `branch-${Date.now()}`,
      kodeBranch: kodeBranch.trim().toUpperCase(),
      namaBranch: namaBranch.trim(),
      tipe: selectedTipes,
      alamat: alamat.trim(),
      isAktif: editingBranch ? editingBranch.isAktif : true,
      createdAt: editingBranch ? editingBranch.createdAt : new Date().toISOString(),
    };

    saveBranch(newBranch);
    setViewMode('list');
    loadData();
  };

  const handleToggleStatus = (b: Branch) => {
    toggleBranchStatus(b.id);
    loadData();
  };

  return (
    <div className="space-y-4">
      {/* MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-600" /> Branch Management
              </h2>
              <p className="text-xs text-slate-500 font-medium">Pengelolaan cabang (1 Branch dapat memiliki 3 Tipe sekaligus)</p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>

          {/* Branch List */}
          <div className="space-y-2.5">
            {branches.map(b => {
              const tipes: TipeBranch[] = Array.isArray(b.tipe) ? b.tipe : [b.tipe];

              return (
                <div
                  key={b.id}
                  className={`p-3.5 glass-card rounded-2xl transition-all border ${
                    b.isAktif ? 'border-slate-200' : 'border-slate-200 bg-slate-50/70 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {b.kodeBranch}
                        </span>

                        {tipes.map(t => {
                          const meta = TIPE_OPTIONS.find(x => x.type === t) || TIPE_OPTIONS[0];
                          const Icon = meta.icon;
                          return (
                            <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.color} flex items-center gap-1`}>
                              <Icon className="w-3 h-3" /> {t}
                            </span>
                          );
                        })}

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${b.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {b.isAktif ? 'Aktif' : 'Non-Aktif'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mt-1.5">{b.namaBranch}</h3>

                      {b.alamat && <p className="text-xs text-slate-500 mt-1">{b.alamat}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(b)}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          b.isAktif ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}
                        title={b.isAktif ? 'Non-aktifkan' : 'Aktifkan'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs"
                        title="Edit Branch"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              {editingBranch ? 'Edit Data Branch' : 'Tambah Branch Baru'}
            </h3>
          </div>

          {/* Full-Page Form Container */}
          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Branch / Cabang *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pusat Produksi & Store Markisa Utama"
                  value={namaBranch}
                  onChange={e => setNamaBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Branch *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: HQ-MEDAN"
                  value={kodeBranch}
                  onChange={e => setKodeBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 uppercase focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fungsi Tipe Branch (Multi-Select) *</label>
                <p className="text-[11px] text-slate-500 mb-2">1 Branch dapat mencakup 3 fungsi sekaligus:</p>
                <div className="space-y-2">
                  {TIPE_OPTIONS.map(opt => {
                    const isChecked = selectedTipes.includes(opt.type);
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => handleToggleTipe(opt.type)}
                        className={`w-full p-3 rounded-2xl text-xs font-bold border flex items-center justify-between transition-all ${
                          isChecked
                            ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-amber-600" />
                          <span>{opt.label}</span>
                        </span>
                        {isChecked ? <CheckSquare className="w-4 h-4 text-amber-600" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lokasi Branch</label>
                <textarea
                  rows={4}
                  placeholder="Alamat lengkap lokasi branch..."
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
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
                  <Save className="w-4 h-4" /> Simpan Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
