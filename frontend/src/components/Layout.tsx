import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="px-6 py-5 border-b border-slate-200">
          <h1 className="text-lg font-bold text-primary-700">CampusRoom</h1>
          <p className="text-xs text-slate-500 mt-1">{user?.name}</p>
          <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide bg-primary-50 text-primary-700 px-2 py-0.5 rounded">
            {user?.role}
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/dashboard" className={navItemClass}>
            Dashboard
          </NavLink>
          <NavLink to="/rooms" className={navItemClass}>
            Data Ruang
          </NavLink>
          <NavLink to="/loans" className={navItemClass}>
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
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}