'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentAuth, AuthState } from '@/lib/auth-store';
import { LayoutDashboard, Wine, Building, Factory, ArrowLeftRight, ShoppingCart, Users, History, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [auth, setAuth] = useState<AuthState>({ user: null, role: null, allowedBranches: [] });

  useEffect(() => {
    setAuth(getCurrentAuth());
    const handleUpdate = () => setAuth(getCurrentAuth());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('userSwitched', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('userSwitched', handleUpdate);
    };
  }, []);

  if (!auth.role || pathname === '/login') return null;

  const perms = auth.role.permissions;

  // Navigation Items
  const navItems = [
    {
      href: '/',
      label: 'Stok',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/barang',
      label: 'Barang',
      icon: Wine,
      show: perms.canManageProducts,
    },
    {
      href: '/branches',
      label: 'Branch',
      icon: Building,
      show: perms.canManageBranches,
    },
    {
      href: '/produksi',
      label: 'Produksi',
      icon: Factory,
      show: perms.canAddProduction,
    },
    {
      href: '/transfer',
      label: 'Mutasi',
      icon: ArrowLeftRight,
      show: perms.canTransferStock || perms.canReceiveStock,
    },
    {
      href: '/penjualan',
      label: 'Penjualan',
      icon: ShoppingCart,
      show: perms.canRecordSale,
    },
    {
      href: '/users',
      label: 'Users',
      icon: Users,
      show: perms.canManageUsers,
    },
    {
      href: '/riwayat',
      label: 'Riwayat',
      icon: History,
      show: true,
    },
    {
      href: '/pengaturan',
      label: 'Pengaturan',
      icon: Settings,
      show: perms.canManageSettings,
    },
  ].filter(item => item.show);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl w-full max-w-[540px] min-w-[320px]">
      <div className="flex items-center justify-around px-2 py-2 overflow-x-auto no-scrollbar">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-700 font-bold bg-amber-50 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'scale-110 text-amber-600' : ''}`} />
              <span className="text-[10px] leading-tight truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
