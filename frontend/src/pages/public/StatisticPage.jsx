import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, BarChart3, FileText, CheckCircle, Loader2, Shield,
  Waves, Mountain, Flame, Tornado, CloudRain, TreePine, AlertTriangle,
  Zap, TrendingUp, Calendar, ChevronDown, RefreshCw, ArrowUpRight,
  PieChart, Activity,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimatedNumber from "../../components/AnimatedNumber";
import api from "../../services/api";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const DISASTER_ICONS = {
  Banjir: { icon: Waves, color: "text-blue-500", bg: "bg-blue-50", ring: "ring-blue-100" },
  "Tanah Longsor": { icon: Mountain, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
  "Gempa Bumi": { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", ring: "ring-red-100" },
  Kebakaran: { icon: Flame, color: "text-orange-500", bg: "bg-orange-50", ring: "ring-orange-100" },
  "Angin Kencang": { icon: Tornado, color: "text-purple-500", bg: "bg-purple-50", ring: "ring-purple-100" },
  "Cuaca Ekstrem": { icon: CloudRain, color: "text-indigo-500", bg: "bg-indigo-50", ring: "ring-indigo-100" },
  "Pohon Tumbang": { icon: TreePine, color: "text-green-600", bg: "bg-green-50", ring: "ring-green-100" },
  Lainnya: { icon: Zap, color: "text-gray-500", bg: "bg-gray-50", ring: "ring-gray-100" },
};

const BAR_COLORS = [
  "#3b82f6", "#f97316", "#10b981", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f59e0b", "#6366f1",
  "#ef4444", "#06b6d4", "#84cc16", "#e11d48",
];

const YEAR_OPTIONS = [2026, 2025, 2024];

function getDisasterMeta(name) {
  return DISASTER_ICONS[name] || DISASTER_ICONS.Lainnya;
}

export default function StatisticPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="sticky top-0 z-30 border-b border-brand-100/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600 transition-all duration-200 hover:bg-brand-100 hover:border-brand-300 hover:shadow-sm active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD Kota Semarang"
                className="h-9 w-9 rounded-lg object-cover shadow-sm"
              />
              <div>
                <span className="text-sm font-bold text-gray-900">Statistik</span>
                <span className="ml-2 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  LIVE
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-all duration-200 hover:bg-brand-700 hover:shadow-md hover:shadow-brand-600/30 active:scale-95"
          >
            Beranda
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-orange-500 pb-24 pt-24 text-white lg:pb-28 lg:pt-28">
        {/* Curved top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="white" />
          </svg>
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/[0.07] blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-amber-400/5 blur-3xl" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Activity className="h-3.5 w-3.5" />
            Statistik Real-time
          </div>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl xl:text-5xl">
            Statistik Penanganan Bencana
          </h1>
          <p className="mx-auto max-w-lg text-sm text-white/70 lg:text-base">
            Data real-time kejadian bencana di Kota Semarang — pantau tren dan respons penanganan
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="font-medium text-white/90">Data diperbarui otomatis</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Calendar className="h-3.5 w-3.5 text-white/70" />
              <span className="font-medium text-white/90">{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <section className="relative bg-gray-50 pb-12 pt-4 lg:pb-16 lg:pt-6">
        <div className="mx-auto max-w-6xl px-6">
          <StatistikSection />

          <div className="mt-10">
            <StatistikChart />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatistikSection() {
  const [stats, setStats] = useState({ total: 0, byStatus: {}, byType: [] });
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/public/stats");
        setStats({
          total: data.laporan || 0,
          byStatus: data.byStatus || {},
          byType: data.byType || [],
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div ref={sectionRef} className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-brand-500" />
          <span className="text-sm font-medium text-gray-400">Memuat data statistik...</span>
        </div>
      </div>
    );
  }

  const sortedTypes = (stats.byType || []).sort((a, b) => b.jumlah - a.jumlah);

  const statusCards = [
    {
      icon: FileText,
      label: "Total Laporan",
      value: stats.total,
      gradient: "from-brand-500 to-orange-500",
      iconBg: "bg-brand-100",
      iconColor: "text-brand-600",
      ring: "ring-brand-200",
      badge: null,
    },
    {
      icon: CheckCircle,
      label: "Selesai Ditangani",
      value: stats.byStatus?.selesai || 0,
      gradient: "from-emerald-500 to-green-500",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      ring: "ring-emerald-200",
      badge: stats.total > 0 ? Math.round(((stats.byStatus?.selesai || 0) / stats.total) * 100) : 0,
    },
    {
      icon: Activity,
      label: "Sedang Diproses",
      value: (stats.byStatus?.ditindaklanjuti || 0) + (stats.byStatus?.diverifikasi || 0),
      gradient: "from-blue-500 to-indigo-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      ring: "ring-blue-200",
      badge: null,
    },
  ];

  return (
    <div ref={sectionRef}>
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {statusCards.map((card, idx) => (
          <StatCard key={idx} {...card} visible={visible} delay={idx * 0.1} />
        ))}
      </div>

      {/* Disaster Types */}
      {sortedTypes.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm shadow-brand-500/20">
                <PieChart className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Jenis Bencana</h3>
                <p className="text-[11px] text-gray-400">Distribusi berdasarkan kategori</p>
              </div>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold text-brand-600">
              {sortedTypes.length} kategori
            </span>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {sortedTypes.map((item, idx) => {
                const pct = stats.total > 0 ? Math.round((item.jumlah / stats.total) * 100) : 0;
                const meta = getDisasterMeta(item.name);
                const IconComp = meta.icon;
                return (
                  <div key={idx} className="group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 hover:bg-gray-50">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.bg} ${meta.ring}`}>
                      <IconComp className={`h-4 w-4 ${meta.color}`} />
                    </div>
                    <span className="w-32 shrink-0 truncate text-sm font-semibold text-gray-700">
                      {item.name}
                    </span>
                    <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${meta.color.replace("text-", "from-").replace("-500", "-400")} to-brand-500 transition-all duration-700 ease-out`}
                        style={{ width: `${pct}%` }}
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-10 text-right text-sm font-bold text-gray-900">
                        {item.jumlah}
                      </span>
                      <span className="w-10 text-right text-[11px] font-semibold text-gray-400">
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient, iconBg, iconColor, ring, badge, visible, delay }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
      style={{ transitionDelay: `${delay}s` }}
    >
      {/* Gradient corner accent */}
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-125`} />

      <div className="relative flex items-start justify-between">
        <div>
          <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ring-2 ${iconBg} ${ring}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <p className="text-[13px] font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
            {visible ? <AnimatedNumber value={value} duration={1400} /> : 0}
          </p>
        </div>
        {badge !== null && badge !== undefined && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <TrendingUp className="h-3 w-3" />
            {badge}%
          </span>
        )}
      </div>

      {/* Bottom gradient bar */}
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${gradient} opacity-40 transition-opacity duration-300 group-hover:opacity-70`} />
    </div>
  );
}

function StatistikChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthTypes, setMonthTypes] = useState([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [monthlyTypes, setMonthlyTypes] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [yearMenuOpen, setYearMenuOpen] = useState(false);

  const fetchYearData = async (year) => {
    setLoading(true);
    setSelectedMonth(null);
    setMonthTypes([]);
    setMonthTotal(0);
    try {
      const currentMonth = year === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;

      const { data: res } = await api.get("/public/stats/monthly", { params: { year } });
      const monthlyRaw = res.monthly || [];
      setData(
        monthlyRaw.slice(0, currentMonth).map((count, idx) => ({
          name: MONTH_LABELS[idx],
          jumlah: count,
          monthIndex: idx + 1,
        }))
      );

      const typesPromises = [];
      for (let m = 1; m <= currentMonth; m++) {
        typesPromises.push(
          api.get("/public/stats/monthly/by-type", { params: { year, month: m } })
            .then(({ data: r }) => ({ month: m, byType: r.byType || [], total: r.total || 0 }))
            .catch(() => ({ month: m, byType: [], total: 0 }))
        );
      }
      const results = await Promise.all(typesPromises);
      const typesMap = {};
      results.forEach((r) => { typesMap[r.month] = { byType: r.byType, total: r.total }; });
      setMonthlyTypes(typesMap);
    } catch {
      const currentMonth = year === new Date().getFullYear() ? new Date().getMonth() + 1 : 12;
      setData(
        MONTH_LABELS.slice(0, currentMonth).map((m, idx) => ({
          name: m,
          jumlah: 0,
          monthIndex: idx + 1,
        }))
      );
      setMonthlyTypes({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearData(selectedYear);
  }, [selectedYear]);

  const handleBarClick = async (monthIndex) => {
    if (selectedMonth === monthIndex) {
      setSelectedMonth(null);
      setMonthTypes([]);
      setMonthTotal(0);
      return;
    }

    setSelectedMonth(monthIndex);
    setLoadingDetail(true);
    try {
      const cached = monthlyTypes[monthIndex];
      if (cached) {
        setMonthTypes(cached.byType);
        setMonthTotal(cached.total);
      } else {
        const { data: res } = await api.get("/public/stats/monthly/by-type", {
          params: { year: selectedYear, month: monthIndex },
        });
        setMonthTypes(res.byType || []);
        setMonthTotal(res.total || 0);
      }
    } catch {
      setMonthTypes([]);
      setMonthTotal(0);
    } finally {
      setLoadingDetail(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0]?.payload;
    if (!entry) return null;
    const monthData = monthlyTypes[entry.monthIndex];
    const types = monthData?.byType || [];
    const total = monthData?.total || entry.jumlah;

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="bg-gradient-to-r from-brand-500 to-orange-500 px-4 py-2">
          <p className="text-xs font-bold text-white">{entry.name} {selectedYear}</p>
        </div>
        <div className="p-3">
          {types.length > 0 ? (
            <div className="space-y-1.5">
              {types.map((t, i) => {
                const meta = getDisasterMeta(t.name);
                const IconComp = meta.icon;
                return (
                  <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <IconComp className={`h-3 w-3 ${meta.color}`} />
                      {t.name}
                    </span>
                    <span className="font-semibold text-gray-800">{t.jumlah}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-100 pt-1.5 mt-1.5 flex items-center justify-between text-[11px]">
                <span className="font-bold text-gray-700">Total</span>
                <span className="font-extrabold text-brand-600">{total}</span>
              </div>
            </div>
          ) : (
            <p className="py-2 text-center text-[11px] text-gray-400">Tidak ada laporan</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-6" style={{ height: 320 }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
          <span className="text-sm font-medium text-gray-400">Memuat grafik...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm shadow-brand-500/20">
            <BarChart3 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Tren Laporan per Bulan</h3>
            <p className="text-[11px] text-gray-400">Klik bar untuk melihat detail per jenis bencana</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Year selector */}
          <div className="relative">
            <button
              onClick={() => setYearMenuOpen(!yearMenuOpen)}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
            >
              <Calendar className="h-3.5 w-3.5 text-brand-500" />
              {selectedYear}
              <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${yearMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {yearMenuOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-xl">
                {YEAR_OPTIONS.map((year) => (
                  <button
                    key={year}
                    onClick={() => { setSelectedYear(year); setYearMenuOpen(false); }}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-sm transition-colors duration-150 ${
                      selectedYear === year
                        ? "bg-brand-50 font-bold text-brand-700"
                        : "font-medium text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {year}
                    {selectedYear === year && <CheckCircle className="h-3.5 w-3.5 text-brand-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={() => fetchYearData(selectedYear)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 active:scale-90"
            title="Muat ulang"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hint */}
      {!selectedMonth && data.some((d) => d.jumlah > 0) && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-50 to-orange-50 px-4 py-2.5 ring-1 ring-brand-100/60">
          <TrendingUp className="h-4 w-4 text-brand-500" />
          <span className="text-[12px] font-semibold text-brand-700">Klik bar pada grafik untuk melihat detail bencana per bulan</span>
        </div>
      )}

      {/* Chart */}
      <div className="px-4 py-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barSize={32}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              allowDecimals={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(249,115,22,0.06)", radius: 8 }}
            />
            <Bar
              dataKey="jumlah"
              radius={[6, 6, 0, 0]}
              onClick={(entry) => handleBarClick(entry.monthIndex)}
              style={{ cursor: "pointer" }}
            >
              {data.map((entry, idx) => {
                const isSelected = selectedMonth === entry.monthIndex;
                const hasData = entry.jumlah > 0;
                return (
                  <Cell
                    key={idx}
                    fill={
                      isSelected
                        ? "url(#selectedGradient)"
                        : hasData
                        ? BAR_COLORS[idx % BAR_COLORS.length]
                        : "#e5e7eb"
                    }
                    opacity={
                      isSelected ? 1 : selectedMonth ? (hasData ? 0.35 : 0.2) : hasData ? 0.9 : 0.35
                    }
                  />
                );
              })}
            </Bar>
            <defs>
              <linearGradient id="selectedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#e65100" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detail breakdown when a month is clicked */}
      {selectedMonth && (
        <div className="border-t border-gray-100 px-6 py-5">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-orange-500 text-[11px] font-bold text-white shadow-sm">
                    {MONTH_LABELS[selectedMonth - 1]}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Detail Jenis Bencana</h4>
                    <p className="text-[11px] text-gray-400">{selectedYear} — {MONTH_LABELS[selectedMonth - 1]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1">
                  <span className="text-[11px] font-semibold text-brand-600">Total:</span>
                  <span className="text-sm font-extrabold text-brand-700">{monthTotal}</span>
                </div>
              </div>
              {monthTypes.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  Tidak ada laporan pada bulan ini.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthTypes.map((item, idx) => {
                    const pct = monthTotal > 0 ? Math.round((item.jumlah / monthTotal) * 100) : 0;
                    const meta = getDisasterMeta(item.name);
                    const IconComp = meta.icon;
                    return (
                      <div key={idx} className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${meta.bg} ${meta.ring}`}>
                          <IconComp className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <span className="w-28 shrink-0 truncate text-xs font-semibold text-gray-700">
                          {item.name}
                        </span>
                        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${meta.color.replace("text-", "from-").replace("-500", "-400")} to-brand-500 transition-all duration-700 ease-out`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs font-bold text-gray-900">
                          {item.jumlah}
                        </span>
                        <span className="w-10 shrink-0 text-right text-[11px] font-semibold text-gray-400">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
