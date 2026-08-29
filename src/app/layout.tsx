import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
  title: 'Stok Sirup Markisa - Mobile Web App',
  description: 'Pencatatan Hasil Produksi, Mutasi In-Transit Handshake, dan Penjualan Sirup Markisa',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#d97706',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-100 min-h-screen">
        <main className="mobile-container">
          <Header />
          <AuthGuard>
            <div className="flex-1 w-full px-4 py-4">{children}</div>
          </AuthGuard>
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
