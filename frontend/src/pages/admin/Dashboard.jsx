import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { getReportStats } from '../../services/reportService';
import { getSocket } from '../../services/socket';
import { showToast } from '../../components/Toast';
import AnimatedNumber from '../../components/AnimatedNumber';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const STATUS_LABELS = {
  baru: 'Baru',
  diverifikasi: 'Diverifikasi',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
};

const STATUS_COLORS = {
  baru: '#ef4444',
  diverifikasi: '#eab308',
  ditindaklanjuti: '#3b82f6',
  selesai: '#22c55e',
};

const STATUS_BG = {
  baru: 'from-red-500 to-rose-600',
  diverifikasi: 'from-amber-400 to-yellow-500',
  ditindaklanjuti: 'from-blue-500 to-indigo-600',
  selesai: 'from-emerald-500 to-green-600',
};

export default function Dashboard() {
  const [total, setTotal] = useState(0);
  const [byStatus, setByStatus] = useState({});
  const [byType, setByType] = useState([]);
  const [recent, setRecent] = useState([]);
  const [disasterRecords, setDisasterRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const load = () => {
      Promise.all([
        getReportStats().catch(() => ({ total: 0, byStatus: {}, byType: [], recent: [] })),
        api.get('/disaster-records').catch(() => ({ data: [] })),
      ])
        .then(([stats, res2]) => {
          setTotal(stats.total);
          setByStatus(stats.byStatus);
          setByType(stats.byType);
          setRecent(stats.recent);
          setDisasterRecords(res2.data);
        })
        .catch((err) => console.error('Gagal ambil data:', err))
        .finally(() => {
          setLoading(false);
          setTimeout(() => setShowContent(true), 80);
        });
    };
    load();

    const socket = getSocket();
    const onNewReport = (data) => {
      showToast(`Laporan baru: ${data.disaster_type} di ${data.address || '-'}`, 'info');
      load();
    };
    const onStatusUpdate = (data) => {
      showToast(`Laporan ${data.tracking_code} → ${data.status}`, 'info');
      load();
    };
    socket.on('new_report', onNewReport);
    socket.on('report_status_updated', onStatusUpdate);
    return () => {
      socket.off('new_report', onNewReport);
      socket.off('report_status_updated', onStatusUpdate);
    };
  }, []);

  const countByStatus = (s) => byStatus[s] || 0;

  const statCards = [
    { label: 'Total Laporan', value: total, icon: 'doc', color: 'text-gray-900', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Baru', value: countByStatus('baru'), icon: 'bell', color: 'text-red-600', bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Ditindaklanjuti', value: countByStatus('ditindaklanjuti'), icon: 'wrench', color: 'text-blue-600', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { label: 'Selesai', value: countByStatus('selesai'), icon: 'check', color: 'text-green-600', bg: 'bg-green-50', iconColor: 'text-green-600' },
  ];

  const pieData = Object.keys(STATUS_LABELS)
    .map((status) => ({
      name: STATUS_LABELS[status],
      value: countByStatus(status),
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  const kecamatanCount = new Set(disasterRecords.map((d) => d.kecamatan)).size;
  const totalKorban = disasterRecords.reduce((sum, r) => {
    return sum + (Number(r.korban_ps) || 0) + (Number(r.korban_md) || 0) + (Number(r.korban_lb) || 0) + (Number(r.korban_lr) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Memuat data...</p>
      </div>
    );
  }

  const icons = {
    doc: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bell: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    wrench: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L2.74 5.39a2.12 2.12 0 013-3l5.1 5.1m0 0l3.16-3.16m-3.16 3.16l3.16 3.16m-3.16-3.16l-3.16 3.16" />
      </svg>
    ),
    check: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">Dashboard</h1>
          <p className="text-sm text-gray-500">Ringkasan aktivitas pelaporan dan pendataan bencana</p>
        </div>
        <a
          href="/lacak"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary flex items-center gap-2 px-5 py-3 shadow-lg shadow-brand-500/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Lacak Status Laporan
        </a>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((c, i) => (
          <div
            key={c.label}
            className={`stat-card bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all ${showContent ? 'show' : ''}`}
            style={{ transitionDelay: `${i * 0.06}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.iconColor} flex items-center justify-center`}>
                {icons[c.icon]}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{c.label}</span>
            </div>
            <p className={`text-2xl font-extrabold ${c.color}`}>
              <AnimatedNumber value={c.value} />
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`stat-card bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Pendataan</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={disasterRecords.length} /></p>
          <p className="text-[11px] text-gray-500 mt-0.5">Total data bencana</p>
        </div>
        <div className={`stat-card bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.36s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Kecamatan</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={kecamatanCount} /></p>
          <p className="text-[11px] text-gray-500 mt-0.5">Wilayah terdampak</p>
        </div>
        <div className={`stat-card bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.42s' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Korban</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={totalKorban} /></p>
          <p className="text-[11px] text-gray-500 mt-0.5">Total korban tercatat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className={`chart-enter bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${showContent ? 'show' : ''}`}>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">
            Distribusi Status
          </h2>
          {pieData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Legend verticalAlign="bottom" height={28} iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={`chart-enter lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.08s' }}>
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">
            Laporan per Jenis Bencana
          </h2>
          {byType.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                <Bar dataKey="jumlah" fill="#e65100" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={`chart-enter bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.16s' }}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 text-sm">
            Laporan Terbaru
          </h2>
          <span className="text-[11px] text-gray-400">{total} laporan</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2.5 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Kode</th>
                <th className="py-2.5 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Pelapor</th>
                <th className="py-2.5 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Jenis</th>
                <th className="py-2.5 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Lokasi</th>
                <th className="py-2.5 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 px-5 font-mono text-xs text-gray-500">{r.tracking_code}</td>
                  <td className="py-2.5 px-5 font-medium text-gray-900">{r.reporter_name}</td>
                  <td className="py-2.5 px-5 text-gray-600">{r.disaster_type}</td>
                  <td className="py-2.5 px-5 text-gray-500 truncate max-w-[200px]">{r.address}</td>
                  <td className="py-2.5 px-5 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r ${STATUS_BG[r.status]} text-white`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 && <p className="text-sm text-gray-500 py-8 text-center">Belum ada laporan.</p>}
        </div>
      </div>
    </div>
  );
}
