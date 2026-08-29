'use client';

import React, { useEffect, useState } from 'react';
import {
  getUserList,
  saveUser,
  toggleUserStatus,
  canDeleteUser,
  deleteUser,
  getRoleList,
  saveRole,
  toggleRoleStatus,
  canDeleteRole,
  deleteRole,
  getBranchList,
} from '@/lib/storage';
import { User, Role, Branch, RolePermissions } from '@/lib/types';
import { Users, Plus, ShieldCheck, Building2, KeyRound, CheckSquare, Square, Power, Edit3, ArrowLeft, Save, Trash2, ShieldPlus, ShieldAlert, CheckCircle2 } from 'lucide-react';

const DEFAULT_PERMISSIONS: RolePermissions = {
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

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Active Tab: 'users' | 'roles'
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Full-Page View Mode State: 'list' | 'userForm' | 'roleForm'
  const [viewMode, setViewMode] = useState<'list' | 'userForm' | 'roleForm'>('list');

  // User Form State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [roleId, setRoleId] = useState('');
  const [assignedBranchIds, setAssignedBranchIds] = useState<string[] | 'ALL'>('ALL');

  // Role Form State
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [namaRole, setNamaRole] = useState('');
  const [deskripsiRole, setDeskripsiRole] = useState('');
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({ ...DEFAULT_PERMISSIONS });

  // Delete Audit Modal State
  const [deleteUserCandidate, setDeleteUserCandidate] = useState<User | null>(null);
  const [deleteUserAuditCheck, setDeleteUserAuditCheck] = useState<{ canDelete: boolean; reason?: string } | null>(null);

  const [deleteRoleCandidate, setDeleteRoleCandidate] = useState<Role | null>(null);
  const [deleteRoleAuditCheck, setDeleteRoleAuditCheck] = useState<{ canDelete: boolean; reason?: string } | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = () => {
    setUsers(getUserList());
    setRoles(getRoleList());
    setBranches(getBranchList());
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- USER HANDLERS ---
  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setNama('');
    setUsername('');
    setPin('1234');
    setRoleId(roles[0]?.id || 'role-admin');
    setAssignedBranchIds('ALL');
    setViewMode('userForm');
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setNama(u.nama);
    setUsername(u.username);
    setPin(u.pin);
    setRoleId(u.roleId);
    setAssignedBranchIds(u.assignedBranchIds);
    setViewMode('userForm');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !username.trim() || !pin.trim()) {
      alert('Nama, Username, dan PIN wajib diisi.');
      return;
    }

    const newUser: User = {
      id: editingUser ? editingUser.id : `usr-${Date.now()}`,
      nama: nama.trim(),
      username: username.trim().toLowerCase(),
      pin: pin.trim(),
      roleId,
      assignedBranchIds,
      isAktif: editingUser ? editingUser.isAktif : true,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
    };

    saveUser(newUser);
    setViewMode('list');
    loadData();

    setFeedbackMsg({
      type: 'success',
      text: editingUser ? 'Data pengguna berhasil diperbarui!' : 'Pengguna baru berhasil ditambahkan!',
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggleUserStatus = (u: User) => {
    toggleUserStatus(u.id);
    loadData();
  };

  const handleInitiateDeleteUser = (u: User) => {
    setDeleteUserCandidate(u);
    const audit = canDeleteUser(u.id);
    setDeleteUserAuditCheck(audit);
  };

  const handleConfirmDeleteUser = () => {
    if (!deleteUserCandidate) return;
    const res = deleteUser(deleteUserCandidate.id);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      loadData();
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setDeleteUserCandidate(null);
    setDeleteUserAuditCheck(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleBranchAssignment = (branchId: string) => {
    if (assignedBranchIds === 'ALL') {
      setAssignedBranchIds([branchId]);
    } else {
      if (assignedBranchIds.includes(branchId)) {
        const next = assignedBranchIds.filter(id => id !== branchId);
        setAssignedBranchIds(next.length === 0 ? 'ALL' : next);
      } else {
        setAssignedBranchIds([...assignedBranchIds, branchId]);
      }
    }
  };

  // --- ROLE HANDLERS ---
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setNamaRole('');
    setDeskripsiRole('');
    setRolePermissions({
      canManageProducts: false,
      canManageBranches: false,
      canManageUsers: false,
      canAddProduction: false,
      canTransferStock: true,
      canReceiveStock: true,
      canRecordSale: true,
      canViewAllBranches: false,
      canManageSettings: false,
    });
    setViewMode('roleForm');
  };

  const handleOpenEditRole = (r: Role) => {
    setEditingRole(r);
    setNamaRole(r.namaRole);
    setDeskripsiRole(r.deskripsi);
    setRolePermissions({ ...r.permissions });
    setViewMode('roleForm');
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRole.trim()) {
      alert('Nama Role / Jabatan wajib diisi.');
      return;
    }

    const newRole: Role = {
      id: editingRole ? editingRole.id : `role-${Date.now()}`,
      namaRole: namaRole.trim(),
      deskripsi: deskripsiRole.trim(),
      permissions: rolePermissions,
      isAktif: editingRole ? (editingRole.isAktif ?? true) : true,
    };

    saveRole(newRole);
    setViewMode('list');
    loadData();

    setFeedbackMsg({
      type: 'success',
      text: editingRole ? 'Role jabatan berhasil diperbarui!' : 'Role jabatan baru berhasil ditambahkan!',
    });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggleRoleStatus = (r: Role) => {
    toggleRoleStatus(r.id);
    loadData();
  };

  const handleInitiateDeleteRole = (r: Role) => {
    setDeleteRoleCandidate(r);
    const audit = canDeleteRole(r.id);
    setDeleteRoleAuditCheck(audit);
  };

  const handleConfirmDeleteRole = () => {
    if (!deleteRoleCandidate) return;
    const res = deleteRole(deleteRoleCandidate.id);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      loadData();
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
    setDeleteRoleCandidate(null);
    setDeleteRoleAuditCheck(null);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleToggleFormPermission = (permKey: keyof RolePermissions) => {
    setRolePermissions(prev => ({
      ...prev,
      [permKey]: !prev[permKey],
    }));
  };

  const handleQuickToggleRolePermission = (r: Role, permKey: keyof RolePermissions) => {
    const updatedRole: Role = {
      ...r,
      permissions: {
        ...r.permissions,
        [permKey]: !r.permissions[permKey],
      },
    };
    saveRole(updatedRole);
    loadData();
  };

  return (
    <div className="space-y-4">
      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3 text-xs rounded-xl font-semibold flex items-center gap-2 ${
            feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> {feedbackMsg.text}
        </div>
      )}

      {/* MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" /> User & Hak Akses Jabatan
              </h2>
              <p className="text-xs text-slate-500 font-medium">Atur pengguna, status aktif, hapus audit, dan role jabatan</p>
            </div>

            {activeTab === 'users' ? (
              <button
                onClick={handleOpenCreateUser}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" /> User Baru
              </button>
            ) : (
              <button
                onClick={handleOpenCreateRole}
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 active:scale-95 transition-all"
              >
                <ShieldPlus className="w-4 h-4" /> Jabatan Baru
              </button>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              👥 Daftar Pengguna ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'roles' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              🛡️ Matriks Role Jabatan ({roles.length})
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-2.5">
              {users.map(u => {
                const role = roles.find(r => r.id === u.roleId);
                const branchText =
                  u.assignedBranchIds === 'ALL'
                    ? 'Semua Branch (Multi-Branch)'
                    : branches
                        .filter(b => u.assignedBranchIds.includes(b.id))
                        .map(b => b.namaBranch)
                        .join(', ');

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 glass-card rounded-2xl transition-all border ${
                      u.isAktif ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{u.nama}</span>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                            {role?.namaRole || 'Tanpa Role'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${u.isAktif ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {u.isAktif ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <KeyRound className="w-3 h-3 text-amber-600" /> @{u.username} (PIN: {u.pin})
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl">
                          <Building2 className="w-3.5 h-3.5 text-amber-600" />
                          <span className="truncate">{branchText}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`p-1.5 rounded-lg text-xs font-semibold ${
                            u.isAktif ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-200 text-slate-700'
                          }`}
                          title={u.isAktif ? 'Non-aktifkan User' : 'Aktifkan User'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs"
                          title="Edit User"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleInitiateDeleteUser(u)}
                          className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 text-xs"
                          title="Hapus User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Roles Matrix Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-4">
              {roles.map(r => {
                const userCount = users.filter(u => u.roleId === r.id).length;
                const isAktifRole = r.isAktif ?? true;

                return (
                  <div
                    key={r.id}
                    className={`p-4 glass-card rounded-2xl space-y-3 transition-all border ${
                      isAktifRole ? 'border-slate-200' : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-amber-600" /> {r.namaRole}
                          </h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                            {userCount} Pengguna
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isAktifRole ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {isAktifRole ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{r.deskripsi || 'Jabatan operasional sirup markisa'}</p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleRoleStatus(r)}
                          className={`p-1.5 rounded-lg text-xs font-semibold ${
                            isAktifRole ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-slate-200 text-slate-700'
                          }`}
                          title={isAktifRole ? 'Non-aktifkan Role' : 'Aktifkan Role'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEditRole(r)}
                          className="p-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-xs"
                          title="Edit Role / Jabatan"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleInitiateDeleteRole(r)}
                          className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 text-xs"
                          title="Hapus Role / Jabatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Quick Toggle Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(
                        [
                          { key: 'canManageProducts', label: 'Barang (Pendaftaran Produk)' },
                          { key: 'canManageBranches', label: 'Branch (Cabang 3 Tipe)' },
                          { key: 'canManageUsers', label: 'Users (Management & RBAC)' },
                          { key: 'canAddProduction', label: 'Produksi (Hasil Produksi)' },
                          { key: 'canTransferStock', label: 'Mutasi (Pengiriman In-Transit)' },
                          { key: 'canReceiveStock', label: 'Penerimaan (Terima On-Hand)' },
                          { key: 'canRecordSale', label: 'Penjualan (Input Kasir)' },
                          { key: 'canViewAllBranches', label: 'Akses Semua Branch' },
                          { key: 'canManageSettings', label: 'Pengaturan (Google Sheets)' },
                        ] as { key: keyof RolePermissions; label: string }[]
                      ).map(perm => {
                        const isChecked = r.permissions[perm.key];
                        return (
                          <button
                            key={perm.key}
                            onClick={() => handleQuickToggleRolePermission(r, perm.key)}
                            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                              isChecked
                                ? 'bg-amber-50/80 border-amber-300 text-amber-900'
                                : 'bg-slate-50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <span>{perm.label}</span>
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: USER FORM VIEW */}
      {viewMode === 'userForm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" /> Kembali ke Daftar
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm">
              {editingUser ? 'Edit Data Pengguna' : 'Pendaftaran Pengguna Baru'}
            </h3>
          </div>

          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pradipta Evan"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="pradipta"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PIN (4-6 Angka) *</label>
                  <input
                    type="password"
                    required
                    placeholder="1234"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Jabatan *</label>
                <select
                  value={roleId}
                  onChange={e => setRoleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.namaRole}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Penugasan Branch Akses</label>
                <p className="text-[11px] text-slate-500 mb-2">Tentukan branch mana saja yang dapat diakses oleh user ini:</p>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAssignedBranchIds('ALL')}
                    className={`w-full text-left p-3 rounded-2xl text-xs font-bold border flex items-center justify-between ${
                      assignedBranchIds === 'ALL'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <span>🌐 Semua Branch (Akses Tanpa Batas - Multi Branch)</span>
                    {assignedBranchIds === 'ALL' && <CheckSquare className="w-4 h-4 text-amber-600" />}
                  </button>

                  {branches.map(b => {
                    const isAssigned = assignedBranchIds !== 'ALL' && assignedBranchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleToggleBranchAssignment(b.id)}
                        className={`w-full text-left p-3 rounded-2xl text-xs font-medium border flex items-center justify-between ${
                          isAssigned
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="truncate">🏢 {b.namaBranch} ({b.tipe.join(', ')})</span>
                        {isAssigned && <CheckSquare className="w-4 h-4 text-amber-600" />}
                      </button>
                    );
                  })}
                </div>
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
                  <Save className="w-4 h-4" /> Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODE 3: ROLE / JABATAN FORM VIEW */}
      {viewMode === 'roleForm' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" /> Kembali ke Daftar
            </button>
            <h3 className="font-extrabold text-slate-900 text-sm">
              {editingRole ? 'Edit Role / Jabatan' : 'Tambah Role Jabatan Baru'}
            </h3>
          </div>

          <div className="glass-card rounded-3xl p-5 space-y-4 shadow-sm">
            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Role / Jabatan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Manager Operasional Pabrik"
                  value={namaRole}
                  onChange={e => setNamaRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Jabatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Bertanggung jawab atas hasil masak produksi & stok"
                  value={deskripsiRole}
                  onChange={e => setDeskripsiRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pengaturan Izin Akses Menu</label>
                <p className="text-[11px] text-slate-500 mb-2">Centang menu apa saja yang diizinkan untuk jabatan ini:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'canManageProducts', label: 'Barang (Pendaftaran Produk)' },
                      { key: 'canManageBranches', label: 'Branch (Cabang 3 Tipe)' },
                      { key: 'canManageUsers', label: 'Users (Management & RBAC)' },
                      { key: 'canAddProduction', label: 'Produksi (Hasil Produksi)' },
                      { key: 'canTransferStock', label: 'Mutasi (Pengiriman In-Transit)' },
                      { key: 'canReceiveStock', label: 'Penerimaan (Terima On-Hand)' },
                      { key: 'canRecordSale', label: 'Penjualan (Input Kasir)' },
                      { key: 'canViewAllBranches', label: 'Akses Semua Branch' },
                      { key: 'canManageSettings', label: 'Pengaturan (Google Sheets)' },
                    ] as { key: keyof RolePermissions; label: string }[]
                  ).map(perm => {
                    const isChecked = rolePermissions[perm.key];
                    return (
                      <button
                        key={perm.key}
                        type="button"
                        onClick={() => handleToggleFormPermission(perm.key)}
                        className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between border transition-all text-left ${
                          isChecked
                            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span>{perm.label}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
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
                  <Save className="w-4 h-4" /> Simpan Jabatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteUserCandidate && deleteUserAuditCheck && (
        <div className="modal-overlay">
          <div className="modal-dialog max-w-sm text-center">
            <div className="p-5 space-y-4">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${deleteUserAuditCheck.canDelete ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Pengguna "{deleteUserCandidate.nama}"?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Username: <span className="font-mono font-bold text-slate-700">@{deleteUserCandidate.username}</span>
                </p>
              </div>

              {!deleteUserAuditCheck.canDelete ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs space-y-1">
                  <div className="font-bold text-rose-800">⚠️ User Tidak Dapat Dihapus!</div>
                  <div className="text-rose-700">{deleteUserAuditCheck.reason}</div>
                  <div className="text-slate-600 text-[11px] mt-1 pt-1 border-t border-rose-200">
                    💡 Solusi: Anda disarankan untuk menggunakan tombol <b>Non-Aktifkan</b> agar pengguna tidak dapat login kembali tanpa merusak riwayat database transaksi.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-800">
                  ✅ Pengguna ini belum memiliki riwayat transaksi apapun dan aman untuk dihapus permanen.
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setDeleteUserCandidate(null);
                    setDeleteUserAuditCheck(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Kembali
                </button>
                {deleteUserAuditCheck.canDelete && (
                  <button
                    onClick={handleConfirmDeleteUser}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-200"
                  >
                    Ya, Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {deleteRoleCandidate && deleteRoleAuditCheck && (
        <div className="modal-overlay">
          <div className="modal-dialog max-w-sm text-center">
            <div className="p-5 space-y-4">
              <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${deleteRoleAuditCheck.canDelete ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                <ShieldAlert className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Jabatan "{deleteRoleCandidate.namaRole}"?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  ID: <span className="font-mono font-bold text-slate-700">{deleteRoleCandidate.id}</span>
                </p>
              </div>

              {!deleteRoleAuditCheck.canDelete ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs space-y-1">
                  <div className="font-bold text-rose-800">⚠️ Jabatan Tidak Dapat Dihapus!</div>
                  <div className="text-rose-700">{deleteRoleAuditCheck.reason}</div>
                  <div className="text-slate-600 text-[11px] mt-1 pt-1 border-t border-rose-200">
                    💡 Solusi: Pindahkan/Ubah role pengguna yang menggunakan jabatan ini terlebih dahulu, atau gunakan tombol <b>Non-Aktifkan</b>.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-left text-xs text-emerald-800">
                  ✅ Jabatan ini sedang tidak digunakan oleh pengguna manapun dan aman untuk dihapus permanen.
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setDeleteRoleCandidate(null);
                    setDeleteRoleAuditCheck(null);
                  }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Kembali
                </button>
                {deleteRoleAuditCheck.canDelete && (
                  <button
                    onClick={handleConfirmDeleteRole}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-200"
                  >
                    Ya, Hapus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
