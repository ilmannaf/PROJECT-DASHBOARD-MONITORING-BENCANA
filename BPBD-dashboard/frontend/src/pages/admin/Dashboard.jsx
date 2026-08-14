import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
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

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports')
      .then((res) => setReports(res.data))
      .catch((err) => console.error('Gagal ambil data:', err))
      .finally(() => setLoading(false));
  }, []);

  const total = reports.length;
  const countByStatus = (status) => reports.filter((r) => r.status === status).length;

  const statCards = [
    { label: 'Total Laporan', value: total, color: 'text-gray-900', bg: 'bg-white' },
    { label: 'Baru', value: countByStatus('baru'), color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Diverifikasi', value: countByStatus('diverifikasi'), color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Selesai', value: countByStatus('selesai'), color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const pieData = Object.keys(STATUS_LABELS)
    .map((status) => ({
      name: STATUS_LABELS[status],
      value: countByStatus(status),
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  const disasterCounts = reports.reduce((acc, r) => {
    acc[r.disaster_type] = (acc[r.disaster_type] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(disasterCounts).map(([name, jumlah]) => ({ name, jumlah }));

  if (loading) return <div className="p-6 text-sm text-gray-500">Memuat data...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Dashboard Laporan Bencana</h1>
          <p className="text-sm text-gray-500">Ringkasan aktivitas pelaporan bencana terkini</p>
        </div>
        <a
          href="/lacak"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          Lacak Status Laporan
        </a>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((c) => (
          <div key={c.label} className={`${c.bg} border border-gray-100 shadow-sm rounded-xl p-4`}>
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-3xl font-extrabold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1 bg-white border border-gray-100 shadow-sm rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Distribusi Status</h2>
          {pieData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="col-span-2 bg-white border border-gray-100 shadow-sm rounded-xl p-4">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm">Laporan per Jenis Bencana</h2>
          {barData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">Belum ada data</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="jumlah" fill="#ff6b00" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4">
        <h2 className="font-semibold text-gray-800 mb-4 text-sm">Laporan Terbaru</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b text-gray-500 text-xs uppercase">
              <th className="py-2">Kode</th>
              <th className="py-2">Pelapor</th>
              <th className="py-2">Jenis</th>
              <th className="py-2">Lokasi</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.slice(0, 8).map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 font-mono text-xs">{r.tracking_code}</td>
                <td className="py-2">{r.reporter_name}</td>
                <td className="py-2">{r.disaster_type}</td>
                <td className="py-2">{r.address}</td>
                <td className="py-2">
                  <span
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${STATUS_COLORS[r.status]}20`,
                      color: STATUS_COLORS[r.status],
                    }}
                  >
                    {STATUS_LABELS[r.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reports.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">Belum ada laporan.</p>}
      </div>
    </div>
  );
}