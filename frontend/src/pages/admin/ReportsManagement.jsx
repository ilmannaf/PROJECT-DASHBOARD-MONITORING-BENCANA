import { useState, useEffect, useRef, useCallback } from 'react';
import { getReports, updateReportStatus, deleteReport, exportReportsExcel, getReportStats } from '../../services/reportService';
import { getSocket } from '../../services/socket';
import { showToast } from '../../components/Toast';

const STATUS_OPTIONS = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];
const DISASTER_TYPES = ['Banjir', 'Longsor', 'Kebakaran', 'Angin Puting Beliung', 'Gempa Bumi', 'Lainnya'];
const STATUS_COLOR = {
  baru: 'from-red-500 to-rose-600',
  diverifikasi: 'from-amber-400 to-yellow-500',
  ditindaklanjuti: 'from-blue-500 to-indigo-600',
  selesai: 'from-emerald-500 to-green-600',
};

const STATUS_ICON = {
  baru: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  diverifikasi: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  ditindaklanjuti: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  selesai: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function ReportsManagement() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');
  const [disasterType, setDisasterType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  const loadReports = useCallback((p = page) => {
    setLoading(true);
    const params = { page: p, limit: 50 };
    if (filter) params.status = filter;
    if (disasterType) params.disaster_type = disasterType;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    if (debouncedSearch) params.search = debouncedSearch;
    Promise.all([
      getReports(params),
      getReportStats().catch(() => ({ total: 0, byStatus: {} })),
    ])
      .then(([reportsRes, stats]) => {
        setReports(reportsRes.data);
        setTotal(reportsRes.total);
        setTotalPages(reportsRes.totalPages);
        setStatusCounts(stats.byStatus || {});
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [filter, disasterType, dateFrom, dateTo, debouncedSearch, page]);

  useEffect(() => { setPage(1); }, [filter, disasterType, dateFrom, dateTo, debouncedSearch]);
  useEffect(() => { loadReports(page); }, [page, filter, disasterType, dateFrom, dateTo, debouncedSearch]);

  useEffect(() => {
    const socket = getSocket();
    const onNewReport = (data) => {
      showToast(`Laporan baru: ${data.disaster_type} di ${data.address || '-'}`, 'info');
      loadReports();
    };
    const onStatusUpdate = (data) => {
      showToast(`Laporan ${data.tracking_code} → ${data.status}`, 'info');
      loadReports();
    };
    const onReportDeleted = () => { loadReports(); };
    socket.on('new_report', onNewReport);
    socket.on('report_status_updated', onStatusUpdate);
    socket.on('report_deleted', onReportDeleted);
    return () => {
      socket.off('new_report', onNewReport);
      socket.off('report_status_updated', onStatusUpdate);
      socket.off('report_deleted', onReportDeleted);
    };
  }, [loadReports]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateReportStatus(id, { status });
      loadReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal update status');
    }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Hapus laporan ${code}? Tindakan tidak bisa dibatalkan.`)) return;
    try {
      await deleteReport(id);
      loadReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal hapus laporan');
    }
  };

  const resetFilters = () => {
    setFilter('');
    setDisasterType('');
    setDateFrom('');
    setDateTo('');
    setSearchTerm('');
    setPage(1);
  };

  const hasActiveFilters = filter || disasterType || dateFrom || dateTo || searchTerm;
  const exportParams = {};
  if (filter) exportParams.status = filter;
  if (disasterType) exportParams.disaster_type = disasterType;
  if (dateFrom) exportParams.date_from = dateFrom;
  if (dateTo) exportParams.date_to = dateTo;
  if (debouncedSearch) exportParams.search = debouncedSearch;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kelola Laporan Bencana</h1>
              <p className="text-gray-500 text-sm mt-0.5">Verifikasi dan tindak lanjuti laporan dari masyarakat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <button
          onClick={() => setFilter('')}
          className={`rounded-2xl p-5 border transition-all ${filter === '' ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white border-gray-900 shadow-lg shadow-gray-900/25' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
        >
          <p className="text-sm font-semibold mb-1">Semua</p>
          <p className="text-2xl font-extrabold">{total}</p>
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-2xl p-5 border transition-all ${filter === s ? `bg-gradient-to-br ${STATUS_COLOR[s]} text-white border-transparent shadow-lg` : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {filter === s ? STATUS_ICON[s] : <span className="text-gray-400">{STATUS_ICON[s]}</span>}
              <p className="text-sm font-semibold capitalize">{s}</p>
            </div>
            <p className="text-2xl font-extrabold">{statusCounts[s] || '—'}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Cari kode, nama, jenis, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
              />
            </div>
            <select
              value={disasterType}
              onChange={(e) => setDisasterType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white text-gray-700 text-sm"
            >
              <option value="">Semua Jenis</option>
              {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <button
              onClick={() => exportReportsExcel(exportParams)}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Dari:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-500">Sampai:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              />
            </div>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition">
                Reset Semua
              </button>
            )}
            <span className="text-xs text-gray-400 ml-auto">{total} laporan ditemukan</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kode Tracking</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Pelapor</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Jenis Bencana</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Lokasi</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Ubah Status</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reports.length > 0 ? (
                    reports.map((r) => (
                      <tr key={r.id} className="hover:bg-orange-50/40 transition-colors group">
                        <td className="py-4 px-6">
                          <span className="font-mono text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                            {r.tracking_code}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold">
                              {r.reporter_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{r.reporter_name}</p>
                              {r.reporter_phone && (
                                <p className="text-xs text-gray-500">{r.reporter_phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            {r.disaster_type}
                          </span>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          <p className="text-sm text-gray-600 line-clamp-2">{r.address}</p>
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {r.latitude && r.longitude ? <span className="text-[11px] bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">📍 {parseFloat(r.latitude).toFixed(3)}, {parseFloat(r.longitude).toFixed(3)}</span> : <span className="text-[11px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">tanpa koordinat</span>}
                            {(r.photos?.length > 0 || r.photo_url) && <span className="text-[11px] bg-gray-100 rounded-full px-2 py-0.5">📷 {(r.photos || [r.photo_url]).filter(Boolean).length}/5</span>}
                          </div>
                          {(r.photos?.length > 0 || r.photo_url) && (
                            <div className="flex gap-1 mt-2">
                              {(r.photos || [r.photo_url]).filter(Boolean).slice(0,5).map((url, idx) => (
                                <img key={idx} src={`${import.meta.env.VITE_API_URL.replace('/api','')}${url}`} alt="" className="w-10 h-10 object-cover rounded border" />
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${STATUS_COLOR[r.status]} text-white shadow-sm`}>
                            {STATUS_ICON[r.status]}
                            <span className="capitalize">{r.status}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <select
                            value={r.status}
                            onChange={(e) => handleStatusChange(r.id, e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white capitalize cursor-pointer"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s} className="capitalize">{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleDelete(r.id, r.tracking_code)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                            title="Hapus laporan"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-700">
                              {hasActiveFilters ? 'Tidak ada hasil' : 'Belum ada laporan'}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {hasActiveFilters ? 'Coba ubah filter atau kata kunci' : 'Laporan dari masyarakat akan muncul di sini'}
                            </p>
                          </div>
                          {hasActiveFilters && (
                            <button onClick={resetFilters} className="text-sm font-semibold text-brand-600 hover:text-brand-700">Reset Filter</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    ← Sebelumnya
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg transition ${p === page ? 'bg-brand-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Berikutnya →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
