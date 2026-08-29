import { User, Role, Branch, RolePermissions } from './types';
import { getActiveUser, getRoleList, getBranchList, getUserList, setActiveUser as persistActiveUser, logoutUser as storageLogoutUser } from './storage';

export interface AuthState {
  user: User | null;
  role: Role | null;
  allowedBranches: Branch[];
}

export const ADMIN_ROLE_PERMISSIONS: RolePermissions = {
  canManageProducts: true,
  canManageBranches: true,
  canManageUsers: true,
  canAddProduction: true,
  canTransferStock: true,
  canReceiveStock: true,
  canRecordSale: true,
  canViewAllBranches: true,
  canManageSettings: true,
};

export const DEFAULT_ROLE_PERMISSIONS: RolePermissions = {
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

export function ensureRolePermissions(role: Role | null): Role | null {
  if (!role) return null;
  let permissions = role.permissions;
  if (typeof permissions === 'string') {
    try {
      permissions = JSON.parse(permissions);
    } catch (e) {}
  }
  if (!permissions || typeof permissions !== 'object') {
    const isAdminRole = (role.id || '').toLowerCase().includes('admin') || (role.namaRole || '').toLowerCase().includes('admin');
    permissions = isAdminRole ? { ...ADMIN_ROLE_PERMISSIONS } : { ...DEFAULT_ROLE_PERMISSIONS };
  }
  return {
    ...role,
    permissions,
  };
}

export function getCurrentAuth(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, role: null, allowedBranches: [] };
  }

  const user = getActiveUser();
  if (!user || !user.isAktif) {
    return { user: null, role: null, allowedBranches: [] };
  }

  const rawRoles = getRoleList();
  const branches = getBranchList();

  const foundRole = rawRoles.find(r => r.id === user.roleId) || null;
  const role = ensureRolePermissions(foundRole);

  let allowedBranches: Branch[] = [];
  const canViewAll = Boolean(role?.permissions?.canViewAllBranches);

  if (user.assignedBranchIds === 'ALL' || canViewAll) {
    allowedBranches = branches.filter(b => b.isAktif);
  } else if (Array.isArray(user.assignedBranchIds)) {
    allowedBranches = branches.filter(b => b.isAktif && user.assignedBranchIds.includes(b.id));
  }

  return {
    user,
    role,
    allowedBranches,
  };
}

export function hasPermission(permissionKey: keyof RolePermissions): boolean {
  const { role } = getCurrentAuth();
  if (!role || !role.permissions) return false;
  return Boolean(role.permissions[permissionKey]);
}

export function canAccessBranch(branchId: string): boolean {
  const { allowedBranches } = getCurrentAuth();
  return allowedBranches.some(b => b.id === branchId);
}

export function switchUserAccount(userId: string): { success: boolean; user?: User } {
  const users = getUserList();
  const u = users.find(x => x.id === userId && x.isAktif);
  if (u) {
    persistActiveUser(u);
    return { success: true, user: u };
  }
  return { success: false };
}

export function logout(): void {
  storageLogoutUser();
}
