import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MapPin,
  RefreshCw,
  Maximize2,
  Minimize2,
  Calendar,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getInfoBoard } from "../../services/infoBoardService";

const REFRESH_INTERVAL = 30000;

function formatTime(time) {
  if (!time) return "--:--";
  return time.substring(0, 5);
}

function getStatusInfo(item) {
  const now = new Date();
  const itemDate = new Date(item.info_date);

  if (item.end_time) {
    const end = new Date(itemDate);
    const [eh, em] = item.end_time.split(":");
    end.setHours(parseInt(eh), parseInt(em), 0, 0);

    const start = new Date(itemDate);
    const [sh, sm] = item.start_time.split(":");
    start.setHours(parseInt(sh), parseInt(sm), 0, 0);

    if (now >= start && now <= end) {
      return { label: "Sedang Berlangsung", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30" };
    }
    if (now < start) {
      return { label: "Akan Datang", color: "bg-brand-500", text: "text-brand-700 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-200 dark:border-brand-500/30" };
    }
    return { label: "Selesai", color: "bg-gray-400", text: "text-gray-500 dark:text-gray-400", bg: "bg-gray-50 dark:bg-white/5", border: "border-gray-200 dark:border-white/10" };
  }

  const start = new Date(itemDate);
  const [sh, sm] = item.start_time.split(":");
  start.setHours(parseInt(sh), parseInt(sm), 0, 0);

  const diff = start - now;
  if (diff > 0) return { label: "Akan Datang", color: "bg-brand-500", text: "text-brand-700 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-500/10", border: "border-brand-200 dark:border-brand-500/30" };
  if (diff > -3600000) return { label: "Sedang Berlangsung", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30" };
  return { label: "Selesai", color: "bg-gray-400", text: "text-gray-500 dark:text-gray-400", bg: "bg-gray-50 dark:bg-white/5", border: "border-gray-200 dark:border-white/10" };
}

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function PapanInformasi() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const data = await getInfoBoard();
      setItems(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("papan-informasi-dark");
    if (saved !== null) setIsDark(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("papan-informasi-dark", String(isDark));
  }, [isDark]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "d" || e.key === "D") setIsDark((p) => !p);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Filter hari ini saja, sort by start_time ascending
  const todayItems = items
    .filter((a) => {
      if (!a.info_date) return false;
      return a.info_date.split("T")[0] === getTodayString();
    })
    .sort((a, b) => {
      if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
      return 0;
    });

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const today = new Date();
  const hariIni = `${dayNames[today.getDay()]}, ${today.getDate()} ${monthNames[today.getMonth()]} ${today.getFullYear()}`;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? "bg-gray-950 text-gray-100"
        : "bg-gradient-to-b from-orange-50/80 via-white to-gray-50 text-gray-900"
    } ${isFullscreen ? "p-4" : ""}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isDark
          ? "bg-gray-950/95 border-white/10"
          : "bg-white/90 border-gray-200/80"
      }`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isFullscreen && (
              <button
                onClick={() => navigate("/admin/dashboard")}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? "text-gray-400 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
                title="Kembali ke Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD"
              className="w-10 h-10 rounded-xl object-cover shadow-sm"
            />
            <div>
              <h1 className={`text-lg sm:text-xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}>
                Papan Informasi
              </h1>
              <p className={`text-[11px] font-medium ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}>
                BPBD Kota Semarang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`hidden sm:flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-mono text-lg font-bold tracking-wider ${
              isDark
                ? "bg-white/5 border border-white/10 text-white"
                : "bg-white border border-gray-200 text-gray-800 shadow-sm"
            }`}>
              <Clock className={`w-4 h-4 ${isDark ? "text-brand-400" : "text-brand-500"}`} />
              {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>

            <button
              onClick={fetchData}
              className={`p-2.5 rounded-xl transition-all ${
                isDark
                  ? "border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  : "border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsDark((p) => !p)}
              className={`p-2.5 rounded-xl transition-all ${
                isDark
                  ? "border border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10"
                  : "border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
              title="Toggle tema (D)"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className={`p-2.5 rounded-xl transition-all ${
                isDark
                  ? "border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  : "border border-gray-200 bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 shadow-sm"
              }`}
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Date bar */}
      <div className={`border-b transition-colors duration-300 ${
        isDark ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-white/60"
      }`}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl ${
              isDark
                ? "bg-brand-500/15 border border-brand-500/30"
                : "bg-brand-50 border border-brand-200"
            }`}>
              <Calendar className={`w-4 h-4 ${isDark ? "text-brand-400" : "text-brand-500"}`} />
              <span className={`text-sm font-bold ${isDark ? "text-brand-400" : "text-brand-600"}`}>
                {hariIni}
              </span>
            </div>
          </div>
          <div className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
            Auto-refresh tiap 30 detik
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {loading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className={`w-12 h-12 rounded-full border-4 animate-spin mb-4 ${
              isDark ? "border-white/10 border-t-brand-500" : "border-gray-200 border-t-brand-500"
            }`} />
            <p className={`text-sm font-medium ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Memuat jadwal hari ini...
            </p>
          </div>
        ) : todayItems.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-32 rounded-2xl ${
            isDark ? "bg-white/[0.02]" : "bg-white"
          }`}>
            <Calendar className={`w-12 h-12 mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`} />
            <p className={`text-lg font-semibold ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Belum ada jadwal hari ini
            </p>
            <p className={`text-sm mt-1 ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              Tambah jadwal melalui menu "Papan Informasi" di sidebar
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayItems.map((item) => {
              const status = getStatusInfo(item);
              return (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    isDark
                      ? "bg-white/[0.03] border-brand-500/20 hover:border-brand-500/40"
                      : "bg-white border-brand-100 hover:border-brand-300 shadow-sm hover:shadow-brand-100/50"
                  }`}
                >
                  {/* Time block */}
                  <div className={`shrink-0 w-20 text-center py-2 px-3 rounded-lg ${
                    isDark ? "bg-brand-500/10" : "bg-brand-50"
                  }`}>
                    <span className={`block text-lg font-mono font-bold leading-tight ${
                      isDark ? "text-brand-400" : "text-brand-600"
                    }`}>
                      {formatTime(item.start_time)}
                    </span>
                    {item.end_time && (
                      <span className={`block text-xs font-mono mt-0.5 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}>
                        — {formatTime(item.end_time)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className={`text-sm font-bold leading-tight ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}>
                          {item.title}
                        </h3>
                        {item.location && (
                          <div className={`flex items-center gap-1.5 mt-1.5 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}>
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs truncate">{item.location}</span>
                          </div>
                        )}
                        {item.description && (
                          <p className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                            isDark ? "text-gray-500" : "text-gray-400"
                          }`}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.color} ${
                          status.label === "Sedang Berlangsung" ? "animate-pulse" : ""
                        }`} />
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      {!isFullscreen && (
        <footer className={`border-t py-4 mt-8 transition-colors duration-300 ${
          isDark ? "border-white/5" : "border-gray-100"
        }`}>
          <div className="mx-auto max-w-5xl px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/assets/logo-bpbd.jpg" alt="Logo BPBD" className="w-5 h-5 rounded object-cover" />
              <span className={`text-xs ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                © 2026 BPBD Kota Semarang
              </span>
            </div>
            <div className={`flex items-center gap-3 text-[11px] ${isDark ? "text-gray-600" : "text-gray-400"}`}>
              <span className="hidden sm:inline">
                <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                  isDark ? "bg-white/10 text-gray-500" : "bg-gray-100 text-gray-500"
                }`}>F</kbd> fullscreen
              </span>
              <span className="hidden sm:inline">
                <kbd className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                  isDark ? "bg-white/10 text-gray-500" : "bg-gray-100 text-gray-500"
                }`}>D</kbd> tema
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
