'use client';

import React, { useEffect, useState } from 'react';
import { getBarangList, getBranchList, addTransferShipment, receiveTransfer, getTransferList, getStokForBranchAndBarang } from '@/lib/storage';
import { getCurrentAuth } from '@/lib/auth-store';
import { Barang, Branch, TransaksiTransfer, ItemTransfer } from '@/lib/types';
import { ArrowLeftRight, Send, CheckCircle2, Clock, PackageCheck, Plus, Trash2, Layers } from 'lucide-react';

export default function MutasiTransferPage() {
  const auth = getCurrentAuth();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transfers, setTransfers] = useState<TransaksiTransfer[]>([]);

  // Tab
  const [activeTab, setActiveTab] = useState<'kirim' | 'terima'>('kirim');

  // Form Pengiriman Header
  const [branchAsalId, setBranchAsalId] = useState('');
  const [branchTujuanId, setBranchTujuanId] = useState('');
  const [catatan, setCatatan] = useState('');

  // Multi-Product Transfer Items Table: Columns: Nama Produk | Jumlah | Keterangan
  const [rows, setRows] = useState<ItemTransfer[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    const allBarang = getBarangList().filter(b => b.isAktif);
    setBarangList(allBarang);

    const allBranches = getBranchList().filter(b => b.isAktif);
    setBranches(allBranches);

    if (auth.allowedBranches.length > 0 && !branchAsalId) {
      setBranchAsalId(auth.allowedBranches[0].id);
    }

    const otherBranch = allBranches.find(b => b.id !== (auth.allowedBranches[0]?.id || branchAsalId));
    if (otherBranch && !branchTujuanId) {
      setBranchTujuanId(otherBranch.id);
    }

    if (allBarang.length > 0 && rows.length === 0) {
      setRows([
        {
          barangId: allBarang[0].id,
          namaBarang: `${allBarang[0].namaBarang} (${allBarang[0].nilaiUkuran} ${allBarang[0].satuanUkuran})`,
          jumlah: 20,
          catatan: '',
        },
      ]);
    }

    setTransfers(getTransferList());
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
        jumlah: 20,
        catatan: '',
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) {
      alert('Minimal 1 item mutasi pengiriman.');
      return;
    }
    setRows(rows.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof ItemTransfer, value: any) => {
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

  const handleSendShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchAsalId || !branchTujuanId) {
      setFeedback({ type: 'error', text: 'Pilih Branch Asal dan Branch Tujuan.' });
      return;
    }
    if (branchAsalId === branchTujuanId) {
      setFeedback({ type: 'error', text: 'Branch Asal dan Branch Tujuan tidak boleh sama.' });
      return;
    }

    const invalidRow = rows.find(r => !r.barangId || r.jumlah <= 0);
    if (invalidRow) {
      setFeedback({ type: 'error', text: 'Pastikan seluruh baris tabel dipilih barang dan jumlah > 0.' });
      return;
    }

    const res = addTransferShipment({
      branchAsalId,
      branchTujuanId,
      items: rows,
      userPengirimId: auth.user?.id || 'sys',
      userPengirimNama: auth.user?.nama || 'Operator',
      catatan: catatan.trim(),
    });

    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      if (barangList.length > 0) {
        setRows([
          {
            barangId: barangList[0].id,
            namaBarang: `${barangList[0].namaBarang} (${barangList[0].nilaiUkuran} ${barangList[0].satuanUkuran})`,
            jumlah: 20,
            catatan: '',
          },
        ]);
      }
      setCatatan('');
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.message });
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  const handleConfirmReceipt = (transferId: string) => {
    const res = receiveTransfer(transferId, auth.user?.id || 'sys', auth.user?.nama || 'Penerima');
    if (res.success) {
      setFeedback({ type: 'success', text: res.message });
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.message });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  const pendingInTransitList = transfers.filter(t => {
    if (t.status !== 'In Transit') return false;
    if (auth.user?.assignedBranchIds === 'ALL' || auth.role?.permissions.canViewAllBranches) return true;
    return auth.allowedBranches.some(b => b.id === t.branchTujuanId);
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-700 text-white rounded-3xl p-4 shadow-md shadow-blue-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
            <ArrowLeftRight className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold">Mutasi & Serah Terima</h2>
            <p className="text-blue-100 text-[11px]">Pengiriman 2-Arah (Status: In Transit → On Hand)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('kirim')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'kirim' ? 'bg-white text-blue-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          <Send className="w-3.5 h-3.5" /> Kirim Barang ({rows.length} Item)
        </button>
        <button
          onClick={() => setActiveTab('terima')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'terima' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5" /> Terima In-Transit ({pendingInTransitList.length})
        </button>
      </div>

      {/* Feedback Banner */}
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

      {/* Kirim Barang Form (Compact Table View) */}
      {activeTab === 'kirim' && (
        <div className="glass-card rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-blue-600" /> Form Tabel Pengiriman Mutasi
            </h3>
            <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
              {rows.length} Produk Mutasi
            </span>
          </div>

          <form onSubmit={handleSendShipment} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Branch Asal (Pengirim)</label>
              <select
                value={branchAsalId}
                onChange={e => setBranchAsalId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    🏢 {b.namaBranch} ({b.tipe.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Branch Tujuan (Penerima)</label>
              <select
                value={branchTujuanId}
                onChange={e => setBranchTujuanId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} disabled={b.id === branchAsalId}>
                    🏢 {b.namaBranch} ({b.tipe.join(', ')})
                  </option>
                ))}
              </select>
            </div>

            {/* Table View: Columns: Nama Produk | Jumlah | Keterangan */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Tabel Item Mutasi</span>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Baris
                </button>
              </div>

              {/* Scrollable Compact Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <th className="p-2 min-w-[150px]">Nama Produk (Sisa Stok)</th>
                      <th className="p-2 w-20">Jumlah</th>
                      <th className="p-2 min-w-[120px]">Keterangan</th>
                      <th className="p-2 w-8 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row, index) => {
                      const stokTersedia = getStokForBranchAndBarang(branchAsalId, row.barangId);

                      return (
                        <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                          {/* 1. Nama Produk */}
                          <td className="p-1.5">
                            <select
                              value={row.barangId}
                              onChange={e => handleUpdateRow(index, 'barangId', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {barangList.map(brg => (
                                <option key={brg.id} value={brg.id}>
                                  {brg.namaBarang} ({brg.nilaiUkuran} {brg.satuanUkuran})
                                </option>
                              ))}
                            </select>
                            <div className="text-[10px] text-amber-700 font-bold mt-0.5 pl-1">
                              Sisa Stok Asal: {stokTersedia}
                            </div>
                          </td>

                          {/* 2. Jumlah */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="1"
                              required
                              value={row.jumlah}
                              onChange={e => handleUpdateRow(index, 'jumlah', Number(e.target.value))}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 text-center outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>

                          {/* 3. Keterangan */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              placeholder="Opsional..."
                              value={row.catatan || ''}
                              onChange={e => handleUpdateRow(index, 'catatan', e.target.value)}
                              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Catatan Pengiriman Armada</label>
              <input
                type="text"
                placeholder="Misal: Dikirim via armada mobil boks plat BK 1234..."
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-200 active:scale-95 transition-all mt-1 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Kirim {rows.length} Barang (Status: In Transit)
            </button>
          </form>
        </div>
      )}

      {/* Terima Barang Tab (In Transit Queue) */}
      {activeTab === 'terima' && (
        <div className="space-y-3">
          <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 text-xs rounded-2xl flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span>
              Tekan tombol <b>"Konfirmasi Terima Barang"</b> ketika fisik pengiriman sudah sampai dan diperiksa di branch Anda.
            </span>
          </div>

          {pendingInTransitList.length === 0 ? (
            <div className="text-center py-10 glass-card rounded-2xl text-slate-400 text-xs">
              Tidak ada pengiriman barang yang sedang <b>In Transit</b> untuk lokasi Anda.
            </div>
          ) : (
            pendingInTransitList.map(t => {
              const branchAsal = branches.find(b => b.id === t.branchAsalId);
              const branchTujuan = branches.find(b => b.id === t.branchTujuanId);

              return (
                <div key={t.id} className="p-4 glass-card rounded-2xl border border-purple-200 space-y-3 bg-purple-50/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md">
                      {t.noMutasi}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md badge-transit">
                      🚚 In Transit ({t.items.length} Item)
                    </span>
                  </div>

                  {/* Multi Item List */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-700 mb-1 border-b pb-1">Daftar Barang Mutasi:</div>
                    {t.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{it.namaBarang}</span>
                        <span className="font-extrabold text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                          {it.jumlah} Unit
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Pengirim (Asal):</span>
                      <span className="font-bold text-slate-800">{branchAsal?.namaBranch}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tujuan:</span>
                      <span className="font-bold text-purple-900">{branchTujuan?.namaBranch}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1 border-t">
                      <span>Petugas Pengirim:</span>
                      <span>{t.userPengirimNama}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleConfirmReceipt(t.id)}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" /> Konfirmasi Terima Barang (On Hand)
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
