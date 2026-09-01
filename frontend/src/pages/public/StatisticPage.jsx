import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart3, FileText, CheckCircle, Loader2, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimatedNumber from "../../components/AnimatedNumber";
import api from "../../services/api";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export default function StatisticPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD Kota Semarang"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="text-sm font-bold text-gray-900">BPBD Kota Semarang</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-orange-600 py-20 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <BarChart3 className="h-3 w-3" />
            Statistik
          </span>
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            Statistik Penanganan Bencana
          </h1>
          <p className="mx-auto max-w-lg text-sm text-white/70 lg:text-base">
            Data real-time kejadian bencana di Kota Semarang
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="relative bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <StatistikSection />

          <div className="mt-14">
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
      <div ref={sectionRef} className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const sortedTypes = (stats.byType || []).sort((a, b) => b.jumlah - a.jumlah);

  return (
    <div ref={sectionRef}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-stagger-group>
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Total Laporan"
          value={stats.total}
          color="brand"
          visible={visible}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Selesai Ditangani"
          value={stats.byStatus?.selesai || 0}
          color="green"
          visible={visible}
        />
        <StatCard
          icon={<Loader2 className="h-5 w-5" />}
          label="Sedang Diproses"
          value={(stats.byStatus?.ditindaklanjuti || 0) + (stats.byStatus?.diverifikasi || 0)}
          color="blue"
          visible={visible}
        />
      </div>

      {sortedTypes.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-700">Jenis Bencana</h3>
          </div>
          <div className="space-y-3">
            {sortedTypes.map((item, idx) => {
              const pct = stats.total > 0 ? Math.round((item.jumlah / stats.total) * 100) : 0;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm font-medium text-gray-700">
                    {item.name}
                  </span>
                  <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-sm font-bold text-gray-800">
                    {item.jumlah}
                  </span>
                  <span className="w-10 shrink-0 text-right text-xs text-gray-400">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, visible }) {
  const colorMap = {
    brand: { bg: "bg-brand-50", text: "text-brand-600", border: "border-brand-100" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div
      className={`rounded-xl border ${c.border} bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
        {visible ? <AnimatedNumber value={value} duration={1400} /> : 0}
      </p>
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const { data: res } = await api.get("/public/stats/monthly", { params: { year: currentYear } });
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
            api.get("/public/stats/monthly/by-type", { params: { year: currentYear, month: m } })
              .then(({ data: r }) => ({ month: m, byType: r.byType || [], total: r.total || 0 }))
              .catch(() => ({ month: m, byType: [], total: 0 }))
          );
        }
        const results = await Promise.all(typesPromises);
        const typesMap = {};
        results.forEach((r) => { typesMap[r.month] = { byType: r.byType, total: r.total }; });
        setMonthlyTypes(typesMap);
      } catch {
        const currentMonth = new Date().getMonth();
        setData(
          MONTH_LABELS.slice(0, currentMonth + 1).map((m, idx) => ({
            name: m,
            jumlah: 0,
            monthIndex: idx + 1,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

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
        const currentYear = new Date().getFullYear();
        const { data: res } = await api.get("/public/stats/monthly/by-type", {
          params: { year: currentYear, month: monthIndex },
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = payload[0]?.payload;
    if (!entry) return null;
    const monthData = monthlyTypes[entry.monthIndex];
    const types = monthData?.byType || [];
    const total = monthData?.total || entry.jumlah;

    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="mb-1.5 text-xs font-bold text-gray-800">{entry.name}</p>
        {types.length > 0 ? (
          <div className="space-y-1">
            {types.map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-4 text-[11px]">
                <span className="text-gray-600">{t.name}</span>
                <span className="font-semibold text-gray-800">{t.jumlah}</span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-1 mt-1 flex items-center justify-between gap-4 text-[11px]">
              <span className="font-semibold text-gray-700">Total</span>
              <span className="font-bold text-gray-900">{total}</span>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-gray-400">Tidak ada laporan</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-6" style={{ height: 280 }}>
        <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">Tren Laporan per Bulan ({new Date().getFullYear()})</h3>
        {!selectedMonth && (
          <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-semibold text-orange-600">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Klik bar untuk lihat detail bencana
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={28}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(249,115,22,0.08)" }}
          />
          <Bar
            dataKey="jumlah"
            radius={[4, 4, 0, 0]}
            onClick={(entry) => handleBarClick(entry.monthIndex, entry.name)}
            style={{ cursor: "pointer" }}
          >
            {data.map((entry, idx) => {
              const colors = ["#3b82f6", "#f97316"];
              return (
                <Cell
                  key={idx}
                  fill={
                    selectedMonth === entry.monthIndex
                      ? "#ea580c"
                      : entry.jumlah > 0
                      ? colors[idx % 2]
                      : "#e5e7eb"
                  }
                  opacity={
                    selectedMonth === entry.monthIndex
                      ? 1
                      : entry.jumlah > 0
                      ? 0.85
                      : 0.4
                  }
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detail breakdown when a month is clicked */}
      {selectedMonth && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800">
                  Jenis Bencana — {MONTH_LABELS[selectedMonth - 1]}
                </h4>
                <span className="text-xs text-gray-400">
                  Total: <span className="font-semibold text-gray-600">{monthTotal}</span> laporan
                </span>
              </div>
              {monthTypes.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  Tidak ada laporan pada bulan ini.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthTypes.map((item, idx) => {
                    const pct = monthTotal > 0 ? Math.round((item.jumlah / monthTotal) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-700">
                          {item.name}
                        </span>
                        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-orange-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs font-bold text-gray-800">
                          {item.jumlah}
                        </span>
                        <span className="w-10 shrink-0 text-right text-[11px] text-gray-400">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
