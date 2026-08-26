import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
  const [mounted, setMounted] = useState(false);
  const [indicator, setIndicator] = useState({ y: 0, height: 0, visible: false });
  const navRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => updateIndicator(), 50);
    return () => clearTimeout(timer);
  }, [mounted]);

  const updateIndicator = () => {
    if (!navRef.current) return;
    const links = navRef.current.querySelectorAll("a");
    let activeEl = null;
    links.forEach((link) => {
      if (link.classList.contains("sidebar-active")) {
        activeEl = link;
      }
    });
    if (activeEl) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = activeEl.getBoundingClientRect();
      setIndicator({
        y: linkRect.top - navRect.top + navRef.current.scrollTop,
        height: linkRect.height,
        visible: true,
      });
    } else {
      setIndicator((prev) => ({ ...prev, visible: false }));
    }
  };

  useEffect(() => {
    const handler = () => updateIndicator();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

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
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-brand-500/30 shrink-0">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight min-w-0">
            <p className="font-extrabold text-white text-sm tracking-tight truncate">
              BPBD Kota Semarang
            </p>
            <p className="text-[11px] text-gray-400 truncate">
              Sistem Manajemen Kebencanaan
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav
        ref={navRef}
        className="flex-1 p-3 py-4 space-y-1.5 overflow-y-auto relative"
      >
        {indicator.visible && (
          <div
            className="sidebar-indicator absolute left-3 right-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 shadow-lg shadow-brand-500/40 z-0"
            style={{
              transform: `translateY(${indicator.y}px)`,
              height: indicator.height,
            }}
          />
        )}
        {MENU.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `sidebar-link relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "sidebar-active text-white font-semibold"
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                }`
              }
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name}
            </p>
            <p className="text-[11px] text-gray-400 capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 bg-gray-800/60 hover:bg-red-900/40 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 shrink-0" />
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
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 lg:hidden">
          <div className="px-4 flex items-center gap-3 h-14">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD"
                className="h-8 w-8 rounded-lg object-cover"
              />
              <div className="leading-tight">
                <p className="font-extrabold text-gray-900 text-sm tracking-tight">
                  BPBD Kota Semarang
                </p>
              </div>
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
