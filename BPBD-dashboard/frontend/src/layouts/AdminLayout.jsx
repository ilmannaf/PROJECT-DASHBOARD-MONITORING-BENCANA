import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/authService';

const MENU_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard' },
  { path: '/admin/reports', label: 'Laporan Bencana' },
  { path: '/admin/inventory', label: 'Inventaris' },
  { path: '/admin/vehicles', label: 'Kendaraan' },
  { path: '/admin/posko', label: 'Posko' },
  { path: '/admin/activities', label: 'Kegiatan' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        {/* Accent strip */}
        <div className="h-1 bg-linear-to-r from-brand-600 via-brand-500 to-brand-600" />

        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-linear-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-sm">
                BPBD
              </div>
              <div className="leading-tight">
                <p className="font-extrabold text-gray-900 text-sm tracking-tight">
                  BPBD Kota Semarang
                </p>
                <p className="text-[11px] text-gray-500">Sistem Manajemen Kebencanaan</p>
              </div>
            </div>

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-[11px] text-gray-500 capitalize leading-tight">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-gray-500 hover:text-brand-600 border border-gray-200 hover:border-brand-200 rounded-lg px-3 py-2 transition"
              >
                Keluar
              </button>
            </div>
          </div>

          {/* Nav menu */}
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {MENU_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
                    isActive
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}