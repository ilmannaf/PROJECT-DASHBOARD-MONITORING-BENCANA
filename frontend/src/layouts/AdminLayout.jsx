import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { logout, getCurrentUser, isAdmin } from "../services/authService";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Package,
  Car,
  Building2,
  Calendar,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/reports", label: "Laporan Bencana", icon: FileText },
  { path: "/admin/disaster-records", label: "Pendataan Bencana", icon: ClipboardList },
  { path: "/admin/users", label: "Manajemen Akun", icon: Users },
  { path: "/admin/inventory", label: "Inventaris", icon: Package },
  { path: "/admin/vehicles", label: "Kendaraan", icon: Car },
  { path: "/admin/posko", label: "Posko", icon: Building2 },
  { path: "/admin/activities", label: "Kegiatan", icon: Calendar },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const MENU = isAdmin()
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.path !== "/admin/users");

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const closeMobile = () => setMobileOpen(false);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight min-w-0">
            <p className="font-bold text-white text-sm truncate">
              BPBD Kota Semarang
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-2.5 py-3 space-y-0.5 overflow-y-auto">
        {MENU.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `sidebar-link relative z-10 flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "sidebar-active bg-brand-600/20 text-white font-semibold border-l-[3px] border-brand-500"
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-white border-l-[3px] border-transparent"
                }`
              }
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-brand-400" : "text-gray-500"
                    }`}
                  />
                  <span className="text-[13px]">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 font-bold text-[10px] flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeMobile}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white flex flex-col z-50 shadow-2xl ${
            mobileOpen ? "sidebar-drawer-enter" : "sidebar-drawer-exit"
          }`}
        >
          <div className="flex items-center justify-end p-2 lg:hidden">
            <button
              onClick={closeMobile}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 lg:hidden">
          <div className="px-3 flex items-center gap-2.5 h-12">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 -ml-0.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD"
                className="h-7 w-7 rounded-md object-cover"
              />
              <p className="font-bold text-gray-900 text-xs">
                BPBD Kota Semarang
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
