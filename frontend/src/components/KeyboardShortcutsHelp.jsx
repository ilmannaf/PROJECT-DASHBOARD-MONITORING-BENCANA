import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

const SHORTCUT_SECTIONS = [
  {
    title: 'Navigasi Cepat',
    shortcuts: [
      { keys: ['1'], desc: 'Dashboard' },
      { keys: ['2'], desc: 'Laporan Bencana' },
      { keys: ['3'], desc: 'Pendataan Bencana' },
      { keys: ['4'], desc: 'Manajemen Akun' },
      { keys: ['5'], desc: 'Inventaris' },
      { keys: ['6'], desc: 'Kendaraan' },
      { keys: ['7'], desc: 'Posko' },
      { keys: ['8'], desc: 'Kegiatan' },
      { keys: ['9'], desc: 'Papan Informasi' },
      { keys: ['0'], desc: 'History Login' },
    ],
  },
  {
    title: 'Aksi',
    shortcuts: [
      { keys: ['Ctrl', 'K'], desc: 'Command Palette' },
      { keys: ['?'], desc: 'Buka panel ini' },
      { keys: ['/'], desc: 'Focus search bar' },
      { keys: ['R'], desc: 'Refresh data' },
      { keys: ['N'], desc: 'Toggle form tambah baru' },
      { keys: ['['], desc: 'Collapse sidebar' },
      { keys: [']'], desc: 'Expand sidebar' },
      { keys: ['D'], desc: 'Toggle dark mode' },
      { keys: ['Esc'], desc: 'Tutup modal / form' },
    ],
  },
];

function KeyBadge({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded shadow-sm">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsHelp({ open, onClose }) {
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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mx-4">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Keyboard className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Keyboard Shortcuts</h2>
                    <p className="text-[11px] text-gray-400">Navigasi lebih cepat dengan keyboard</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcuts */}
              <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-5">
                {SHORTCUT_SECTIONS.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      {section.title}
                    </h3>
                    <div className="space-y-1">
                      {section.shortcuts.map((shortcut) => (
                        <div
                          key={shortcut.desc}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm text-gray-700">{shortcut.desc}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, i) => (
                              <span key={i} className="flex items-center gap-1">
                                {i > 0 && <span className="text-[10px] text-gray-300">+</span>}
                                <KeyBadge>{key}</KeyBadge>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <p className="text-[11px] text-gray-400 text-center">
                  Shortcut tidak aktif saat mengetik di input field
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
