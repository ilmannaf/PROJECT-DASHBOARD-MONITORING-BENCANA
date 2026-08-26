import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, isAuthenticated, getCurrentUser, logout } from '../../services/authService';
import { getMyReports, trackReport } from '../../services/reportService';
import { getSocket } from '../../services/socket';
import { showToast } from '../../components/Toast';

const STATUS_COLOR = {
  baru: 'bg-red-100 text-red-700',
  diverifikasi: 'bg-yellow-100 text-yellow-700',
  ditindaklanjuti: 'bg-blue-100 text-blue-700',
  selesai: 'bg-green-100 text-green-700',
};

export default function PublicDashboard() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();

  const [refreshing, setRefreshing] = useState(false);
  const loadReports = async () => {
    try {
      setRefreshing(true);
      let merged = [];
      // 1. laporan ter-link ke akun pelapor (via reporter_user_id)
      if (isAuthenticated()) {
        try {
          const data = await getMyReports();
          if (Array.isArray(data)) merged = [...data];
        } catch (e) {
          if (e.response?.status === 401 || e.response?.status === 403) {
            setError('Sesi habis, silakan login ulang');
            setTab('login');
          }
          console.error(e);
        }
      }
      // 2. laporan anonim dari localStorage (tracking codes) -> fetch via /track
      try {
        const codes = JSON.parse(localStorage.getItem('myReportCodes') || '[]');
        const anonToFetch = codes.filter(c => !merged.some(r => r.tracking_code === c));
        if (anonToFetch.length > 0) {
          const fetched = await Promise.all(
            anonToFetch.map(async (code) => {
              try {
                const { report } = await trackReport(code);
                return report;
              } catch { return null; }
            })
          );
          merged = [...merged, ...fetched.filter(Boolean)];
          // sort by created_at desc
          merged.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
        }
      } catch {}
      setReports(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      setTab('dashboard');
    }
  }, []);

  // load whenever tab becomes dashboard + polling + focus refresh + socket
  useEffect(() => {
    if (tab === 'dashboard' && isAuthenticated()) {
      loadReports();
      const interval = setInterval(loadReports, 15000);
      const onFocus = () => loadReports();
      const onVisibility = () => { if (document.visibilityState === 'visible') loadReports(); };
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);

      const socket = getSocket();
      const onStatusUpdate = (data) => {
        showToast(`Laporan ${data.tracking_code} status berubah menjadi "${data.status}"`, 'success');
        loadReports();
      };
      socket.on('report_status_updated', onStatusUpdate);

      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibility);
        socket.off('report_status_updated', onStatusUpdate);
      };
    }
  }, [tab]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData(e.target);
      await login(form.get('email'), form.get('password'), 'public');
      setTab('dashboard');
      loadReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData(e.target);
      await register({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      });
      await login(form.get('email'), form.get('password'), 'public');
      setTab('dashboard');
      loadReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {tab === 'dashboard' ? (
        <DashboardView
          reports={reports}
          selectedReport={selectedReport}
          setSelectedReport={setSelectedReport}
          navigate={navigate}
          onRefresh={loadReports}
          refreshing={refreshing}
        />
      ) : (
        <AuthView
          tab={tab}
          setTab={setTab}
          loading={loading}
          error={error}
          onLogin={handleLogin}
          onRegister={handleRegister}
          navigate={navigate}
        />
      )}
    </div>
  );
}

function DashboardView({ reports, selectedReport, setSelectedReport, navigate, onRefresh, refreshing }) {
  const user = getCurrentUser('public');

  const total = reports.length;
  const baru = reports.filter((r) => r.status === 'baru').length;
  const diverifikasi = reports.filter((r) => r.status === 'diverifikasi').length;
  const selesai = reports.filter((r) => r.status === 'selesai').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD Kota Semarang"
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div>
              <h1 className="font-bold text-gray-900">Dashboard Public</h1>
              <p className="text-xs text-gray-500">Lapor & lacak bencana</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500">Pelapor</p>
            </div>
            <button
              onClick={() => {
                logout('public');
                window.location.reload();
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-2"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Selamat datang, {user?.name}!</h2>
          <p className="text-gray-600">Kelola dan lacak laporan bencana Anda di sini.</p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Laporan</span>
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/25 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Baru</span>
            </div>
            <p className="text-3xl font-extrabold text-red-600">{baru}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Diverifikasi</span>
            </div>
            <p className="text-3xl font-extrabold text-yellow-600">{diverifikasi}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Selesai</span>
            </div>
            <p className="text-3xl font-extrabold text-green-600">{selesai}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              Laporan Saya
            </h3>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-full px-3 py-1.5 transition disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {refreshing ? 'Memuat...' : 'Refresh'}
            </button>
          </div>
            {reports.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-1">Belum ada laporan</p>
                <p className="text-sm text-gray-500 mb-4">Laporkan kejadian bencana untuk memulai</p>
                <button
                  onClick={() => navigate('/lapor')}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/25 transition-all"
                >
                  + Buat Laporan Baru
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kode</th>
                      <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Jenis</th>
                      <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                      <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</th>
                      <th className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-orange-50/40 transition-colors">
                        <td className="py-3 px-6 font-mono text-xs text-gray-500">{r.tracking_code}</td>
                        <td className="py-3 px-6 font-medium text-gray-900">{r.disaster_type}</td>
                        <td className="py-3 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[r.status]}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-gray-500 text-sm">
                          {new Date(r.created_at).toLocaleDateString('id-ID')}
                          {(r.photos?.length > 0 || r.photo_url) && <span className="ml-2 text-[11px] bg-gray-100 rounded-full px-2 py-0.5">📷 {(r.photos || [r.photo_url]).filter(Boolean).length}</span>}
                          {r.latitude && r.longitude ? <span className="ml-1 text-[11px] bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5">📍</span> : <span className="ml-1 text-[11px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5">tanpa titik</span>}
                        </td>
                        <td className="py-3 px-6">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="text-brand-600 hover:text-brand-700 text-sm font-semibold transition"
                          >
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900">Info Darurat</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Jika terjadi bencana darurat, segera laporkan via aplikasi atau hubungi call center BPBD.
              </p>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4">
                <p className="text-xs text-orange-700 font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Emergency Call Center:
                </p>
                <p className="text-xl font-bold text-orange-600">112 / 0812-3456-7890</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/lapor')}
              className="w-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-4 py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Laporkan Bencana
            </button>
            
            <button
              onClick={() => navigate('/lacak')}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-semibold border-2 border-gray-200 hover:border-brand-300 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Lacak Status Laporan
            </button>
          </div>
        </div>
      </main>

      {selectedReport && (
        <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </div>
  );
}

const PUBLIC_BADGE = (
  <span className="inline-flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
    Portal Publik
  </span>
);

const AUTH_INPUT_CLASS =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition";

function AuthView({ tab, setTab, loading, error, onLogin, onRegister, navigate }) {
  const [showPassword, setShowPassword] = useState(false);

  const renderPasswordInput = (minLength, placeholder) => (
    <div className="relative">
      <input
        name="password"
        type={showPassword ? "text" : "password"}
        required
        minLength={minLength}
        className={`${AUTH_INPUT_CLASS} pr-11`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
      >
        {showPassword ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* KOLOM KIRI — Form Login Publik (45%) */}
      <div className="flex-1 bg-white flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD Kota Semarang"
              className="h-14 w-14 rounded-xl object-cover shadow-lg shadow-brand-500/30"
            />
            {PUBLIC_BADGE}
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {tab === 'login' ? 'Masuk ke Akun Publik' : 'Daftar Akun Baru'}
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">
            BPBD Kota Semarang - Portal Pelaporan Masyarakat
          </p>

          <div className="flex gap-2 mb-6 border-b pb-2">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-semibold transition ${
                tab === 'login'
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-sm font-semibold transition ${
                tab === 'register'
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Registrasi
            </button>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={onLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={AUTH_INPUT_CLASS}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                {renderPasswordInput(6, 'Masukkan password')}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-bold transition disabled:opacity-50 shadow-md shadow-brand-500/20"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
              <p className="text-center text-xs text-gray-500">
                Belum punya akun?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-brand-600 font-semibold">
                  Daftar sekarang
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={onRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  className={AUTH_INPUT_CLASS}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className={AUTH_INPUT_CLASS}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                {renderPasswordInput(6, 'Minimal 6 karakter')}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-bold transition disabled:opacity-50 shadow-md shadow-brand-500/20"
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
              <p className="text-center text-xs text-gray-500">
                Sudah punya akun?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-brand-600 font-semibold">
                  Masuk sekarang
                </button>
              </p>
            </form>
          )}

          {/* Penanda pembeda: akses admin terpisah */}
          <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/60 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Petugas / Admin BPBD?</p>
              <p className="text-xs text-gray-500 mt-0.5">Gunakan portal login admin terpisah.</p>
            </div>
            <button
              onClick={() => navigate('/admin/login')}
              className="shrink-0 text-xs font-bold text-sky-700 bg-white border border-sky-300 hover:bg-sky-100 rounded-lg px-3 py-2 transition"
            >
              Login Admin →
            </button>
          </div>

          <a
            href="/"
            className="block text-center text-sm text-gray-500 hover:text-brand-600 font-medium mt-6"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>

      {/* KOLOM KANAN — Panel Branding Publik (55%) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-sky-900 via-sky-700 to-brand-700 items-center justify-center">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/10"></div>
        <div className="absolute top-1/3 left-10 w-40 h-40 rounded-full bg-yellow-300/20 blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 py-16 w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-10">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD Kota Semarang"
              className="h-16 w-16 rounded-2xl object-cover border border-white/20"
            />
            {PUBLIC_BADGE}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-white mb-5 max-w-lg">
            Laporkan & Pantau Bencana di Wilayah Anda
          </h1>
          <p className="text-lg text-orange-100 leading-relaxed max-w-md">
            Warga Kota Semarang dapat melaporkan kejadian bencana dan memantau
            penanganannya secara real-time melalui portal publik BPBD.
          </p>

          {/* Preview alur pelaporan */}
          <div className="mt-14 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-gray-900">Alur Pelaporan</p>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                24/7
              </span>
            </div>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-brand-700 text-sm font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Lapor Kejadian</p>
                  <p className="text-xs text-gray-500 mt-0.5">Isi form dengan detail lengkap + foto & lokasi GPS.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 text-sm font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Diverifikasi BPBD</p>
                  <p className="text-xs text-gray-500 mt-0.5">Petugas memvalidasi dan memprioritaskan laporan.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">Pantau Real-time</p>
                  <p className="text-xs text-gray-500 mt-0.5">Lacak status penanganan lewat kode laporan unik.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/20 pt-6">
            <p className="text-sm text-orange-100">
              Petugas BPBD? Silakan masuk lewat portal internal.
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="shrink-0 bg-white text-sky-800 hover:bg-sky-50 rounded-lg px-4 py-2 text-sm font-semibold shadow-lg transition"
            >
              Login Admin →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportModal({ report, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold">Detail Laporan</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500">Kode Laporan</p>
              <p className="font-mono font-bold text-gray-900">{report.tracking_code}</p>
            </div>
            <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">
              {report.status}
            </span>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <div>
              <p className="text-gray-400 text-xs">Jenis Bencana</p>
              <p className="font-medium">{report.disaster_type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Deskripsi</p>
              <p className="text-gray-700">{report.description || '-'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Lokasi</p>
              <p className="text-gray-700">{report.address}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Dilaporkan</p>
              <p className="text-gray-700">
                {new Date(report.created_at).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {(report.photos?.length > 0 || report.photo_url) && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-1">Foto ({(report.photos || [report.photo_url]).length}/{5})</p>
              <div className="grid grid-cols-2 gap-2">
                {(report.photos || [report.photo_url]).filter(Boolean).slice(0,5).map((url, idx) => (
                  <img
                    key={idx}
                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${url}`}
                    alt={`Bencana ${idx+1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="bg-gray-50 p-4 text-center">
          <button
            onClick={() => {
              onClose();
              window.location.href = `/lacak?code=${report.tracking_code}`;
            }}
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Lacak Laporan Ini
          </button>
        </div>
      </div>
    </div>
  );
}
