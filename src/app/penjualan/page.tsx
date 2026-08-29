'use client';

import React, { useEffect, useState } from 'react';
import { getBarangList, getBranchList, addPenjualanTransaction, getStokForBranchAndBarang, getPenjualanList } from '@/lib/storage';
import { getCurrentAuth } from '@/lib/auth-store';
import { Barang, Branch, TransaksiPenjualan } from '@/lib/types';
import { ShoppingCart, Plus, Trash2, CheckCircle2, History, Store } from 'lucide-react';

interface CartItem {
  barangId: string;
  namaBarang: string;
  jumlah: number;
  hargaSatuan: number;
  satuanUkuran: string;
  stokTersedia: number;
}

export default function InputPenjualanPage() {
  const auth = getCurrentAuth();
  const [barangList, setBarangList] = useState<Barang[]>([]);
  const [storeBranches, setStoreBranches] = useState<Branch[]>([]);
  const [history, setHistory] = useState<TransaksiPenjualan[]>([]);

  // Form State
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [pelanggan, setPelanggan] = useState<string>('Pelanggan Umum');
  const [catatan, setCatatan] = useState<string>('');

  // Item Selector State
  const [currentBarangId, setCurrentBarangId] = useState<string>('');
  const [currentQty, setCurrentQty] = useState<number>(1);
  const [currentHarga, setCurrentHarga] = useState<number>(35000);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    const allBarang = getBarangList().filter(b => b.isAktif);
    setBarangList(allBarang);
    if (allBarang.length > 0 && !currentBarangId) {
      setCurrentBarangId(allBarang[0].id);
    }

    // Filter branches: Must include 'Store' in its tipe array & allowed by User's branch access
    const allowed = auth.allowedBranches.filter(b => b.isAktif && Array.isArray(b.tipe) && b.tipe.includes('Store'));
    setStoreBranches(allowed);
    if (allowed.length > 0 && !selectedBranchId) {
      setSelectedBranchId(allowed[0].id);
    }

    setHistory(getPenjualanList());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToCart = () => {
    if (!currentBarangId || currentQty <= 0) return;
    const brg = barangList.find(b => b.id === currentBarangId);
    if (!brg) return;

    const currentStok = getStokForBranchAndBarang(selectedBranchId, currentBarangId);
    if (currentStok < currentQty) {
      alert(`Stok ${brg.namaBarang} tidak mencukupi (Tersedia: ${currentStok}).`);
      return;
    }

    const existingIdx = cart.findIndex(c => c.barangId === currentBarangId);
    if (existingIdx >= 0) {
      const updated = [...cart];
      updated[existingIdx].jumlah += currentQty;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          barangId: brg.id,
          namaBarang: `${brg.namaBarang} (${brg.nilaiUkuran} ${brg.satuanUkuran})`,
          jumlah: currentQty,
          hargaSatuan: currentHarga,
          satuanUkuran: brg.satuanUkuran,
          stokTersedia: currentStok,
        },
      ]);
    }

    setCurrentQty(1);
  };

  const handleRemoveFromCart = (barangId: string) => {
    setCart(cart.filter(c => c.barangId !== barangId));
  };

  const totalBayar = cart.reduce((sum, item) => sum + item.jumlah * item.hargaSatuan, 0);

  const handleSubmitCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setFeedback({ type: 'error', text: 'Keranjang penjualan masih kosong.' });
      return;
    }

    const res = addPenjualanTransaction({
      branchId: selectedBranchId,
      items: cart,
      pelanggan,
      userId: auth.user?.id || 'sys',
      userNama: auth.user?.nama || 'Kasir',
      catatan,
    });

    if (res.success) {
      setFeedback({ type: 'success', text: `Penjualan berhasil dicatat! No. Nota: ${res.penjualan?.noNota}` });
      setCart([]);
      setCatatan('');
      loadData();
    } else {
      setFeedback({ type: 'error', text: res.message });
    }

    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-md shadow-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
            <ShoppingCart className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h2 className="text-base font-extrabold">Input Penjualan (Kasir)</h2>
            <p className="text-emerald-100 text-xs mt-0.5">Pencatatan penjualan sirup di Outlet Store</p>
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

      {/* Store Branch Selector */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Store className="w-4 h-4 text-emerald-600" /> Pilih Branch Outlet / Store
          </label>
          <select
            value={selectedBranchId}
            onChange={e => {
              setSelectedBranchId(e.target.value);
              setCart([]);
            }}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {storeBranches.map(b => (
              <option key={b.id} value={b.id}>
                🏬 {b.namaBranch} ({b.kodeBranch})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add Item to Cart Section */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Tambah Item ke Keranjang</h3>

        <div className="space-y-2">
          <div>
            <select
              value={currentBarangId}
              onChange={e => setCurrentBarangId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {barangList.map(brg => {
                const stok = getStokForBranchAndBarang(selectedBranchId, brg.id);
                return (
                  <option key={brg.id} value={brg.id}>
                    {brg.namaBarang} ({brg.nilaiUkuran} {brg.satuanUkuran}) - Stok: {stok}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Jumlah (Qty)</label>
              <input
                type="number"
                min="1"
                value={currentQty}
                onChange={e => setCurrentQty(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Harga Satuan (Rp)</label>
              <input
                type="number"
                step="500"
                value={currentHarga}
                onChange={e => setCurrentHarga(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Tambah Item
          </button>
        </div>
      </div>

      {/* Cart Summary & Checkout */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <h3 className="font-bold text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
          <span>Daftar Keranjang ({cart.length} Item)</span>
          <span className="text-amber-700 font-extrabold text-base">
            Rp {totalBayar.toLocaleString('id-ID')}
          </span>
        </h3>

        {cart.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Keranjang masih kosong.</p>
        ) : (
          <div className="space-y-2">
            {cart.map(item => (
              <div key={item.barangId} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">{item.namaBarang}</div>
                  <div className="text-[10px] text-slate-500">
                    {item.jumlah} x Rp {item.hargaSatuan.toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">
                    Rp {(item.jumlah * item.hargaSatuan).toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() => handleRemoveFromCart(item.barangId)}
                    className="p-1 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            <form onSubmit={handleSubmitCheckout} className="space-y-2.5 pt-2 border-t">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Pelanggan / Invoice Ref</label>
                <input
                  type="text"
                  value={pelanggan}
                  onChange={e => setPelanggan(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-200 active:scale-95 transition-all"
              >
                Proses Penjualan (Potong Stok)
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
