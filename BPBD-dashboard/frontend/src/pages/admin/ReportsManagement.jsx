import { useState, useEffect } from 'react';
import { getReports, updateReportStatus } from '../../services/reportService';

const STATUS_OPTIONS = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];
const STATUS_COLOR = {
  baru: 'bg-red-100 text-red-700',
  diverifikasi: 'bg-yellow-100 text-yellow-700',
  ditindaklanjuti: 'bg-blue-100 text-blue-700',
  selesai: 'bg-green-100 text-green-700',
};

export default function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReports = () => {
    setLoading(true);
    getReports(filter ? { status: filter } : {})
      .then(setReports)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadReports(); }, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateReportStatus(id, { status });
      loadReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kelola Laporan Bencana</h1>
      <div className="mb-4 flex gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-full text-sm ${filter === '' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Semua</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded-full text-sm capitalize ${filter === s ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>{s}</button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-gray-500">Memuat data...</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4">Kode</th>
                <th className="py-2 px-4">Pelapor</th>
                <th className="py-2 px-4">Jenis</th>
                <th className="py-2 px-4">Lokasi</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 px-4 font-mono text-xs">{r.tracking_code}</td>
                  <td className="py-2 px-4">{r.reporter_name}</td>
                  <td className="py-2 px-4">{r.disaster_type}</td>
                  <td className="py-2 px-4">{r.address}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLOR[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="py-2 px-4">
                    <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} className="border rounded px-2 py-1 text-xs">
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && <p className="text-sm text-gray-500 p-4">Belum ada laporan.</p>}
        </div>
      )}
    </div>
  );
}