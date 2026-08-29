export type TipeBranch = 'Produksi' | 'Gudang' | 'Store';

export type SatuanUkuran = 'ml' | 'Lt' | 'kg' | 'gr' | 'pcs' | 'pack' | 'botol' | 'galon';

export interface Barang {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  nilaiUkuran: number;
  satuanUkuran: string;
  keterangan: string;
  isAktif: boolean;
  createdAt: string;
}

export interface Branch {
  id: string;
  kodeBranch: string;
  namaBranch: string;
  tipe: TipeBranch[];
  alamat: string;
  isAktif: boolean;
  createdAt: string;
}

export interface RolePermissions {
  canManageProducts: boolean;
  canManageBranches: boolean;
  canManageUsers: boolean;
  canAddProduction: boolean;
  canTransferStock: boolean;
  canReceiveStock: boolean;
  canRecordSale: boolean;
  canViewAllBranches: boolean;
  canManageSettings: boolean;
}

export interface Role {
  id: string;
  namaRole: string;
  deskripsi: string;
  permissions: RolePermissions;
  isAktif?: boolean;
}

export interface User {
  id: string;
  nama: string;
  username: string;
  pin: string;
  roleId: string;
  assignedBranchIds: string[] | 'ALL';
  isAktif: boolean;
  createdAt: string;
}

export interface StokLokasi {
  branchId: string;
  barangId: string;
  jumlahStok: number;
}

// Single Ledger Mutasi Stok Model (Arus Mutasi Barang)
export type JenisTransaksiMutasi = 'Produksi' | 'Transfer' | 'Penjualan';

export interface TransaksiMutasiStok {
  id: string;
  tanggal: string; // Tanggal transaksi YYYY-MM-DD HH:mm:ss
  jenisTransaksi: JenisTransaksiMutasi;
  barangId: string;
  kodeBarang: string;
  jumlah: number;
  sumberBranchId: string; // branchId atau '-'
  tujuanBranchId: string; // branchId atau '-'
  status: 'In Transit' | 'Success';
  userId: string;
  userNama: string;
  noRef?: string; // No. Produksi, No. Mutasi, No. Nota
  hargaSatuan?: number; // Untuk penjualan
  keterangan?: string;
}

export interface ItemProduksi {
  barangId: string;
  namaBarang: string;
  jumlah: number;
  noBatch?: string;
  catatan?: string;
}

export interface TransaksiProduksi {
  id: string;
  noProduksi: string;
  branchId: string;
  items: ItemProduksi[];
  tanggal: string;
  userId: string;
  userNama: string;
  catatan?: string;
}

export interface ItemTransfer {
  barangId: string;
  namaBarang: string;
  jumlah: number;
  catatan?: string;
}

export interface TransaksiTransfer {
  id: string;
  noMutasi: string;
  branchAsalId: string;
  branchTujuanId: string;
  items: ItemTransfer[];
  status: 'In Transit' | 'On Hand';
  tanggalKirim: string;
  userPengirimId: string;
  userPengirimNama: string;
  tanggalTerima?: string;
  userPenerimaId?: string;
  userPenerimaNama?: string;
  catatan?: string;
}

export interface ItemPenjualan {
  barangId: string;
  namaBarang: string;
  jumlah: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface TransaksiPenjualan {
  id: string;
  noNota: string;
  branchId: string;
  items: ItemPenjualan[];
  totalBayar: number;
  pelanggan?: string;
  tanggal: string;
  userId: string;
  userNama: string;
  catatan?: string;
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
