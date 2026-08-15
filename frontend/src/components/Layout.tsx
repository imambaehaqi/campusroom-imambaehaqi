import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
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
        <NavLink to="/dashboard" className={navItemClass} onClick={() => setSidebarOpen(false)}>
          Dashboard
        </NavLink>
        <NavLink to="/rooms" className={navItemClass} onClick={() => setSidebarOpen(false)}>
          Data Ruang
        </NavLink>
        <NavLink to="/loans" className={navItemClass} onClick={() => setSidebarOpen(false)}>
          Peminjaman
        </NavLink>
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
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Sidebar - mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - mobile only */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600"
            aria-label="Buka menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-primary-700">CampusRoom</h1>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}