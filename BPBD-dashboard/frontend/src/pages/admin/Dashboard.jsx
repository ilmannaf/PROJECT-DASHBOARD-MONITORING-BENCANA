import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports')
      .then((res) => setReports(res.data))
      .catch((err) => console.error('Gagal ambil data:', err))
      .finally(() => setLoading(false));
  }, []);

  const total = reports.length;
  const baru = reports.filter((r) => r.status === 'baru').length;
  const diverifikasi = reports.filter((r) => r.status === 'diverifikasi').length;
  const selesai = reports.filter((r) => r.status === 'selesai').length;

  if (loading) return <div className="p-6">Memuat data...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Laporan Bencana</h1>
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Laporan</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-sm text-gray-500">Baru</p>
          <p className="text-2xl font-bold text-red-500">{baru}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-sm text-gray-500">Diverifikasi</p>
          <p className="text-2xl font-bold text-yellow-500">{diverifikasi}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4">
          <p className="text-sm text-gray-500">Selesai</p>
          <p className="text-2xl font-bold text-green-500">{selesai}</p>
        </div>
      </div>
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="font-semibold mb-4">Laporan Terbaru</h2>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">Kode</th>
              <th className="py-2">Pelapor</th>
              <th className="py-2">Jenis</th>
              <th className="py-2">Lokasi</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-2">{r.tracking_code}</td>
                <td className="py-2">{r.reporter_name}</td>
                <td className="py-2">{r.disaster_type}</td>
                <td className="py-2">{r.address}</td>
                <td className="py-2 capitalize">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}