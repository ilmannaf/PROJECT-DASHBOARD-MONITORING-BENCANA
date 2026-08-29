import { useState, useEffect } from 'react';
import { getLoginHistory } from '../../services/authService';
import { showToast } from '../../components/Toast';
import { SkeletonPulse } from '../../components/Skeleton';
import { CheckCircle, XCircle } from 'lucide-react';

export default function LoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getLoginHistory({ page, limit: 20 });
        setHistory(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      } catch {
        showToast('Gagal mengambil history login', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [page]);

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  const truncateUA = (ua) => {
    if (!ua || ua === '-') return '-';
    return ua.length > 60 ? ua.slice(0, 60) + '...' : ua;
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-1">History Login</h1>
          <p className="text-sm text-gray-500">Riwayat login admin dan petugas</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonPulse key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">#</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">User</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Email</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Role</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Waktu Login</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Status</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">IP Address</th>
                    <th className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 max-w-xs">User Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-sm text-gray-400">Belum ada riwayat login</td>
                    </tr>
                  ) : (
                    history.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-5 text-xs text-gray-400">{(page - 1) * 20 + idx + 1}</td>
                        <td className="py-3 px-5 font-medium text-gray-900">{row.name || '-'}</td>
                        <td className="py-3 px-5 text-gray-600">{row.email || '-'}</td>
                        <td className="py-3 px-5">
                          <span className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {row.role}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-gray-600 text-xs whitespace-nowrap">
                          {formatDateTime(row.login_time)}
                        </td>
                        <td className="py-3 px-5">
                          {row.success ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle className="w-3.5 h-3.5" /> Berhasil
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                              <XCircle className="w-3.5 h-3.5" /> Gagal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-5 text-xs text-gray-500 font-mono">{row.ip_address || '-'}</td>
                        <td className="py-3 px-5 text-xs text-gray-500 truncate" title={row.user_agent}>
                          {truncateUA(row.user_agent)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {total > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Total <span className="font-semibold text-gray-600">{total}</span> record
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Sebelumnya
                  </button>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                          page === pageNum
                            ? 'bg-brand-600 text-white border-brand-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Berikutnya
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