'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBarangList, getBranchList, getStokLokasiList, getTransferList, initializeStorageIfNeeded } from '@/lib/storage';
import { getCurrentAuth } from '@/lib/auth-store';
import { Barang, Branch, StokLokasi, TransaksiTransfer } from '@/lib/types';
import { LayoutDashboard, Wine, Building2, Factory, ArrowLeftRight, ShoppingCart, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const [auth, setAuth] = useState(getCurrentAuth());
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stokList, setStokList] = useState<StokLokasi[]>([]);
  const [inTransitList, setInTransitList] = useState<TransaksiTransfer[]>([]);

  // Filter
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();

  const loadData = () => {
    initializeStorageIfNeeded();
    const current = getCurrentAuth();
    if (!current.user) {
      router.push('/login');
      return;
    }
    setAuth(current);
    setBarangList(getBarangList().filter(b => b.isAktif));
    setBranches(getBranchList().filter(b => b.isAktif));
    setStokList(getStokLokasiList());
    setInTransitList(getTransferList().filter(t => t.status === 'In Transit'));
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

  // Filter allowed branches for current user
  const visibleBranches = auth.user?.assignedBranchIds === 'ALL' || auth.role?.permissions.canViewAllBranches
    ? branches
    : auth.allowedBranches;

  // Calculate stock stats
  const totalStockCount = stokList.reduce((sum, s) => {
    const isBranchVisible = visibleBranches.some(b => b.id === s.branchId);
    return isBranchVisible ? sum + s.jumlahStok : sum;
  }, 0);

  const lowStockThreshold = 10;
  const lowStockItems = barangList.filter(brg => {
    const branchStoks = stokList.filter(s => s.barangId === brg.id && visibleBranches.some(b => b.id === s.branchId));
    const total = branchStoks.reduce((acc, curr) => acc + curr.jumlahStok, 0);
    return total < lowStockThreshold;
  });

  const filteredProducts = barangList.filter(b =>
    b.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.kodeBarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
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
            <p className="text-amber-100 text-xs mt-0.5">Monitoring Stok Sirup Markisa Real-time</p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl">
            🍹
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-2">
        {auth.role?.permissions.canAddProduction && (
          <Link
            href="/produksi"
            className="p-3 glass-card rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 hover:border-amber-400 active:scale-95 transition-all group"
          >
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Factory className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Input Produksi</span>
          </Link>
        )}

        {(auth.role?.permissions.canTransferStock || auth.role?.permissions.canReceiveStock) && (
          <Link
            href="/transfer"
            className="p-3 glass-card rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 hover:border-blue-400 active:scale-95 transition-all group"
          >
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Mutasi Handshake</span>
          </Link>
        )}

        {auth.role?.permissions.canRecordSale && (
          <Link
            href="/penjualan"
            className="p-3 glass-card rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 hover:border-emerald-400 active:scale-95 transition-all group"
          >
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 leading-tight">Input Penjualan</span>
          </Link>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3.5 glass-card rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">Total Unit Stok</span>
            <Wine className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalStockCount.toLocaleString('id-ID')}</div>
          <div className="text-[10px] text-slate-500 font-medium">Di {visibleBranches.length} Branch Aktif</div>
        </div>

        <div className="p-3.5 glass-card rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase">In Transit</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-purple-900">{inTransitList.length} Shipment</div>
          <div className="text-[10px] text-purple-700 font-medium">Menunggu Serah Terima</div>
        </div>
      </div>

      {/* In Transit Active Highlight Alert */}
      {inTransitList.length > 0 && (
        <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-purple-900">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-600 animate-spin" /> Barang Sedang In Transit
            </span>
            <Link href="/transfer" className="text-[11px] text-purple-700 font-bold flex items-center gap-0.5 hover:underline">
              Terima <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-purple-800">
            Terdapat <b>{inTransitList.length} mutasi barang</b> yang sedang dikirim antar branch dan membutuhkan konfirmasi serah terima.
          </p>
        </div>
      )}

      {/* Stock Filter & Search */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-600" /> Stok Barang per Branch
          </h3>

          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
          >
            <option value="ALL">Semua Branch ({visibleBranches.length})</option>
            {visibleBranches.map(b => (
              <option key={b.id} value={b.id}>
                {b.namaBranch} ({b.tipe})
              </option>
            ))}
          </select>
        </div>

        {/* Stock Breakdown List */}
        <div className="space-y-2.5">
          {filteredProducts.map(brg => {
            const targetBranches = selectedBranchId === 'ALL'
              ? visibleBranches
              : visibleBranches.filter(b => b.id === selectedBranchId);

            const branchStocks = targetBranches.map(branch => {
              const stokItem = stokList.find(s => s.branchId === branch.id && s.barangId === brg.id);
              return {
                branch,
                stok: stokItem ? stokItem.jumlahStok : 0,
              };
            });

            const totalStokBarang = branchStocks.reduce((sum, item) => sum + item.stok, 0);

            return (
              <div key={brg.id} className="p-3.5 glass-card rounded-2xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {brg.kodeBarang}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{brg.namaBarang}</h4>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                        totalStokBarang < lowStockThreshold
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      Total: {totalStokBarang} {brg.satuanUkuran}
                    </span>
                  </div>
                </div>

                {/* Per Branch Detail Pill Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 border-t border-slate-100">
                  {branchStocks.map(({ branch, stok }) => (
                    <div
                      key={branch.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5 text-slate-700 truncate max-w-[170px]">
                        <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                        <span className="font-semibold truncate">{branch.namaBranch}</span>
                      </div>
                      <span className="font-extrabold text-slate-900 ml-2">
                        {stok} {brg.satuanUkuran}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
