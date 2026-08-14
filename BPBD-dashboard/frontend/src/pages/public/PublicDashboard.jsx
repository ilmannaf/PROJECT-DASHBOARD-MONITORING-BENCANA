import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, isAuthenticated } from '../../services/authService';
import { getReports } from '../../services/reportService';

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

  const loadReports = async () => {
    try {
      const data = await getReports();
      const user = JSON.parse(localStorage.getItem('user'));
      const myReports = data.filter(r => r.reporter_name === user?.name);
      setReports(myReports);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      setTab('dashboard');
      loadReports();
    }
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData(e.target);
      await login(form.get('email'), form.get('password'));
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
      await login(form.get('email'), form.get('password'));
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
        />
      ) : (
        <AuthView
          tab={tab}
          setTab={setTab}
          loading={loading}
          error={error}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}

function DashboardView({ reports, selectedReport, setSelectedReport, navigate }) {
  const user = JSON.parse(localStorage.getItem('user'));

  const total = reports.length;
  const baru = reports.filter((r) => r.status === 'baru').length;
  const diverifikasi = reports.filter((r) => r.status === 'diverifikasi').length;
  const selesai = reports.filter((r) => r.status === 'selesai').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-sm">
              BPBD
            </div>
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
                localStorage.removeItem('token');
                localStorage.removeItem('user');
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Selamat datang, {user?.name}!</h2>
          <p className="text-gray-500">Kelola dan lacak laporan bencana Anda di sini.</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Laporan" value={total} color="text-gray-900" />
          <StatCard label="Baru" value={baru} color="text-red-600" bg="bg-red-50" />
          <StatCard label="Diverifikasi" value={diverifikasi} color="text-yellow-600" bg="bg-yellow-50" />
          <StatCard label="Selesai" value={selesai} color="text-green-600" bg="bg-green-50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Laporan Saya</h3>
            {reports.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-500">Belum ada laporan.</p>
                <button
                  onClick={() => navigate('/lapor')}
                  className="mt-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Buat Laporan Baru
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4">Kode</th>
                      <th className="py-3 px-4">Jenis</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Tanggal</th>
                      <th className="py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-3 px-4 font-mono text-xs">{r.tracking_code}</td>
                        <td className="py-3 px-4">{r.disaster_type}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLOR[r.status]}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(r.created_at).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="text-brand-600 hover:text-brand-700 text-sm font-semibold"
                          >
                            Lihat
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">Info Bencana</h3>
              <p className="text-sm text-gray-500 mb-3">
                Jika terjadi bencana darurat, segera laporkan via aplikasi ini atau hubungi call center BPBD.
              </p>
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                <p className="text-xs text-orange-700 font-semibold mb-1">Emergency Call:</p>
                <p className="text-lg font-bold text-orange-600">112 / 0812-3456-7890</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/lapor')}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-xl font-semibold shadow-sm transition"
            >
              + Laporkan Bencana
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

function StatCard({ label, value, color, bg = 'bg-white' }) {
  return (
    <div className={`${bg} border border-gray-100 shadow-sm rounded-xl p-4`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  );
}

function AuthView({ tab, setTab, loading, error, onLogin, onRegister }) {
  const [showPassword, setShowPassword] = useState(false);

  const renderPasswordInput = (minLength, placeholder) => (
    <div className="relative">
      <input
        name="password"
        type={showPassword ? "text" : "password"}
        required
        minLength={minLength}
        className="w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-2xl mb-3 backdrop-blur-sm">
            BPBD
          </div>
          <h2 className="text-xl font-bold">
            {tab === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-sm opacity-90 mt-1">
            {tab === 'login' ? 'Pelapor BPBD Kota Semarang' : 'Daftarkan diri untuk melapor'}
          </p>
        </div>

        <div className="p-6">
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
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
               <div>
                 <label className="block text-sm font-medium mb-1">Password</label>
                 {renderPasswordInput(6, '••••••••')}
               </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                Belum punya akun?{' '}
                <button type="button" onClick={() => setTab('register')} className="text-brand-600 font-semibold">
                  Daftar sekarang
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={onRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="email@example.com"
                />
              </div>
<div>
                 <label className="block text-sm font-medium mb-1">Password</label>
                 {renderPasswordInput(6, 'Minimal 6 karakter')}
               </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                Sudah punya akun?{' '}
                <button type="button" onClick={() => setTab('login')} className="text-brand-600 font-semibold">
                  Masuk sekarang
                </button>
              </p>
            </form>
          )}
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

          {report.photo_url && (
            <div className="mb-4">
              <p className="text-gray-400 text-xs mb-1">Foto</p>
              <img
                src={`http://localhost:5000${report.photo_url}`}
                alt="Bencana"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
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
