'use client';

import React, { useEffect, useState } from 'react';
import { getProduksiList, getTransferList, getPenjualanList, getBarangList, getBranchList } from '@/lib/storage';
import { Barang, Branch, TransaksiProduksi, TransaksiTransfer, TransaksiPenjualan } from '@/lib/types';
import { History, Search } from 'lucide-react';

export default function AuditHistoryPage() {
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [produksis, setProduksis] = useState<TransaksiProduksi[]>([]);
  const [transfers, setTransfers] = useState<TransaksiTransfer[]>([]);
  const [penjualans, setPenjualans] = useState<TransaksiPenjualan[]>([]);

  const [filterType, setFilterType] = useState<'ALL' | 'PRODUKSI' | 'TRANSFER' | 'PENJUALAN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setBarangList(getBarangList());
    setBranches(getBranchList());
    setProduksis(getProduksiList());
    setTransfers(getTransferList());
    setPenjualans(getPenjualanList());
  }, []);

  const unifiedLogs = [
    ...produksis.map(p => ({
      id: p.id,
      type: 'PRODUKSI' as const,
      noRef: p.noProduksi,
      date: p.tanggal,
      userNama: p.userNama || 'Operator',
      details: `${p.items.length} item hasil masak`,
      itemsSummary: p.items.map(it => `${it.namaBarang} (+${it.jumlah})`).join(', '),
      branchInfo: `Pabrik: ${getBranch(p.branchId)}`,
      status: 'Selesai',
    })),
    ...transfers.map(t => ({
      id: t.id,
      type: 'TRANSFER' as const,
      noRef: t.noMutasi,
      date: t.tanggalKirim,
      userNama: t.userPengirimNama || 'Petugas',
      details: `${t.items.length} item mutasi`,
      itemsSummary: t.items.map(it => `${it.namaBarang} (${it.jumlah})`).join(', '),
      branchInfo: `${getBranch(t.branchAsalId)} ➔ ${getBranch(t.branchTujuanId)}`,
      status: t.status,
    })),
    ...penjualans.map(pj => ({
      id: pj.id,
      type: 'PENJUALAN' as const,
      noRef: pj.noNota,
      date: pj.tanggal,
      userNama: pj.userNama || 'Kasir',
      details: `${pj.items.length} item (Rp ${pj.totalBayar.toLocaleString('id-ID')})`,
      itemsSummary: pj.items.map(it => `${it.namaBarang} (${it.jumlah})`).join(', '),
      branchInfo: `Outlet: ${getBranch(pj.branchId)}`,
      status: 'Selesai',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function getBranch(id: string) {
    const b = branches.find(x => x.id === id);
    return b ? b.namaBranch : 'Branch';
  }

  const filteredLogs = unifiedLogs.filter(log => {
    if (filterType !== 'ALL' && log.type !== filterType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        log.noRef.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.itemsSummary.toLowerCase().includes(q) ||
        log.userNama.toLowerCase().includes(q) ||
        log.branchInfo.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-amber-600" /> Audit Log Transaksi
        </h2>
        <p className="text-xs text-slate-500 font-medium">Riwayat lengkap aktivitas Produksi, Mutasi, dan Penjualan</p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-2">
        <div className="flex bg-slate-100 p-1 rounded-2xl overflow-x-auto no-scrollbar text-xs font-bold">
          {(['ALL', 'PRODUKSI', 'TRANSFER', 'PENJUALAN'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`flex-1 py-2 px-3 rounded-xl transition-all min-w-[70px] ${
                filterType === t ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari no. ref, barang, atau user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 glass-card rounded-2xl text-slate-400 text-xs">
            Tidak ada transaksi ditemukan.
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="p-3.5 glass-card rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-black text-[10px] px-2 py-0.5 rounded-md uppercase ${
                      log.type === 'PRODUKSI'
                        ? 'bg-amber-100 text-amber-800'
                        : log.type === 'TRANSFER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="font-mono text-slate-500 font-bold">{log.noRef}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    log.status === 'In Transit' ? 'badge-transit' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {log.status}
                </span>
              </div>

              <div className="font-bold text-slate-900 text-xs">{log.itemsSummary}</div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="truncate max-w-[200px]">{log.branchInfo}</span>
                <span>Oleh: <b>{log.userNama}</b></span>
              </div>

              <div className="text-[10px] text-slate-400 text-right">
                {new Date(log.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
