import { User, Role, Branch, RolePermissions } from './types';
import { getActiveUser, getRoleList, getBranchList, getUserList, setActiveUser as persistActiveUser } from './storage';

export interface AuthState {
  user: User | null;
  role: Role | null;
  allowedBranches: Branch[];
}

export function getCurrentAuth(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, role: null, allowedBranches: [] };
  }

  const user = getActiveUser();
  const roles = getRoleList();
  const branches = getBranchList();

  const role = roles.find(r => r.id === user.roleId) || roles[0];

  let allowedBranches: Branch[] = [];
  if (user.assignedBranchIds === 'ALL' || role.permissions.canViewAllBranches) {
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
  if (!role) return false;
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
