'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getBarangList,
  getBranchList,
  getStokLokasiList,
  getProduksiList,
  getTransferList,
  getPenjualanList,
  initializeStorageIfNeeded,
} from '@/lib/storage';
import { getCurrentAuth } from '@/lib/auth-store';
import { Barang, Branch, StokLokasi, TransaksiProduksi, TransaksiTransfer, TransaksiPenjualan } from '@/lib/types';
import {
  LayoutDashboard,
  Wine,
  Building2,
  Factory,
  ArrowLeftRight,
  ShoppingCart,
  Clock,
  ArrowUpRight,
  Calendar,
  Filter,
  CheckSquare,
  Square,
  TrendingUp,
  PackageCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [auth, setAuth] = useState(getCurrentAuth());
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stokList, setStokList] = useState<StokLokasi[]>([]);
  const [produksiList, setProduksiList] = useState<TransaksiProduksi[]>([]);
  const [transferList, setTransferList] = useState<TransaksiTransfer[]>([]);
  const [penjualanList, setPenjualanList] = useState<TransaksiPenjualan[]>([]);

  // Filter States
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [datePreset, setDatePreset] = useState<'SEMUA' | 'HARI_INI' | '7_HARI' | 'BULAN_INI' | 'CUSTOM'>('SEMUA');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [activeReportSection, setActiveReportSection] = useState<'ALL' | 'STOK' | 'PRODUKSI' | 'PENJUALAN' | 'PENGIRIMAN'>('ALL');

  const loadData = () => {
    initializeStorageIfNeeded();
    const current = getCurrentAuth();
    if (!current.user) {
      router.push('/login');
      return;
    }
    setAuth(current);
    const activeBarang = getBarangList().filter(b => b.isAktif);
    const activeBranches = getBranchList().filter(b => b.isAktif);

    setBarangList(activeBarang);
    setBranches(activeBranches);
    setStokList(getStokLokasiList());
    setProduksiList(getProduksiList());
    setTransferList(getTransferList());
    setPenjualanList(getPenjualanList());

    // Default select all visible branch IDs
    const allowed =
      current.user.assignedBranchIds === 'ALL' || current.role?.permissions.canViewAllBranches
        ? activeBranches.map(b => b.id)
        : current.allowedBranches.map(b => b.id);
    setSelectedBranchIds(allowed);
  };

  useEffect(() => {
    const current = getCurrentAuth();
    if (!current.user) {
      router.push('/login');
      return;
    }
    loadData();
    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('userSwitched', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('userSwitched', handleStorage);
    };
  }, [router]);

  // Allowed branches for user
  const visibleBranches =
    auth.user?.assignedBranchIds === 'ALL' || auth.role?.permissions.canViewAllBranches
      ? branches
      : auth.allowedBranches;

  // Toggle Branch Filter
  const toggleBranchFilter = (branchId: string) => {
    if (selectedBranchIds.includes(branchId)) {
      if (selectedBranchIds.length > 1) {
        setSelectedBranchIds(selectedBranchIds.filter(id => id !== branchId));
      }
    } else {
      setSelectedBranchIds([...selectedBranchIds, branchId]);
    }
  };

  const selectAllBranches = () => {
    setSelectedBranchIds(visibleBranches.map(b => b.id));
  };

  // Date Filtering Function
  const isDateInFilter = (dateStr: string) => {
    if (datePreset === 'SEMUA') return true;
    const txDate = new Date(dateStr);
    const now = new Date();

    if (datePreset === 'HARI_INI') {
      return txDate.toDateString() === now.toDateString();
    }
    if (datePreset === '7_HARI') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return txDate >= sevenDaysAgo;
    }
    if (datePreset === 'BULAN_INI') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (datePreset === 'CUSTOM') {
      if (startDate && new Date(dateStr) < new Date(startDate)) return false;
      if (endDate && new Date(dateStr) > new Date(endDate + 'T23:59:59')) return false;
      return true;
    }
    return true;
  };

  // Filtered Transaksi Lists
  const filteredProduksi = produksiList.filter(
    p => selectedBranchIds.includes(p.branchId) && isDateInFilter(p.tanggal)
  );

  const filteredPenjualan = penjualanList.filter(
    pj => selectedBranchIds.includes(pj.branchId) && isDateInFilter(pj.tanggal)
  );

  const inTransitShipments = transferList.filter(
    t =>
      t.status === 'In Transit' &&
      (selectedBranchIds.includes(t.branchAsalId) || selectedBranchIds.includes(t.branchTujuanId))
  );

  return (
    <div className="space-y-5 pb-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-5 shadow-md shadow-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md">
              {auth.role?.namaRole || 'User'}
            </span>
            <h2 className="text-lg font-black tracking-tight mt-1">
              Halo, {auth.user?.nama ? auth.user.nama.split(' ')[0] : 'User'} 👋
            </h2>
            <p className="text-amber-100 text-xs mt-0.5">Dashboard Laporan & Monitoring Stok Realtime</p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl">
            🍹
          </div>
        </div>
      </div>

      {/* Quick Access Menu Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveReportSection('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeReportSection === 'ALL'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" /> Semua Laporan
        </button>
        <button
          onClick={() => setActiveReportSection('STOK')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeReportSection === 'STOK'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Wine className="w-3.5 h-3.5" /> Laporan Stok
        </button>
        <button
          onClick={() => setActiveReportSection('PRODUKSI')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeReportSection === 'PRODUKSI'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Factory className="w-3.5 h-3.5" /> Laporan Produksi
        </button>
        <button
          onClick={() => setActiveReportSection('PENJUALAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeReportSection === 'PENJUALAN'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Laporan Penjualan
        </button>
        <button
          onClick={() => setActiveReportSection('PENGIRIMAN')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeReportSection === 'PENGIRIMAN'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" /> Shipments ({inTransitShipments.length})
        </button>
      </div>

      {/* FILTER CONTROL CARD: MULTI-SELECT BRANCH & DATE RANGE */}
      <div className="glass-card rounded-2xl p-4 space-y-3.5 border-2 border-slate-200">
        {/* Branch Filter Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-amber-600" /> Filter Cabang / Branch (Multi-Select)
            </label>
            <button
              onClick={selectAllBranches}
              className="text-[11px] font-extrabold text-amber-700 hover:underline flex items-center gap-1"
            >
              <CheckSquare className="w-3.5 h-3.5" /> Pilih Semua ({visibleBranches.length})
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {visibleBranches.map(b => {
              const isSelected = selectedBranchIds.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggleBranchFilter(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-white" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{b.namaBranch}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Filter Section */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-blue-600" /> Filter Range Tanggal (Produksi & Penjualan)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'SEMUA', label: 'Semua Waktu' },
              { id: 'HARI_INI', label: 'Hari Ini' },
              { id: '7_HARI', label: '7 Hari Terakhir' },
              { id: 'BULAN_INI', label: 'Bulan Ini' },
              { id: 'CUSTOM', label: 'Custom Tanggal' },
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePreset(p.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  datePreset === p.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {datePreset === 'CUSTOM' && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TABEL LAPORAN STOK */}
      {/* ========================================================================= */}
      {(activeReportSection === 'ALL' || activeReportSection === 'STOK') && (
        <div className="glass-card rounded-2xl p-4 space-y-3 border-2 border-amber-300">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Wine className="w-4 h-4 text-amber-600" /> 1. Tabel Laporan Stok Barang
            </h3>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-lg">
              {selectedBranchIds.length} Cabang Dipilih
            </span>
          </div>

          <div className="space-y-2.5">
            {barangList.map(brg => {
              const targetBranches = visibleBranches.filter(b => selectedBranchIds.includes(b.id));
              const branchStoks = targetBranches.map(branch => {
                const stokItem = stokList.find(s => s.branchId === branch.id && s.barangId === brg.id);
                return {
                  branch,
                  stok: stokItem ? stokItem.jumlahStok : 0,
                };
              });

              const totalStokBarang = branchStoks.reduce((sum, item) => sum + item.stok, 0);

              return (
                <div key={brg.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-800 rounded">
                        {brg.kodeBarang}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">{brg.namaBarang}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500 text-white shadow-sm">
                        Total: {totalStokBarang.toLocaleString('id-ID')} {brg.satuanUkuran}
                      </span>
                    </div>
                  </div>

                  {/* Breakdown per Cabang */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-200/60">
                    {branchStoks.map(({ branch, stok }) => (
                      <div
                        key={branch.id}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                      >
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">{branch.namaBranch}</span>
                        <span className="font-extrabold text-slate-900 ml-2">
                          {stok.toLocaleString('id-ID')} {brg.satuanUkuran}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TABEL LAPORAN PRODUKSI */}
      {/* ========================================================================= */}
      {(activeReportSection === 'ALL' || activeReportSection === 'PRODUKSI') && (
        <div className="glass-card rounded-2xl p-4 space-y-3 border-2 border-blue-300">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Factory className="w-4 h-4 text-blue-600" /> 2. Tabel Laporan Produksi
            </h3>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-lg">
              {filteredProduksi.length} Batch Produksi
            </span>
          </div>

          <div className="space-y-2.5">
            {barangList.map(brg => {
              // Aggregate total production for this barang in filteredProduksi
              let totalQtyProduksi = 0;
              let batchCount = 0;

              filteredProduksi.forEach(p => {
                let foundInBatch = false;
                p.items.forEach(item => {
                  if (item.barangId === brg.id) {
                    totalQtyProduksi += item.jumlah;
                    foundInBatch = true;
                  }
                });
                if (foundInBatch) batchCount++;
              });

              return (
                <div key={brg.id} className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                      {brg.kodeBarang}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{brg.namaBarang}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{batchCount} Batch Produksi Dicatat</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-600 text-white shadow-sm">
                      {totalQtyProduksi.toLocaleString('id-ID')} {brg.satuanUkuran}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TABEL LAPORAN PENJUALAN */}
      {/* ========================================================================= */}
      {(activeReportSection === 'ALL' || activeReportSection === 'PENJUALAN') && (
        <div className="glass-card rounded-2xl p-4 space-y-3 border-2 border-emerald-300">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-600" /> 3. Tabel Laporan Penjualan
            </h3>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-lg">
              {filteredPenjualan.length} Nota Penjualan
            </span>
          </div>

          <div className="space-y-2.5">
            {barangList.map(brg => {
              let totalQtyTerjual = 0;
              let totalOmsetBarang = 0;

              filteredPenjualan.forEach(pj => {
                pj.items.forEach(item => {
                  if (item.barangId === brg.id) {
                    totalQtyTerjual += item.jumlah;
                    totalOmsetBarang += item.jumlah * item.hargaSatuan;
                  }
                });
              });

              return (
                <div key={brg.id} className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                      {brg.kodeBarang}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{brg.namaBarang}</h4>
                    <p className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                      Omset: Rp {totalOmsetBarang.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-600 text-white shadow-sm">
                      {totalQtyTerjual.toLocaleString('id-ID')} {brg.satuanUkuran}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TABEL LAPORAN PENGIRIMAN (IN TRANSIT SHIPMENTS) */}
      {/* ========================================================================= */}
      {(activeReportSection === 'ALL' || activeReportSection === 'PENGIRIMAN') && (
        <div className="glass-card rounded-2xl p-4 space-y-3 border-2 border-purple-300">
          <div className="flex items-center justify-between border-b pb-2.5">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-purple-600" /> 4. Tabel Laporan Pengiriman (In Transit)
            </h3>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-lg">
              {inTransitShipments.length} Pengiriman Aktif
            </span>
          </div>

          {inTransitShipments.length === 0 ? (
            <div className="p-6 text-center text-slate-500 bg-purple-50/40 rounded-xl space-y-1">
              <PackageCheck className="w-8 h-8 text-purple-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Tidak ada pengiriman yang sedang in transit.</p>
              <p className="text-[11px] text-slate-500">Seluruh mutasi pengiriman barang telah berhasil diterima oleh cabang tujuan.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {inTransitShipments.map(t => {
                const asal = branches.find(b => b.id === t.branchAsalId)?.namaBranch || t.branchAsalId;
                const tujuan = branches.find(b => b.id === t.branchTujuanId)?.namaBranch || t.branchTujuanId;

                return (
                  <div key={t.id} className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-600 text-white rounded">
                          {t.noMutasi}
                        </span>
                        <div className="text-xs font-extrabold text-purple-950 mt-1 flex items-center gap-1">
                          <span>{asal}</span> ➔ <span className="text-purple-700">{tujuan}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          Dikirim pada: {new Date(t.tanggalKirim).toLocaleDateString('id-ID')} oleh <b>{t.userPengirimNama}</b>
                        </div>
                      </div>

                      <Link
                        href="/transfer"
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                      >
                        <span>Terima</span> <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {/* Items Breakdown */}
                    <div className="p-2 bg-white rounded-lg border border-purple-100 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rincian Barang Dikirim:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {t.items.map((item, idx) => {
                          const brg = barangList.find(b => b.id === item.barangId);
                          return (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-xs">
                              {brg?.namaBarang || item.barangId}: <b>{item.jumlah} {brg?.satuanUkuran || 'unit'}</b>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
