import {
  Barang,
  Branch,
  Role,
  User,
  StokLokasi,
  TransaksiProduksi,
  TransaksiTransfer,
  TransaksiPenjualan,
  TransaksiMutasiStok,
  ItemProduksi,
  ItemTransfer,
  GoogleSheetsConfig,
} from './types';

export const STORAGE_KEYS = {
  BARANG: 'stock_app_barang',
  BRANCHES: 'stock_app_branches',
  ROLES: 'stock_app_roles',
  USERS: 'stock_app_users',
  STOK: 'stock_app_stok',
  PRODUKSI: 'stock_app_produksi',
  TRANSFER: 'stock_app_transfer',
  PENJUALAN: 'stock_app_penjualan',
  MUTASI: 'stock_app_mutasi_stok',
  CURRENT_USER: 'stock_app_current_user',
  GOOGLE_SHEETS: 'stock_app_gsheet_config',
};

let isImportingFromSheets = false;

export function setImportingFlag(val: boolean): void {
  isImportingFromSheets = val;
}

// Initial Seed Fallback Data
export const INITIAL_BARANG: Barang[] = [
  {
    id: 'brg-bdn-500',
    kodeBarang: 'SRP-BDN-500ML',
    namaBarang: 'Bintang Dunia 500ml',
    nilaiUkuran: 500,
    satuanUkuran: 'ml',
    keterangan: 'Sirup Markisa Varian Botol Kaca 500ml',
    isAktif: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'brg-bdn-1000',
    kodeBarang: 'SRP-BDN-1L',
    namaBarang: 'Bintang Dunia 1Lt',
    nilaiUkuran: 1,
    satuanUkuran: 'Lt',
    keterangan: 'Sirup Markisa Varian Botol Besar 1 Liter',
    isAktif: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'brg-bol-500',
    kodeBarang: 'SRP-BOL-500ML',
    namaBarang: 'Bola Dunia 500ml',
    nilaiUkuran: 500,
    satuanUkuran: 'ml',
    keterangan: 'Sirup Markisa Spesial Bola Dunia 500ml',
    isAktif: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-pusat-produksi',
    kodeBranch: 'PROD-01',
    namaBranch: 'Pusat Produksi',
    tipe: ['Produksi'],
    alamat: 'Jl. Pabrik Sirup No. 1, Makassar',
    isAktif: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'branch-gudang-utama',
    kodeBranch: 'GDG-01',
    namaBranch: 'Gudang Logistik & Storage',
    tipe: ['Gudang'],
    alamat: 'Kawasan Industri Makassar',
    isAktif: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-admin',
    namaRole: 'Super Admin',
    deskripsi: 'Akses penuh ke seluruh cabang, produksi, mutasi stok, laporan & pengguna.',
    permissions: {
      canManageProducts: true,
      canManageBranches: true,
      canManageUsers: true,
      canAddProduction: true,
      canTransferStock: true,
      canReceiveStock: true,
      canRecordSale: true,
      canViewAllBranches: true,
      canManageSettings: true,
    },
  },
  {
    id: 'role-operator-produksi',
    namaRole: 'Operator Produksi',
    deskripsi: 'Mengisi laporan produksi sirup dan melihat stok cabang produksi.',
    permissions: {
      canManageProducts: true,
      canManageBranches: false,
      canManageUsers: false,
      canAddProduction: true,
      canTransferStock: true,
      canReceiveStock: false,
      canRecordSale: false,
      canViewAllBranches: false,
      canManageSettings: false,
    },
  },
  {
    id: 'role-staff-gudang',
    namaRole: 'Staff Gudang',
    deskripsi: 'Mengirim dan menerima mutasi barang antar gudang & branch.',
    permissions: {
      canManageProducts: true,
      canManageBranches: false,
      canManageUsers: false,
      canAddProduction: false,
      canTransferStock: true,
      canReceiveStock: true,
      canRecordSale: false,
      canViewAllBranches: false,
      canManageSettings: false,
    },
  },
  {
    id: 'role-kasir-store',
    namaRole: 'Staff Store / Kasir',
    deskripsi: 'Mencatat penjualan produk di toko/outlet dan menerima barang masuk.',
    permissions: {
      canManageProducts: true,
      canManageBranches: false,
      canManageUsers: false,
      canAddProduction: false,
      canTransferStock: false,
      canReceiveStock: true,
      canRecordSale: true,
      canViewAllBranches: false,
      canManageSettings: false,
    },
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    nama: 'Super Admin',
    username: 'admin',
    pin: '1234',
    roleId: 'role-admin',
    assignedBranchIds: 'ALL',
    isAktif: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_STOK: StokLokasi[] = [];

// Storage Helpers
export function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    if (!isImportingFromSheets && key !== STORAGE_KEYS.CURRENT_USER && key !== STORAGE_KEYS.GOOGLE_SHEETS) {
      window.dispatchEvent(new CustomEvent('storageMutation', { detail: { key } }));
    }
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

// Initializer
export function initializeStorageIfNeeded(): void {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEYS.BARANG)) {
    localStorage.setItem(STORAGE_KEYS.BARANG, JSON.stringify(INITIAL_BARANG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(INITIAL_ROLES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
}

// Product API
export function getBarangList(): Barang[] {
  return getFromStorage<Barang[]>(STORAGE_KEYS.BARANG, INITIAL_BARANG);
}

export function saveBarang(barang: Barang): void {
  const list = getBarangList();
  const index = list.findIndex(b => b.id === barang.id);
  if (index >= 0) {
    list[index] = barang;
  } else {
    list.unshift(barang);
  }
  saveToStorage(STORAGE_KEYS.BARANG, list);
}

export function toggleBarangStatus(barangId: string): void {
  const list = getBarangList();
  const item = list.find(b => b.id === barangId);
  if (item) {
    item.isAktif = !item.isAktif;
    saveToStorage(STORAGE_KEYS.BARANG, list);
  }
}

export function canDeleteBarang(barangId: string): { canDelete: boolean; reason?: string } {
  const mutasiList = getMutasiList();
  const used = mutasiList.some(m => m.barangId === barangId);
  if (used) {
    return { canDelete: false, reason: 'Barang ini memiliki riwayat mutasi stok (Produksi/Transfer/Penjualan).' };
  }
  return { canDelete: true };
}

export function deleteBarang(barangId: string): { success: boolean; message: string } {
  const audit = canDeleteBarang(barangId);
  if (!audit.canDelete) {
    return { success: false, message: audit.reason || 'Barang tidak dapat dihapus.' };
  }
  const list = getBarangList();
  const next = list.filter(b => b.id !== barangId);
  saveToStorage(STORAGE_KEYS.BARANG, next);
  return { success: true, message: 'Barang berhasil dihapus.' };
}

// Branch API
export function getBranchList(): Branch[] {
  const rawBranches = getFromStorage<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  return rawBranches.map(b => {
    if (typeof b.tipe === 'string') {
      return { ...b, tipe: [b.tipe] };
    }
    return b;
  });
}

export function saveBranch(branch: Branch): void {
  const list = getBranchList();
  const index = list.findIndex(b => b.id === branch.id);
  if (index >= 0) {
    list[index] = branch;
  } else {
    list.unshift(branch);
  }
  saveToStorage(STORAGE_KEYS.BRANCHES, list);
}

export function toggleBranchStatus(branchId: string): void {
  const list = getBranchList();
  const item = list.find(b => b.id === branchId);
  if (item) {
    item.isAktif = !item.isAktif;
    saveToStorage(STORAGE_KEYS.BRANCHES, list);
  }
}

// Roles & User API
export function getRoleList(): Role[] {
  const rawRoles = getFromStorage<Role[]>(STORAGE_KEYS.ROLES, INITIAL_ROLES);
  return rawRoles.map(r => {
    let permissions = r.permissions;
    if (typeof permissions === 'string') {
      try { permissions = JSON.parse(permissions); } catch (e) {}
    }
    if (!permissions || typeof permissions !== 'object') {
      permissions = {
        canManageProducts: true,
        canManageBranches: false,
        canManageUsers: false,
        canAddProduction: true,
        canTransferStock: true,
        canReceiveStock: true,
        canRecordSale: true,
        canViewAllBranches: false,
        canManageSettings: false,
      };
    }
    return { ...r, permissions };
  });
}

export function saveRole(role: Role): void {
  const list = getRoleList();
  const idx = list.findIndex(r => r.id === role.id);
  if (idx >= 0) {
    list[idx] = role;
  } else {
    list.unshift(role);
  }
  saveToStorage(STORAGE_KEYS.ROLES, list);
}

export function toggleRoleStatus(roleId: string): void {
  const list = getRoleList();
  const r = list.find(x => x.id === roleId);
  if (r) {
    r.isAktif = !(r.isAktif ?? true);
    saveToStorage(STORAGE_KEYS.ROLES, list);
  }
}

export function canDeleteRole(roleId: string): { canDelete: boolean; reason?: string } {
  if (roleId === 'role-admin') {
    return { canDelete: false, reason: 'Role Super Admin adalah role sistem utama dan tidak dapat dihapus.' };
  }
  const users = getUserList();
  const assignedCount = users.filter(u => u.roleId === roleId).length;
  if (assignedCount > 0) {
    return { canDelete: false, reason: `Role jabatan ini masih digunakan oleh ${assignedCount} pengguna.` };
  }
  return { canDelete: true };
}

export function deleteRole(roleId: string): { success: boolean; message: string } {
  const audit = canDeleteRole(roleId);
  if (!audit.canDelete) {
    return { success: false, message: audit.reason || 'Role tidak dapat dihapus.' };
  }
  const list = getRoleList();
  const next = list.filter(r => r.id !== roleId);
  saveToStorage(STORAGE_KEYS.ROLES, next);
  return { success: true, message: 'Role jabatan berhasil dihapus permanen.' };
}

export function getUserList(): User[] {
  return getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUser(user: User): void {
  const list = getUserList();
  const idx = list.findIndex(u => u.id === user.id);
  if (idx >= 0) {
    list[idx] = user;
  } else {
    list.unshift(user);
  }
  saveToStorage(STORAGE_KEYS.USERS, list);
}

export function toggleUserStatus(userId: string): void {
  const list = getUserList();
  const u = list.find(x => x.id === userId);
  if (u) {
    u.isAktif = !u.isAktif;
    saveToStorage(STORAGE_KEYS.USERS, list);
  }
}

export function canDeleteUser(userId: string): { canDelete: boolean; reason?: string } {
  const activeUser = getActiveUser();
  if (activeUser && activeUser.id === userId) {
    return { canDelete: false, reason: 'Anda tidak dapat menghapus akun pengguna yang sedang Anda gunakan saat ini.' };
  }
  return { canDelete: true };
}

export function deleteUser(userId: string): { success: boolean; message: string } {
  const audit = canDeleteUser(userId);
  if (!audit.canDelete) {
    return { success: false, message: audit.reason || 'User tidak dapat dihapus.' };
  }
  const list = getUserList();
  const next = list.filter(u => u.id !== userId);
  saveToStorage(STORAGE_KEYS.USERS, next);
  return { success: true, message: 'Pengguna berhasil dihapus permanen.' };
}

export function getActiveUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveUser(user: User): void {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  window.dispatchEvent(new Event('userSwitched'));
}

// =========================================================================
// SINGLE LEDGER MUTASI STOK API (MODEL ARUS MUTASI BARANG)
// =========================================================================

export function getMutasiList(): TransaksiMutasiStok[] {
  return getFromStorage<TransaksiMutasiStok[]>(STORAGE_KEYS.MUTASI, []);
}

export function addMutasiRecords(records: TransaksiMutasiStok | TransaksiMutasiStok[]): void {
  const list = getMutasiList();
  const newItems = Array.isArray(records) ? records : [records];
  newItems.forEach(item => {
    const existingIndex = list.findIndex(m => m.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = item;
    } else {
      list.unshift(item);
    }
  });
  saveToStorage(STORAGE_KEYS.MUTASI, list);
}

// DYNAMIC STOCK CALCULATION FROM SINGLE LEDGER
export function calculateStokLokasiList(): StokLokasi[] {
  const mutasiList = getMutasiList();
  const branches = getBranchList().filter(b => b.isAktif);
  const barangList = getBarangList().filter(b => b.isAktif);

  const result: StokLokasi[] = [];

  for (const branch of branches) {
    for (const barang of barangList) {
      let totalStok = 0;

      for (const m of mutasiList) {
        const isMatchBarang = m.barangId === barang.id || m.kodeBarang === barang.kodeBarang;
        if (!isMatchBarang) continue;

        const qty = Number(m.jumlah || 0);

        // Barang Masuk Ke Branch Ini
        if (m.jenisTransaksi === 'Produksi' && m.tujuanBranchId === branch.id) {
          totalStok += qty;
        }
        if (
          m.jenisTransaksi === 'Transfer' &&
          m.tujuanBranchId === branch.id &&
          (m.status === 'Success' || (m.status as any) === 'On Hand')
        ) {
          totalStok += qty;
        }

        // Barang Keluar Dari Branch Ini
        if (m.jenisTransaksi === 'Penjualan' && m.sumberBranchId === branch.id) {
          totalStok -= qty;
        }
        if (m.jenisTransaksi === 'Transfer' && m.sumberBranchId === branch.id) {
          totalStok -= qty;
        }
      }

      result.push({
        branchId: branch.id,
        barangId: barang.id,
        jumlahStok: Math.max(0, totalStok),
      });
    }
  }

  return result;
}

export function getStokLokasiList(): StokLokasi[] {
  return calculateStokLokasiList();
}

export function getStokForBranchAndBarang(branchId: string, barangId: string): number {
  const stoks = calculateStokLokasiList();
  const found = stoks.find(s => s.branchId === branchId && s.barangId === barangId);
  return found ? found.jumlahStok : 0;
}

// Transaction API wrappers that auto-populate Single Ledger Mutasi Stok
export function getProduksiList(): TransaksiProduksi[] {
  const mutasi = getMutasiList().filter(m => m.jenisTransaksi === 'Produksi');
  const grouped: { [noRef: string]: TransaksiProduksi } = {};

  mutasi.forEach(m => {
    const ref = m.noRef || m.id;
    if (!grouped[ref]) {
      grouped[ref] = {
        id: m.id,
        noProduksi: ref,
        branchId: m.tujuanBranchId,
        items: [],
        tanggal: m.tanggal,
        userId: m.userId,
        userNama: m.userNama,
        catatan: m.keterangan,
      };
    }
    const brg = getBarangList().find(b => b.id === m.barangId || b.kodeBarang === m.kodeBarang);
    grouped[ref].items.push({
      barangId: m.barangId,
      namaBarang: brg?.namaBarang || m.kodeBarang,
      jumlah: m.jumlah,
    });
  });

  return Object.values(grouped);
}

export function addProduksiTransaction(data: {
  branchId: string;
  items: ItemProduksi[];
  userId: string;
  userNama: string;
  catatan?: string;
}): TransaksiProduksi {
  const noProduksi = `PRD-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const mutasiEntries: TransaksiMutasiStok[] = data.items.map((it, idx) => {
    const brg = getBarangList().find(b => b.id === it.barangId);
    return {
      id: `mut-${Date.now()}-${idx}`,
      tanggal: nowIso,
      jenisTransaksi: 'Produksi',
      barangId: it.barangId,
      kodeBarang: brg?.kodeBarang || it.barangId,
      jumlah: it.jumlah,
      sumberBranchId: '-',
      tujuanBranchId: data.branchId,
      status: 'Success',
      userId: data.userId,
      userNama: data.userNama,
      noRef: noProduksi,
      keterangan: data.catatan || 'Pencatatan Hasil Produksi',
    };
  });

  addMutasiRecords(mutasiEntries);

  return {
    id: mutasiEntries[0].id,
    noProduksi,
    branchId: data.branchId,
    items: data.items,
    tanggal: nowIso,
    userId: data.userId,
    userNama: data.userNama,
    catatan: data.catatan,
  };
}

export function getTransferList(): TransaksiTransfer[] {
  const mutasi = getMutasiList().filter(m => m.jenisTransaksi === 'Transfer');
  const grouped: { [noRef: string]: TransaksiTransfer } = {};

  mutasi.forEach(m => {
    const ref = m.noRef || m.id;
    if (!grouped[ref]) {
      grouped[ref] = {
        id: m.id,
        noMutasi: ref,
        branchAsalId: m.sumberBranchId,
        branchTujuanId: m.tujuanBranchId,
        items: [],
        status: m.status === 'Success' ? ('On Hand' as any) : 'In Transit',
        tanggalKirim: m.tanggal,
        userPengirimId: m.userId,
        userPengirimNama: m.userNama,
        catatan: m.keterangan,
      };
    }
    const brg = getBarangList().find(b => b.id === m.barangId || b.kodeBarang === m.kodeBarang);
    grouped[ref].items.push({
      barangId: m.barangId,
      namaBarang: brg?.namaBarang || m.kodeBarang,
      jumlah: m.jumlah,
    });
  });

  return Object.values(grouped);
}

export function addTransferShipment(data: {
  branchAsalId: string;
  branchTujuanId: string;
  items: ItemTransfer[];
  userPengirimId: string;
  userPengirimNama: string;
  catatan?: string;
}): { success: boolean; message: string; transfer?: TransaksiTransfer } {
  for (const item of data.items) {
    const currentStok = getStokForBranchAndBarang(data.branchAsalId, item.barangId);
    if (currentStok < item.jumlah) {
      return {
        success: false,
        message: `Stok ${item.namaBarang} di cabang asal tidak mencukupi (Tersedia: ${currentStok}, Dikirim: ${item.jumlah}).`,
      };
    }
  }

  const noMutasi = `TRF-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const mutasiEntries: TransaksiMutasiStok[] = data.items.map((it, idx) => {
    const brg = getBarangList().find(b => b.id === it.barangId);
    return {
      id: `mut-${Date.now()}-${idx}`,
      tanggal: nowIso,
      jenisTransaksi: 'Transfer',
      barangId: it.barangId,
      kodeBarang: brg?.kodeBarang || it.barangId,
      jumlah: it.jumlah,
      sumberBranchId: data.branchAsalId,
      tujuanBranchId: data.branchTujuanId,
      status: 'In Transit',
      userId: data.userPengirimId,
      userNama: data.userPengirimNama,
      noRef: noMutasi,
      keterangan: data.catatan || 'Pengiriman Mutasi Barang',
    };
  });

  addMutasiRecords(mutasiEntries);

  const transfer: TransaksiTransfer = {
    id: mutasiEntries[0].id,
    noMutasi,
    branchAsalId: data.branchAsalId,
    branchTujuanId: data.branchTujuanId,
    items: data.items,
    status: 'In Transit',
    tanggalKirim: nowIso,
    userPengirimId: data.userPengirimId,
    userPengirimNama: data.userPengirimNama,
    catatan: data.catatan,
  };

  return {
    success: true,
    message: `Pengiriman ${data.items.length} jenis barang berhasil dicatat! Status: In Transit ke cabang tujuan.`,
    transfer,
  };
}

export function receiveTransfer(transferId: string, userPenerimaId: string, userPenerimaNama: string): { success: boolean; message: string } {
  const mutasiList = getMutasiList();
  const targetRecords = mutasiList.filter(m => m.id === transferId || m.noRef === transferId);

  if (targetRecords.length === 0) {
    return { success: false, message: 'Data mutasi tidak ditemukan.' };
  }

  const updatedRecords = targetRecords.map(m => ({
    ...m,
    status: 'Success' as const,
    keterangan: `Diterima oleh ${userPenerimaNama} pada ${new Date().toLocaleDateString('id-ID')}`,
  }));

  addMutasiRecords(updatedRecords);

  return {
    success: true,
    message: `Seluruh (${updatedRecords.length}) item barang berhasil diterima! Stok resmi masuk ke cabang tujuan.`,
  };
}

export function getPenjualanList(): TransaksiPenjualan[] {
  const mutasi = getMutasiList().filter(m => m.jenisTransaksi === 'Penjualan');
  const grouped: { [noRef: string]: TransaksiPenjualan } = {};

  mutasi.forEach(m => {
    const ref = m.noRef || m.id;
    if (!grouped[ref]) {
      grouped[ref] = {
        id: m.id,
        noNota: ref,
        branchId: m.sumberBranchId,
        items: [],
        totalBayar: 0,
        pelanggan: 'Pelanggan Umum',
        tanggal: m.tanggal,
        userId: m.userId,
        userNama: m.userNama,
        catatan: m.keterangan,
      };
    }
    const brg = getBarangList().find(b => b.id === m.barangId || b.kodeBarang === m.kodeBarang);
    const harga = m.hargaSatuan || 0;
    const subtotal = m.jumlah * harga;

    grouped[ref].items.push({
      barangId: m.barangId,
      namaBarang: brg?.namaBarang || m.kodeBarang,
      jumlah: m.jumlah,
      hargaSatuan: harga,
      subtotal,
    });
    grouped[ref].totalBayar += subtotal;
  });

  return Object.values(grouped);
}

export function addPenjualanTransaction(data: {
  branchId: string;
  items: { barangId: string; namaBarang: string; jumlah: number; hargaSatuan: number }[];
  pelanggan: string;
  userId: string;
  userNama: string;
  catatan?: string;
}): { success: boolean; message: string; penjualan?: TransaksiPenjualan } {
  for (const item of data.items) {
    const currentStok = getStokForBranchAndBarang(data.branchId, item.barangId);
    if (currentStok < item.jumlah) {
      return {
        success: false,
        message: `Stok ${item.namaBarang} di cabang ini tidak mencukupi (Tersedia: ${currentStok}, Diminta: ${item.jumlah}).`,
      };
    }
  }

  const noNota = `INV-${Date.now().toString().slice(-6)}`;
  const nowIso = new Date().toISOString();

  const mutasiEntries: TransaksiMutasiStok[] = data.items.map((it, idx) => {
    const brg = getBarangList().find(b => b.id === it.barangId);
    return {
      id: `mut-${Date.now()}-${idx}`,
      tanggal: nowIso,
      jenisTransaksi: 'Penjualan',
      barangId: it.barangId,
      kodeBarang: brg?.kodeBarang || it.barangId,
      jumlah: it.jumlah,
      sumberBranchId: data.branchId,
      tujuanBranchId: '-',
      status: 'Success',
      userId: data.userId,
      userNama: data.userNama,
      noRef: noNota,
      hargaSatuan: it.hargaSatuan,
      keterangan: data.catatan || `Penjualan Kasir (${data.pelanggan || 'Pelanggan Umum'})`,
    };
  });

  addMutasiRecords(mutasiEntries);

  const itemsWithSubtotal = data.items.map(it => ({
    ...it,
    subtotal: it.jumlah * it.hargaSatuan,
  }));
  const totalBayar = itemsWithSubtotal.reduce((acc, curr) => acc + curr.subtotal, 0);

  const penjualan: TransaksiPenjualan = {
    id: mutasiEntries[0].id,
    noNota,
    branchId: data.branchId,
    items: itemsWithSubtotal,
    totalBayar,
    pelanggan: data.pelanggan || 'Pelanggan Umum',
    tanggal: nowIso,
    userId: data.userId,
    userNama: data.userNama,
    catatan: data.catatan,
  };

  return {
    success: true,
    message: 'Penjualan berhasil dicatat! Mutasi stok penjualan resmi tercatat.',
    penjualan,
  };
}

// Config & Bulk Import API
export const HARDCODED_GOOGLE_SHEETS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SHEETS_URL ||
  'https://script.google.com/macros/s/AKfycbys7Z8kqSpB8YAlhHgbRT_ZxYFjxEmMj0XXhOfs3ab3eAJY3UdjHCc2eKvWwmzwRp4A/exec';

export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  return {
    webAppUrl: HARDCODED_GOOGLE_SHEETS_URL,
    autoSync: true,
  };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  saveToStorage(STORAGE_KEYS.GOOGLE_SHEETS, config);
}

export function bulkImportStorageData(data: {
  barang?: Barang[];
  branches?: Branch[];
  users?: User[];
  roles?: Role[];
  mutasi?: TransaksiMutasiStok[];
  stok?: StokLokasi[];
  produksi?: TransaksiProduksi[];
  transfer?: TransaksiTransfer[];
  penjualan?: TransaksiPenjualan[];
}): void {
  if (!data) return;
  setImportingFlag(true);
  try {
    if (data.barang && Array.isArray(data.barang) && data.barang.length > 0) {
      saveToStorage(STORAGE_KEYS.BARANG, data.barang);
    }
    if (data.branches && Array.isArray(data.branches) && data.branches.length > 0) {
      saveToStorage(STORAGE_KEYS.BRANCHES, data.branches);
    }
    if (data.users && Array.isArray(data.users) && data.users.length > 0) {
      saveToStorage(STORAGE_KEYS.USERS, data.users);
    }
    if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
      saveToStorage(STORAGE_KEYS.ROLES, data.roles);
    }
    if (data.mutasi && Array.isArray(data.mutasi)) {
      saveToStorage(STORAGE_KEYS.MUTASI, data.mutasi);
    }
  } finally {
    setImportingFlag(false);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('storageMutation'));
    window.dispatchEvent(new Event('userSwitched'));
  }
}
