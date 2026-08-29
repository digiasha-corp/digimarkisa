'use client';

import React, { useEffect, useState } from 'react';
import { getBarangList, getBranchList, addProduksiTransaction, getProduksiList } from '@/lib/storage';
import { getCurrentAuth } from '@/lib/auth-store';
import { Barang, Branch, TransaksiProduksi, ItemProduksi } from '@/lib/types';
import { Factory, CheckCircle2, History, PackageCheck, AlertCircle, Plus, Trash2, Layers } from 'lucide-react';

export default function HasilProduksiPage() {
  const auth = getCurrentAuth();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [produksiBranches, setProduksiBranches] = useState<Branch[]>([]);
  const [history, setHistory] = useState<TransaksiProduksi[]>([]);

  // Form State
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');

  // Multi-Product Production Items Table State
  const [rows, setRows] = useState<ItemProduksi[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const generateDefaultBatch = () => `BATCH-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}`;

  const loadData = () => {
    const allBarang = getBarangList().filter(b => b.isAktif);
    setBarangList(allBarang);

    const allowed = auth.allowedBranches.filter(b => b.isAktif && Array.isArray(b.tipe) && b.tipe.includes('Produksi'));
    setProduksiBranches(allowed);
    if (allowed.length > 0 && !selectedBranchId) {
      setSelectedBranchId(allowed[0].id);
    }

    if (allBarang.length > 0 && rows.length === 0) {
      setRows([
        {
          barangId: allBarang[0].id,
          namaBarang: `${allBarang[0].namaBarang} (${allBarang[0].nilaiUkuran} ${allBarang[0].satuanUkuran})`,
          jumlah: 50,
          noBatch: generateDefaultBatch(),
          catatan: '',
        },
      ]);
    }

    setHistory(getProduksiList());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddRow = () => {
    if (barangList.length === 0) return;
    const defaultBrg = barangList[0];
    setRows([
      ...rows,
      {
        barangId: defaultBrg.id,
        namaBarang: `${defaultBrg.namaBarang} (${defaultBrg.nilaiUkuran} ${defaultBrg.satuanUkuran})`,
        jumlah: 50,
        noBatch: generateDefaultBatch(),
        catatan: '',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) {
      alert('Minimal 1 item hasil produksi.');
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof ItemProduksi, value: any) => {
    const updated = [...rows];
    if (field === 'barangId') {
      const selectedBrg = barangList.find(b => b.id === value);
      updated[index].barangId = value;
      updated[index].namaBarang = selectedBrg ? `${selectedBrg.namaBarang} (${selectedBrg.nilaiUkuran} ${selectedBrg.satuanUkuran})` : 'Produk';
    } else {
      (updated[index] as any)[field] = value;
    }
    setRows(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId) {
      setFeedback({ type: 'error', text: 'Anda tidak memiliki hak akses ke Branch ber-fungsi Produksi.' });
      return;
    }

    const invalidRow = rows.find(r => !r.barangId || r.jumlah <= 0 || !r.noBatch?.trim());
    if (invalidRow) {
      setFeedback({ type: 'error', text: 'Pastikan seluruh baris tabel diisi dengan barang, jumlah > 0, dan nomor batch.' });
      return;
    }

    const res = addProduksiTransaction({
      branchId: selectedBranchId,
      items: rows,
      userId: auth.user?.id || 'sys',
      userNama: auth.user?.nama || 'Operator',
      catatan: catatan.trim(),
    });

    setFeedback({
      type: 'success',
      text: `Hasil produksi ${rows.length} jenis barang berhasil dicatat! No. Produksi: ${res.noProduksi}.`,
    });

    if (barangList.length > 0) {
      setRows([
        {
          barangId: barangList[0].id,
          namaBarang: `${barangList[0].namaBarang} (${barangList[0].nilaiUkuran} ${barangList[0].satuanUkuran})`,
          jumlah: 50,
          noBatch: generateDefaultBatch(),
          catatan: '',
        },
      ]);
    }
    setCatatan('');
    loadData();

    setTimeout(() => setFeedback(null), 4000);
  };

  if (!auth.role?.permissions.canAddProduction) {
    return (
      <div className="text-center py-12 glass-card rounded-2xl p-5 space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="font-bold text-slate-800 text-sm">Akses Terbatas!</h3>
        <p className="text-xs text-slate-500">Anda tidak memiliki izin untuk menginput Hasil Produksi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white rounded-3xl p-4 shadow-md shadow-amber-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
            <Factory className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold">Input Hasil Produksi</h2>
            <p className="text-amber-100 text-[11px]">Pencatatan batch hasil masak pabrik dalam tabel produk</p>
          </div>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-3 text-xs rounded-2xl font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> {feedback.text}
        </div>
      )}

      {/* Sleek Form Container */}
      <div className="glass-card rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" /> Form Tabel Output Produksi
          </h3>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
            {rows.length} Item
          </span>
        </div>

        {produksiBranches.length === 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl">
            ⚠️ Tidak ada Branch ber-fungsi <b>Produksi</b> yang ditugaskan ke akun Anda ({auth.user?.nama}).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Lokasi Pabrik / Produksi</label>
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {produksiBranches.map(b => (
                  <option key={b.id} value={b.id}>
                    🏭 {b.namaBranch} ({b.kodeBranch})
                  </option>
                ))}
              </select>
            </div>

            {/* Compact Table View */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Tabel Rincian Produksi</span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              </div>

              {/* Responsive Compact Scrollable Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="p-2 min-w-[140px]">Nama Produk</th>
                      <th className="p-2 w-20">Jumlah</th>
                      <th className="p-2 w-28">Nomor Batch</th>
                      <th className="p-2 min-w-[110px]">Keterangan</th>
                      <th className="p-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, index) => (
                      <tr key={index} className="hover:bg-amber-50/30 transition-colors">
                        {/* 1. Nama Produk */}
                        <td className="p-1.5">
                          <select
                            value={row.barangId}
                            onChange={e => handleUpdateRow(index, 'barangId', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-amber-500"
                          >
                            {barangList.map(brg => (
                              <option key={brg.id} value={brg.id}>
                                {brg.namaBarang} ({brg.nilaiUkuran} {brg.satuanUkuran})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 2. Jumlah */}
                        <td className="p-1.5">
                          <input
                            type="number"
                            min="1"
                            required
                            value={row.jumlah}
                            onChange={e => handleUpdateRow(index, 'jumlah', Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500 text-center"
                          />
                        </td>

                        {/* 3. Nomor Batch */}
                        <td className="p-1.5">
                          <input
                            type="text"
                            required
                            value={row.noBatch || ''}
                            onChange={e => handleUpdateRow(index, 'noBatch', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono font-bold text-slate-800 uppercase outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </td>

                        {/* 4. Keterangan */}
                        <td className="p-1.5">
                          <input
                            type="text"
                            placeholder="Opsional..."
                            value={row.catatan || ''}
                            onChange={e => handleUpdateRow(index, 'catatan', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                          />
                        </td>

                        {/* Action Hapus Baris */}
                        <td className="p-1.5 text-center">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(index)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Catatan Tambahan Sesi Produksi</label>
              <input
                type="text"
                placeholder="Catatan umum sesi produksi..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-200 active:scale-95 transition-all mt-1"
            >
              Simpan Hasil Produksi ({rows.length} Produk)
            </button>
          </form>
        )}
      </div>

      {/* Recent Production Logs */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 flex items-center justify-between uppercase tracking-wider">
          <span>Riwayat Produksi Terakhir</span>
          <History className="w-4 h-4 text-amber-600" />
        </h3>

        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">Belum ada riwayat produksi.</p>
          ) : (
            history.slice(0, 5).map(h => (
              <div key={h.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-mono font-bold text-amber-800">{h.noProduksi}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(h.tanggal).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="space-y-1">
                  {h.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                      <span className="font-bold text-slate-800 truncate max-w-[180px]">{it.namaBarang}</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        +{it.jumlah} • <span className="font-mono text-slate-600">{it.noBatch}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 text-right pt-0.5">
                  Petugas: <b>{h.userNama}</b>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
