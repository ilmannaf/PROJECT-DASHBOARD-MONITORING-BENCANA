import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  UserCircle,
  UserCheck,
  Search,
  ArrowRight,
  LogOut,
  Droplets,
  Weight,
} from 'lucide-react';
import { logout } from '../services/authService';

const COMMANDS = [
  // Navigasi
  { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, category: 'Navigasi', shortcut: '1' },
  { id: 'reports', label: 'Laporan Bencana', path: '/admin/reports', icon: FileText, category: 'Navigasi', shortcut: '2' },
  { id: 'disaster-records', label: 'Pendataan Bencana', path: '/admin/disaster-records', icon: ClipboardList, category: 'Navigasi', shortcut: '3' },
  { id: 'users', label: 'Manajemen Akun', path: '/admin/users', icon: Users, category: 'Navigasi', shortcut: '4' },
  { id: 'inventory', label: 'Inventaris', path: '/admin/inventory', icon: Package, category: 'Navigasi', shortcut: '5' },
  { id: 'vehicles', label: 'Kendaraan', path: '/admin/vehicles', icon: Car, category: 'Navigasi', shortcut: '6' },
  { id: 'posko', label: 'Posko', path: '/admin/posko', icon: Building2, category: 'Navigasi', shortcut: '7' },
  { id: 'activities', label: 'Kegiatan', path: '/admin/activities', icon: Calendar, category: 'Navigasi', shortcut: '8' },
  { id: 'water-distribution', label: 'Pendistribusian Air Bersih', path: '/admin/water-distribution', icon: Droplets, category: 'Navigasi' },
  { id: 'unexpected-expenditure', label: 'Belanja Tidak Terduga (BTT)', path: '/admin/unexpected-expenditure', icon: Weight, category: 'Navigasi' },
  { id: 'info-board', label: 'Papan Informasi', path: '/admin/info-board', icon: Info, category: 'Navigasi', shortcut: '9' },
  { id: 'info-screen', label: 'Layar Papan Informasi', path: '/admin/papan-informasi', icon: Monitor, category: 'Navigasi' },
  { id: 'login-history', label: 'History Login', path: '/admin/login-history', icon: Clock, category: 'Navigasi', shortcut: '0' },
  { id: 'profile', label: 'Profil Saya', path: '/admin/profile', icon: UserCircle, category: 'Navigasi' },
  { id: 'petugas-profiles', label: 'Profil Petugas', path: '/admin/petugas-profiles', icon: UserCheck, category: 'Navigasi' },
  // Aksi
  { id: 'shortcuts-help', label: 'Lihat Keyboard Shortcuts', path: null, icon: Search, category: 'Aksi', shortcut: '?' },
  { id: 'dark-mode', label: 'Toggle Dark Mode', path: null, icon: Search, category: 'Aksi', shortcut: 'D', action: 'darkmode' },
  { id: 'logout', label: 'Keluar', path: null, icon: LogOut, category: 'Aksi', action: 'logout' },
];

export default function CommandPalette({ open, onClose, onShowShortcuts, onToggleDarkMode }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filter commands berdasarkan query
  const filtered = useMemo(() => {
    if (!query.trim()) return COMMANDS;
    const q = query.toLowerCase();
    return COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Reset state saat buka
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selected index saat filter berubah
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[selectedIndex];
    if (item) {
      item.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const executeCommand = (cmd) => {
    if (cmd.action === 'logout') {
      logout();
      navigate('/admin/login');
      onClose();
      return;
    }
    if (cmd.action === 'darkmode') {
      onToggleDarkMode?.();
      onClose();
      return;
    }
    if (cmd.id === 'shortcuts-help') {
      onClose();
      onShowShortcuts?.();
      return;
    }
    if (cmd.path) {
      navigate(cmd.path);
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        executeCommand(filtered[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mx-4">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik untuk navigasi..."
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
                />
                <kbd className="hidden sm:inline px-2 py-0.5 text-[11px] font-mono text-gray-400 bg-gray-100 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-400">Tidak ada hasil untuk &quot;{query}&quot;</p>
                  </div>
                ) : (
                  <>
                    {/* Group by category */}
                    {['Navigasi', 'Aksi'].map((category) => {
                      const items = filtered.filter((c) => c.category === category);
                      if (items.length === 0) return null;
                      return (
                        <div key={category}>
                          <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {category}
                          </p>
                          {items.map((cmd) => {
                            const globalIndex = filtered.indexOf(cmd);
                            const Icon = cmd.icon;
                            const isSelected = globalIndex === selectedIndex;
                            return (
                              <button
                                key={cmd.id}
                                onClick={() => executeCommand(cmd)}
                                onMouseEnter={() => setSelectedIndex(globalIndex)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                                  isSelected
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className="flex-1 text-sm font-medium truncate">{cmd.label}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  {cmd.shortcut && (
                                    <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                                      isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                      {cmd.shortcut}
                                    </kbd>
                                  )}
                                  {isSelected && (
                                    <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono">↑↓</kbd> navigasi
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono">↵</kbd> pilih
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 bg-gray-100 rounded font-mono">esc</kbd> tutup
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
