import { Barang, Branch, Role, User, StokLokasi, TransaksiProduksi, TransaksiTransfer, TransaksiPenjualan, GoogleSheetsConfig, ItemProduksi, ItemTransfer } from './types';

// Seed Roles
export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-admin',
    namaRole: 'Super Admin / Pemilik',
    deskripsi: 'Akses penuh ke seluruh menu, branch, user management, dan pengaturan.',
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
    deskripsi: 'Mencatat hasil produksi sirup di branch Pabrik/Produksi.',
    permissions: {
      canManageProducts: false,
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
      canManageProducts: false,
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
      canManageProducts: false,
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

// Seed Branches
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    kodeBranch: 'HQ-MEDAN',
    namaBranch: 'Pusat Produksi & Store Markisa Utama',
    tipe: ['Produksi', 'Gudang', 'Store'],
    alamat: 'Jl. Industri Sirup No. 12, Medan',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'branch-2',
    kodeBranch: 'GDG-01',
    namaBranch: 'Gudang Logistik & Storage Regional',
    tipe: ['Gudang'],
    alamat: 'Jl. Raya Pergudangan Blok A4, Medan',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'branch-3',
    kodeBranch: 'STR-01',
    namaBranch: 'Outlet Store & Display Mall',
    tipe: ['Store', 'Gudang'],
    alamat: 'Jl. Ahmad Yani No. 88, Medan',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'branch-4',
    kodeBranch: 'STR-02',
    namaBranch: 'Outlet Store Bandara Kualanamu',
    tipe: ['Store'],
    alamat: 'Bandara Kualanamu Gate 3, Deli Serdang',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
];

// Seed Master Barang
export const INITIAL_BARANG: Barang[] = [
  {
    id: 'brg-1',
    kodeBarang: 'SRP-MRN-250ML',
    namaBarang: 'Sirup Markisa Murni Extra Super',
    nilaiUkuran: 250,
    satuanUkuran: 'ml',
    keterangan: 'Sirup markisa konsentrat murni botol kaca 250ml',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brg-2',
    kodeBarang: 'SRP-MRN-500ML',
    namaBarang: 'Sirup Markisa Murni Extra Super',
    nilaiUkuran: 500,
    satuanUkuran: 'ml',
    keterangan: 'Sirup markisa konsentrat murni botol kaca 500ml',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brg-3',
    kodeBarang: 'SRP-MRN-1LT',
    namaBarang: 'Sirup Markisa Murni Family Size',
    nilaiUkuran: 1,
    satuanUkuran: 'Lt',
    keterangan: 'Sirup markisa konsentrat murni botol 1 Liter',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brg-4',
    kodeBarang: 'SRP-RDY-250ML',
    namaBarang: 'Sirup Markisa Siap Minum (Ready to Drink)',
    nilaiUkuran: 250,
    satuanUkuran: 'ml',
    keterangan: 'Minuman sirup markisa segar botol PET 250ml',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brg-5',
    kodeBarang: 'SRP-RDY-500ML',
    namaBarang: 'Sirup Markisa Siap Minum (Ready to Drink)',
    nilaiUkuran: 500,
    satuanUkuran: 'ml',
    keterangan: 'Minuman sirup markisa segar botol PET 500ml',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'brg-6',
    kodeBarang: 'BHN-FRT-KG',
    namaBarang: 'Buah Markisa Segar Asli Brastagi',
    nilaiUkuran: 1,
    satuanUkuran: 'kg',
    keterangan: 'Bahan baku buah markisa segar dari petani Brastagi',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
];

// Seed Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    nama: 'Budi Santoso (Owner)',
    username: 'admin',
    pin: '1234',
    roleId: 'role-admin',
    assignedBranchIds: 'ALL',
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-operator',
    nama: 'Joko Raharjo (Produksi)',
    username: 'produksi',
    pin: '1111',
    roleId: 'role-operator-produksi',
    assignedBranchIds: ['branch-1'],
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-gudang',
    nama: 'Siti Aminah (Gudang)',
    username: 'gudang',
    pin: '2222',
    roleId: 'role-staff-gudang',
    assignedBranchIds: ['branch-2'],
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-kasir',
    nama: 'Rina Wijaya (Store Pusat)',
    username: 'kasir',
    pin: '3333',
    roleId: 'role-kasir-store',
    assignedBranchIds: ['branch-1', 'branch-3'],
    isAktif: true,
    createdAt: new Date().toISOString(),
  },
];

// Seed Stok
export const INITIAL_STOK: StokLokasi[] = [
  { branchId: 'branch-1', barangId: 'brg-1', jumlahStok: 500 },
  { branchId: 'branch-1', barangId: 'brg-2', jumlahStok: 350 },
  { branchId: 'branch-1', barangId: 'brg-3', jumlahStok: 200 },
  { branchId: 'branch-1', barangId: 'brg-6', jumlahStok: 120 },

  { branchId: 'branch-2', barangId: 'brg-1', jumlahStok: 150 },
  { branchId: 'branch-2', barangId: 'brg-2', jumlahStok: 100 },
  { branchId: 'branch-2', barangId: 'brg-4', jumlahStok: 300 },

  { branchId: 'branch-3', barangId: 'brg-1', jumlahStok: 40 },
  { branchId: 'branch-3', barangId: 'brg-2', jumlahStok: 30 },
  { branchId: 'branch-3', barangId: 'brg-4', jumlahStok: 80 },

  { branchId: 'branch-4', barangId: 'brg-1', jumlahStok: 25 },
  { branchId: 'branch-4', barangId: 'brg-5', jumlahStok: 60 },
];

const STORAGE_KEYS = {
  BARANG: 'stock_app_barang',
  BRANCHES: 'stock_app_branches',
  ROLES: 'stock_app_roles',
  USERS: 'stock_app_users',
  STOK: 'stock_app_stok',
  PRODUKSI: 'stock_app_produksi',
  TRANSFER: 'stock_app_transfer',
  PENJUALAN: 'stock_app_penjualan',
  CURRENT_USER: 'stock_app_active_user',
  GOOGLE_SHEETS: 'stock_app_gsheet_config',
};

// Helper Storage Getters & Setters
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
    if (key !== STORAGE_KEYS.CURRENT_USER && key !== STORAGE_KEYS.GOOGLE_SHEETS) {
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
    saveToStorage(STORAGE_KEYS.BARANG, INITIAL_BARANG);
  }

  const rawBranches = localStorage.getItem(STORAGE_KEYS.BRANCHES);
  if (!rawBranches) {
    saveToStorage(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  } else {
    try {
      const parsed: any[] = JSON.parse(rawBranches);
      let needsMigration = false;
      const normalized = parsed.map(b => {
        if (typeof b.tipe === 'string') {
          needsMigration = true;
          return { ...b, tipe: [b.tipe] };
        }
        return b;
      });
      if (needsMigration) {
        saveToStorage(STORAGE_KEYS.BRANCHES, normalized);
      }
    } catch (e) {}
  }
  if (!localStorage.getItem(STORAGE_KEYS.ROLES)) {
    saveToStorage(STORAGE_KEYS.ROLES, INITIAL_ROLES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.STOK)) {
    saveToStorage(STORAGE_KEYS.STOK, INITIAL_STOK);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    saveToStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }
}

// Product Management API
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

export function canDeleteBarang(barangId: string): { canDelete: boolean; reason?: string } {
  const produksis = getFromStorage<TransaksiProduksi[]>(STORAGE_KEYS.PRODUKSI, []);
  if (produksis.some(p => p.items?.some(it => it.barangId === barangId))) {
    return { canDelete: false, reason: 'Barang sudah pernah dicatat di transaksi Produksi.' };
  }

  const transfers = getFromStorage<TransaksiTransfer[]>(STORAGE_KEYS.TRANSFER, []);
  if (transfers.some(t => t.items?.some(it => it.barangId === barangId))) {
    return { canDelete: false, reason: 'Barang sudah pernah dicatat di transaksi Mutasi/Transfer.' };
  }

  const penjualans = getFromStorage<TransaksiPenjualan[]>(STORAGE_KEYS.PENJUALAN, []);
  if (penjualans.some(pj => pj.items?.some(it => it.barangId === barangId))) {
    return { canDelete: false, reason: 'Barang sudah pernah dicatat di transaksi Penjualan.' };
  }

  const stoks = getFromStorage<StokLokasi[]>(STORAGE_KEYS.STOK, []);
  const hasNonZeroStock = stoks.some(s => s.barangId === barangId && s.jumlahStok > 0);
  if (hasNonZeroStock) {
    return { canDelete: false, reason: 'Barang masih memiliki sisa stok di branch.' };
  }

  return { canDelete: true };
}

export function deleteBarang(barangId: string): { success: boolean; message: string } {
  const check = canDeleteBarang(barangId);
  if (!check.canDelete) {
    return { success: false, message: check.reason || 'Barang tidak dapat dihapus.' };
  }

  const list = getBarangList().filter(b => b.id !== barangId);
  saveToStorage(STORAGE_KEYS.BARANG, list);
  return { success: true, message: 'Barang berhasil dihapus dari Pendaftaran Barang.' };
}

export function toggleBarangStatus(barangId: string): void {
  const list = getBarangList();
  const item = list.find(b => b.id === barangId);
  if (item) {
    item.isAktif = !item.isAktif;
    saveToStorage(STORAGE_KEYS.BARANG, list);
  }
}

// Branch Management API
export function getBranchList(): Branch[] {
  const branches = getFromStorage<any[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  return branches.map(b => ({
    ...b,
    tipe: Array.isArray(b.tipe) ? b.tipe : [b.tipe],
  }));
}

export function saveBranch(branch: Branch): void {
  const list = getBranchList();
  const idx = list.findIndex(b => b.id === branch.id);
  if (idx >= 0) {
    list[idx] = branch;
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

// Roles & User Management API
export function getRoleList(): Role[] {
  return getFromStorage<Role[]>(STORAGE_KEYS.ROLES, INITIAL_ROLES);
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

  const produksis = getFromStorage<TransaksiProduksi[]>(STORAGE_KEYS.PRODUKSI, []);
  if (produksis.some(p => p.userId === userId)) {
    return { canDelete: false, reason: 'User ini memiliki riwayat pencatatan transaksi Produksi.' };
  }

  const transfers = getFromStorage<TransaksiTransfer[]>(STORAGE_KEYS.TRANSFER, []);
  if (transfers.some(t => t.userPengirimId === userId || t.userPenerimaId === userId)) {
    return { canDelete: false, reason: 'User ini memiliki riwayat pencatatan transaksi Mutasi/Transfer.' };
  }

  const penjualans = getFromStorage<TransaksiPenjualan[]>(STORAGE_KEYS.PENJUALAN, []);
  if (penjualans.some(pj => pj.userId === userId)) {
    return { canDelete: false, reason: 'User ini memiliki riwayat pencatatan transaksi Penjualan Kasir.' };
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


export function getActiveUser(): User {
  return getFromStorage<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
}

export function setActiveUser(user: User): void {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

// Stock & Inventory Calculations
export function getStokLokasiList(): StokLokasi[] {
  return getFromStorage<StokLokasi[]>(STORAGE_KEYS.STOK, INITIAL_STOK);
}

export function updateStok(branchId: string, barangId: string, deltaJumlah: number): void {
  const stoks = getStokLokasiList();
  const idx = stoks.findIndex(s => s.branchId === branchId && s.barangId === barangId);
  if (idx >= 0) {
    stoks[idx].jumlahStok = Math.max(0, stoks[idx].jumlahStok + deltaJumlah);
  } else {
    stoks.push({
      branchId,
      barangId,
      jumlahStok: Math.max(0, deltaJumlah),
    });
  }
  saveToStorage(STORAGE_KEYS.STOK, stoks);
}

export function getStokForBranchAndBarang(branchId: string, barangId: string): number {
  const stoks = getStokLokasiList();
  const found = stoks.find(s => s.branchId === branchId && s.barangId === barangId);
  return found ? found.jumlahStok : 0;
}

// Produksi Transaction API (Multi-Item Support)
export function getProduksiList(): TransaksiProduksi[] {
  const raw = getFromStorage<any[]>(STORAGE_KEYS.PRODUKSI, []);
  // Normalize legacy single item data to multi-item format
  return raw.map(r => {
    if (r.barangId && !r.items) {
      return {
        ...r,
        items: [{ barangId: r.barangId, namaBarang: 'Produk', jumlah: r.jumlah, batchNo: r.batchNo || '-', catatan: r.catatan }],
      };
    }
    return r;
  });
}

export function addProduksiTransaction(data: {
  branchId: string;
  items: ItemProduksi[];
  userId: string;
  userNama: string;
  catatan?: string;
}): TransaksiProduksi {
  const list = getProduksiList();
  const noProduksi = `PRD-${Date.now().toString().slice(-6)}`;
  const newTrx: TransaksiProduksi = {
    id: `trx-prd-${Date.now()}`,
    noProduksi,
    branchId: data.branchId,
    items: data.items,
    tanggal: new Date().toISOString(),
    userId: data.userId,
    userNama: data.userNama,
    catatan: data.catatan,
  };

  list.unshift(newTrx);
  saveToStorage(STORAGE_KEYS.PRODUKSI, list);

  // Increase stock for each produced item
  data.items.forEach(it => {
    updateStok(data.branchId, it.barangId, it.jumlah);
  });

  return newTrx;
}

// Transfer (Mutasi 2-Step Handshake Multi-Item)
export function getTransferList(): TransaksiTransfer[] {
  const raw = getFromStorage<any[]>(STORAGE_KEYS.TRANSFER, []);
  return raw.map(r => {
    if (r.barangId && !r.items) {
      return {
        ...r,
        items: [{ barangId: r.barangId, namaBarang: 'Produk', jumlah: r.jumlah, catatan: r.catatan }],
      };
    }
    return r;
  });
}

export function addTransferShipment(data: {
  branchAsalId: string;
  branchTujuanId: string;
  items: ItemTransfer[];
  userPengirimId: string;
  userPengirimNama: string;
  catatan?: string;
}): { success: boolean; message: string; transfer?: TransaksiTransfer } {
  // Validate stock for ALL items at origin branch
  for (const item of data.items) {
    const currentStok = getStokForBranchAndBarang(data.branchAsalId, item.barangId);
    if (currentStok < item.jumlah) {
      return {
        success: false,
        message: `Stok ${item.namaBarang} di cabang asal tidak mencukupi (Tersedia: ${currentStok}, Dikirim: ${item.jumlah}).`,
      };
    }
  }

  // Deduct stock for all items from origin branch (put in transit)
  data.items.forEach(item => {
    updateStok(data.branchAsalId, item.barangId, -item.jumlah);
  });

  const list = getTransferList();
  const newTransfer: TransaksiTransfer = {
    id: `trf-${Date.now()}`,
    noMutasi: `TRF-${Date.now().toString().slice(-6)}`,
    branchAsalId: data.branchAsalId,
    branchTujuanId: data.branchTujuanId,
    items: data.items,
    status: 'In Transit',
    tanggalKirim: new Date().toISOString(),
    userPengirimId: data.userPengirimId,
    userPengirimNama: data.userPengirimNama,
    catatan: data.catatan,
  };

  list.unshift(newTransfer);
  saveToStorage(STORAGE_KEYS.TRANSFER, list);

  return {
    success: true,
    message: `Pengiriman ${data.items.length} jenis barang berhasil dicatat! Status: In Transit ke cabang tujuan.`,
    transfer: newTransfer,
  };
}

export function receiveTransfer(transferId: string, userPenerimaId: string, userPenerimaNama: string): { success: boolean; message: string } {
  const list = getTransferList();
  const trx = list.find(t => t.id === transferId);

  if (!trx) {
    return { success: false, message: 'Data mutasi tidak ditemukan.' };
  }

  if (trx.status === 'On Hand') {
    return { success: false, message: 'Mutasi barang ini sudah dikonfirmasi diterima sebelumnya.' };
  }

  trx.status = 'On Hand';
  trx.tanggalTerima = new Date().toISOString();
  trx.userPenerimaId = userPenerimaId;
  trx.userPenerimaNama = userPenerimaNama;

  saveToStorage(STORAGE_KEYS.TRANSFER, list);

  // Add stock for all items to destination branch officially
  trx.items.forEach(it => {
    updateStok(trx.branchTujuanId, it.barangId, it.jumlah);
  });

  return {
    success: true,
    message: `Seluruh (${trx.items.length}) item barang berhasil diterima! Stok resmi masuk ke cabang tujuan.`,
  };
}

// Penjualan Transaction API
export function getPenjualanList(): TransaksiPenjualan[] {
  return getFromStorage<TransaksiPenjualan[]>(STORAGE_KEYS.PENJUALAN, []);
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

  const itemsWithSubtotal = data.items.map(it => {
    updateStok(data.branchId, it.barangId, -it.jumlah);
    return {
      ...it,
      subtotal: it.jumlah * it.hargaSatuan,
    };
  });

  const totalBayar = itemsWithSubtotal.reduce((acc, curr) => acc + curr.subtotal, 0);

  const list = getPenjualanList();
  const newPenjualan: TransaksiPenjualan = {
    id: `pj-${Date.now()}`,
    noNota: `INV-${Date.now().toString().slice(-6)}`,
    branchId: data.branchId,
    items: itemsWithSubtotal,
    totalBayar,
    pelanggan: data.pelanggan || 'Pelanggan Umum',
    tanggal: new Date().toISOString(),
    userId: data.userId,
    userNama: data.userNama,
    catatan: data.catatan,
  };

  list.unshift(newPenjualan);
  saveToStorage(STORAGE_KEYS.PENJUALAN, list);

  return {
    success: true,
    message: 'Penjualan berhasil dicatat! Stok otomatis dipotong.',
    penjualan: newPenjualan,
  };
}

// Google Sheets Config API
export function getGoogleSheetsConfig(): GoogleSheetsConfig {
  return getFromStorage<GoogleSheetsConfig>(STORAGE_KEYS.GOOGLE_SHEETS, {
    webAppUrl: '',
    autoSync: false,
  });
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  saveToStorage(STORAGE_KEYS.GOOGLE_SHEETS, config);
}
