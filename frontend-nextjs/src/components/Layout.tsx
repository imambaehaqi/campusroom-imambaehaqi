'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/rooms', label: 'Data Ruang' },
    { href: '/loans', label: 'Peminjaman' },
  ];

  const navItemClass = (href: string) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      pathname === href ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  const sidebarContent = (
    <>
      <div className="px-6 py-5 border-b border-slate-200">
        <h1 className="text-lg font-bold text-primary-700">CampusRoom</h1>
        <p className="text-xs text-slate-500 mt-1 truncate">{user?.name}</p>
        <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
          {user?.role}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={navItemClass(item.href)}
            onClick={() => setSidebarOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          Keluar
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600" aria-label="Buka menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-primary-700">CampusRoom</h1>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}