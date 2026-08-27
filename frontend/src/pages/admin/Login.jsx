import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import api from "../../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ laporan: 0, kendaraan: 0, posko: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setShowForm(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    api.get('/public/stats')
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, 'admin');
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* KOLOM KIRI — Form Login (45%) */}
      <div className="flex-1 bg-white flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <img
            src="/assets/logo-bpbd.jpg"
            alt="Logo BPBD Kota Semarang"
            className={`login-stagger w-10 h-10 rounded-lg object-cover mb-5 ${showForm ? 'show' : ''}`}
            style={{ transitionDelay: '0s' }}
          />

          <h1 className={`login-stagger text-xl font-extrabold text-gray-900 tracking-tight ${showForm ? 'show' : ''}`}
            style={{ transitionDelay: '0.05s' }}>
            Masuk ke Dashboard
          </h1>
          <p className={`login-stagger text-xs text-gray-500 mt-1 mb-6 ${showForm ? 'show' : ''}`}
            style={{ transitionDelay: '0.1s' }}>
            BPBD Kota Semarang
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`login-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="Masukkan email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300 accent-brand-600"
                />
                Ingat saya
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : "Masuk"}
            </button>
          </form>

          <a
            href="/"
            className="block text-center text-xs text-gray-500 hover:text-brand-600 font-medium mt-5"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>

      {/* KOLOM KANAN — Panel Branding (55%) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gray-900 items-center justify-center">
        <div className="blob bg-white" style={{ width: 300, height: 300, top: -60, right: -60 }}></div>
        <div className="blob bg-orange-300" style={{ width: 200, height: 200, bottom: -60, left: -30 }}></div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-14 py-14 w-full max-w-lg">
          <img
            src="/assets/logo-bpbd.jpg"
            alt="Logo BPBD Kota Semarang"
            className="w-12 h-12 rounded-xl object-cover mb-8"
          />

          <h1 className="text-2xl font-extrabold leading-tight text-white mb-3">
            Selamat datang kembali
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
            Pantau, kelola, dan respon kejadian bencana secara terpadu.
          </p>

          {/* Preview statistik */}
          <div className="mt-10 bg-white rounded-xl shadow-lg p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-gray-900">Ringkasan Dasbor</p>
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-lg font-extrabold text-gray-900">{stats.laporan}</p>
                <p className="text-[9px] text-gray-500 leading-tight">Laporan</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-lg font-extrabold text-gray-900">{stats.kendaraan}</p>
                <p className="text-[9px] text-gray-500 leading-tight">Kendaraan</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-lg font-extrabold text-gray-900">{stats.posko}</p>
                <p className="text-[9px] text-gray-500 leading-tight">Posko</p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-1.5 h-14">
              {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t ${i === 5 ? "bg-brand-600" : "bg-gray-100"}`}
                ></div>
              ))}
            </div>
            <p className="text-[9px] text-gray-400 mt-2">Tren 7 hari</p>
          </div>
        </div>
      </div>
    </div>
  );
}