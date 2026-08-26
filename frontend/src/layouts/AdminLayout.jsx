import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { logout, getCurrentUser, isAdmin } from "../services/authService";

const ICONS = {
  dashboard: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  reports: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  inventory: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  vehicles: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l1.5-4.5A2 2 0 018.4 4h7.2a2 2 0 011.9 1.5L19 10M5 10h14a2 2 0 012 2v4a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1H8v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2zm2.5 3h.01M16.5 13h.01" />
    </svg>
  ),
  posko: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  activities: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  disaster: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

const MENU_ITEMS = [
  { path: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { path: "/admin/reports", label: "Laporan Bencana", icon: "reports" },
  { path: "/admin/disaster-records", label: "Pendataan Bencana", icon: "disaster" },
  { path: "/admin/users", label: "Manajemen Akun", icon: "users" },
  { path: "/admin/inventory", label: "Inventaris", icon: "inventory" },
  { path: "/admin/vehicles", label: "Kendaraan", icon: "vehicles" },
  { path: "/admin/posko", label: "Posko", icon: "posko" },
  { path: "/admin/activities", label: "Kegiatan", icon: "activities" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ y: 0, height: 0, visible: false });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const MENU = isAdmin()
    ? MENU_ITEMS
    : MENU_ITEMS.filter((item) => item.path !== "/admin/users");

  const activeIndex = MENU.findIndex((item) => location.pathname === item.path);

  useEffect(() => {
    if (!navRef.current) return;
    const links = navRef.current.querySelectorAll('a');
    const activeLink = links[activeIndex];
    if (activeLink) {
      setIndicator({
        y: activeLink.offsetTop,
        height: activeLink.offsetHeight,
        visible: true,
      });
    } else {
      setIndicator((prev) => ({ ...prev, visible: false }));
    }
  }, [activeIndex, location.pathname]);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white sticky top-0 h-screen shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD Kota Semarang"
              className="h-11 w-11 rounded-xl object-cover shadow-lg shadow-brand-500/30"
            />
            <div className="leading-tight">
              <p className="font-extrabold text-white text-sm tracking-tight">
                BPBD Kota Semarang
              </p>
              <p className="text-[11px] text-gray-400">
                Manajemen Kebencanaan
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto relative" ref={navRef}>
          {/* Sliding indicator */}
          {indicator.visible && (
            <div
              className="sidebar-indicator absolute left-4 right-4 rounded-xl bg-gradient-to-r from-brand-500 to-orange-600 shadow-lg shadow-brand-500/25 z-0"
              style={{ transform: `translateY(${indicator.y}px)`, height: indicator.height }}
            />
          )}
          {MENU.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative z-10 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? "" : "text-gray-400"}>{ICONS[item.icon]}</span>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-400 transition"
              title="Keluar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-200 lg:hidden">
          <div className="px-4 flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD Kota Semarang"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <div className="leading-tight">
                <p className="font-extrabold text-gray-900 text-sm tracking-tight">BPBD Kota Semarang</p>
                <p className="text-[11px] text-gray-500">Sistem Manajemen Kebencanaan</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-brand-50 border border-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
              <button onClick={handleLogout} className="text-xs font-semibold text-gray-500 hover:text-red-500 border border-gray-200 rounded-lg px-3 py-2 transition">
                Keluar
              </button>
            </div>
          </div>
          <nav className="flex gap-1 px-4 overflow-x-auto pb-3">
            {MENU.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition ${
                    isActive ? "bg-brand-50 text-brand-700" : "text-gray-500 hover:bg-gray-100"
                  }`
                }
              >
                {ICONS[item.icon]}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
