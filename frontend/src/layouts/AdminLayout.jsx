import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  Clock,
  Info,
  Monitor,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserCircle,
  UserCheck,
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
  { path: "/admin/info-board", label: "Papan Informasi", icon: Info },
  { path: "/admin/papan-informasi", label: "Layar Papan Informasi", icon: Monitor },
  { path: "/admin/login-history", label: "History Login", icon: Clock },
  { path: "/admin/profile", label: "Profil", icon: UserCircle },
  { path: "/admin/petugas-profiles", label: "Profil Petugas", icon: UserCheck },
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
    : MENU_ITEMS.filter((item) => item.path !== "/admin/users" && item.path !== "/admin/petugas-profiles");

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
      <div className="p-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-2 ring-white/10 shadow-lg shadow-black/20">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight min-w-0">
            <p className="font-bold text-white text-sm tracking-tight">
              BPBD Kota Semarang
            </p>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">
              Dashboard Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 py-4 space-y-1 overflow-y-auto">
        {MENU.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-brand-600/20 to-brand-500/10 text-white shadow-sm shadow-brand-500/10"
                    : "text-gray-400 hover:bg-white/[0.05] hover:text-gray-200"
                }`
              }
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-brand-400 to-brand-600 shadow-sm shadow-brand-500/30" />
                  )}
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-brand-500/20 text-brand-400"
                      : "text-gray-500 group-hover:text-gray-400 group-hover:bg-white/[0.05]"
                  }`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-brand-400/50" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03]">
          <button
            onClick={() => { navigate("/admin/profile"); closeMobile(); }}
            className="flex items-center gap-3 flex-1 min-w-0 hover:bg-white/[0.05] rounded-lg px-2 py-1.5 transition-all duration-200 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-brand-500/20 ring-2 ring-white/10 shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 shrink-0"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col h-screen w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white sticky top-0 shrink-0 border-r border-white/[0.04] lg:ml-11 lg:mt-2 lg:rounded-3xl overflow-hidden justify-between shadow-xl shadow-black/10">
          {sidebarContent}
        </aside>

        {/* Mobile overlay */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobile}
          />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white flex flex-col z-50 shadow-2xl shadow-black/30 ${
            mobileOpen ? "sidebar-drawer-enter" : "sidebar-drawer-exit"
          }`}
        >
          <div className="flex items-center justify-end p-3 lg:hidden">
            <button
              onClick={closeMobile}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 bg-gray-50/80 lg:ml-11 lg:mt-2 lg:rounded-tl-3xl">
          {/* Desktop header */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <button
              onClick={() => navigate("/admin/profile")}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-1.5 -ml-3 transition-all duration-200 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
                {initials}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-[11px] text-gray-500 capitalize">{user?.role}</p>
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xl:inline">Keluar</span>
            </button>
          </header>

          {/* Mobile header */}
          <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 lg:hidden">
            <div className="px-4 flex items-center gap-3 h-14">
              <button
                onClick={() => setMobileOpen(true)}
                className="p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo-bpbd.jpg"
                  alt="Logo BPBD"
                  className="h-8 w-8 rounded-lg object-cover shadow-sm"
                />
                <p className="font-bold text-gray-900 text-sm">
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
