import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { logout, getCurrentUser, isAdmin } from "../services/authService";
import { getSocket } from "../services/socket";
import { useTheme } from "../context/ThemeContext";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import CommandPalette from "../components/CommandPalette";
import KeyboardShortcutsHelp from "../components/KeyboardShortcutsHelp";
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
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  UserCircle,
  UserCheck,
  Home,
  Keyboard,
  Sun,
  Moon,
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

// Breadcrumb mapping
const BREADCRUMB_MAP = {
  "/admin/dashboard": "Dashboard",
  "/admin/reports": "Laporan Bencana",
  "/admin/disaster-records": "Pendataan Bencana",
  "/admin/users": "Manajemen Akun",
  "/admin/inventory": "Inventaris",
  "/admin/vehicles": "Kendaraan",
  "/admin/posko": "Posko",
  "/admin/activities": "Kegiatan",
  "/admin/info-board": "Papan Informasi",
  "/admin/papan-informasi": "Layar Papan Informasi",
  "/admin/login-history": "History Login",
  "/admin/profile": "Profil",
  "/admin/petugas-profiles": "Profil Petugas",
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchInputRef = useRef(null);
  const notifDropdownRef = useRef(null);

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

  const currentBreadcrumb = BREADCRUMB_MAP[location.pathname] || "Dashboard";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setUserDropdownOpen(false);
    if (userDropdownOpen) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [userDropdownOpen]);

  // Keyboard shortcuts
  const toggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), []);
  const expandSidebar = useCallback(() => setSidebarCollapsed(false), []);
  const collapseSidebar = useCallback(() => setSidebarCollapsed(true), []);
  const focusSearch = useCallback(() => searchInputRef.current?.focus(), []);

  // Navigation shortcuts (1-0) — map ke MENU_ITEMS paths
  const navigationShortcuts = MENU_ITEMS.slice(0, 10).map((item, index) => ({
    key: String(index === 9 ? 0 : index + 1),
    action: () => navigate(item.path),
  }));

  useKeyboardShortcuts([
    // Command Palette
    { key: 'k', ctrl: true, action: () => setCommandPaletteOpen((p) => !p), allowWhenTyping: true },
    // Shortcuts Help
    { key: '?', action: () => setShortcutsHelpOpen((p) => !p), allowWhenTyping: true },
    // Navigation 1-0
    ...navigationShortcuts,
    // Sidebar toggle
    { key: '[', action: collapseSidebar },
    { key: ']', action: expandSidebar },
    // Search focus
    { key: '/', action: focusSearch },
    // Dark mode toggle
    { key: 'd', action: toggleTheme },
    // Escape — tutup semua modal
    { key: 'Escape', action: () => {
      setCommandPaletteOpen(false);
      setShortcutsHelpOpen(false);
      setNotifOpen(false);
    }, allowWhenTyping: true },
  ]);

  // Socket — real-time notifications
  useEffect(() => {
    const socket = getSocket();

    const onNewReport = (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'new_report',
          title: 'Laporan Baru',
          message: `${data.disaster_type} di ${data.address || '-'}`,
          time: new Date(),
          read: false,
        },
        ...prev.slice(0, 19), // max 20 notif
      ]);
    };

    const onStatusUpdate = (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: 'status_update',
          title: 'Status Diperbarui',
          message: `${data.tracking_code} → ${data.status}`,
          time: new Date(),
          read: false,
        },
        ...prev.slice(0, 19),
      ]);
    };

    socket.on('new_report', onNewReport);
    socket.on('report_status_updated', onStatusUpdate);
    return () => {
      socket.off('new_report', onNewReport);
      socket.off('report_status_updated', onStatusUpdate);
    };
  }, []);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [notifOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setNotifOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Sidebar Brand */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 ring-2 ring-white/10 shadow-lg shadow-black/20">
          <img
            src="/assets/logo-bpbd.jpg"
            alt="Logo BPBD"
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`leading-tight min-w-0 ${sidebarCollapsed ? "hidden" : ""}`}>
          <p className="font-bold text-white text-sm tracking-tight">
            BPBD Kota Semarang
          </p>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            Monitoring Bencana
          </p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-3 space-y-0.5 overflow-y-auto px-2">
        <p className={`text-[10px] font-bold uppercase tracking-wider text-gray-500 px-3 mb-2 ${sidebarCollapsed ? "hidden" : ""}`}>
          MENU
        </p>
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className={`flex-1 ${sidebarCollapsed ? "hidden" : ""}`}>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      {!sidebarCollapsed && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen fixed top-0 left-0 z-30 bg-[#343a40] text-white transition-all duration-300 ${
          sidebarCollapsed ? "w-[60px]" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={closeMobile}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-72 bg-[#343a40] text-white flex flex-col z-50 shadow-2xl ${
            mobileOpen ? "sidebar-drawer-enter" : "sidebar-drawer-exit"
          }`}
        >
          <div className="flex items-center justify-end p-2 lg:hidden">
            <button
              onClick={closeMobile}
              className="p-2 text-gray-400 hover:text-white rounded hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {sidebarContent}
        </aside>
      </div>

      {/* Main Content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? "lg:ml-[60px]" : "lg:ml-64"}`}>
        {/* Top Navbar */}
        <nav className="sticky top-0 z-20 bg-white border-b border-gray-200 adminlte-navbar">
          <div className="flex items-center justify-between px-4 py-0 h-[57px]">
            {/* Left: Toggle + Search */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-white/10 rounded transition-all"
                title="Toggle sidebar ( [ / ] )"
              >
                <Menu className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search — klik untuk buka Command Palette */}
              <div className="hidden md:flex items-center ml-2">
                <button
                  ref={searchInputRef}
                  onClick={() => setCommandPaletteOpen(true)}
                  className="relative flex items-center w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-white/10 border border-transparent rounded-lg text-sm text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15 hover:border-gray-300 dark:hover:border-white/20 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-white/10 transition-all cursor-text"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <span>Cari halaman... ( Ctrl+K )</span>
                </button>
              </div>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-1">
              {/* Keyboard Shortcuts */}
              <button
                onClick={() => setShortcutsHelpOpen(true)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-white/10 rounded transition-all hidden sm:flex"
                title="Keyboard Shortcuts ( ? )"
              >
                <Keyboard className="w-5 h-5" />
              </button>

              {/* Command Palette */}
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-white/10 rounded transition-all hidden sm:flex"
                title="Command Palette ( Ctrl+K )"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-yellow-400 dark:hover:bg-white/10 rounded transition-all hidden sm:flex"
                title={isDark ? "Mode Terang" : "Mode Gelap"}
              >
                {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications — functional dropdown */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={() => setNotifOpen((p) => !p)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all hidden sm:flex"
                  title="Notifikasi"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Semua dibaca
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-[11px] text-gray-400 hover:text-red-500 font-medium"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400">Belum ada notifikasi</p>
                          <p className="text-[11px] text-gray-300 mt-1">Notifikasi laporan baru akan muncul di sini</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                              !notif.read ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                notif.type === 'new_report'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                {notif.type === 'new_report' ? (
                                  <FileText className="w-4 h-4" />
                                ) : (
                                  <Clock className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900">{notif.title}</p>
                                <p className="text-xs text-gray-500 truncate">{notif.message}</p>
                                <p className="text-[10px] text-gray-400 mt-1">
                                  {notif.time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              {!notif.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserDropdownOpen(!userDropdownOpen);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">{user?.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => { navigate("/admin/profile"); setUserDropdownOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all"
                    >
                      <UserCircle className="w-4 h-4" />
                      Profil Saya
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Content Header (Breadcrumb) */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">{currentBreadcrumb}</h1>
            <nav className="flex items-center text-sm text-gray-500">
              <Home className="w-3.5 h-3.5 mr-1" />
              <span className="mx-1">/</span>
              <NavLink to="/admin/dashboard" className="text-blue-600 hover:underline">Home</NavLink>
              <span className="mx-1">/</span>
              <span className="text-gray-600">{currentBreadcrumb}</span>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="p-4">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="adminlte-footer text-center text-sm">
          <strong>Copyright &copy; 2024&nbsp;
            <a href="#" className="text-blue-600 hover:underline">BPBD Kota Semarang</a>.
          </strong>
          All rights reserved.
        </footer>
      </div>

      {/* Keyboard Shortcuts Components */}
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onShowShortcuts={() => setShortcutsHelpOpen(true)}
        onToggleDarkMode={toggleTheme}
      />
      <KeyboardShortcutsHelp
        open={shortcutsHelpOpen}
        onClose={() => setShortcutsHelpOpen(false)}
      />
    </div>
  );
}
