import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleGoogleLogin = () => {
    setError("Login melalui Google belum dikonfigurasi di sistem ini. Silakan gunakan email & password.");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* KOLOM KIRI — Form Login (45%) */}
      <div className="flex-1 bg-white flex items-center justify-center px-4 sm:px-8 py-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-sm mb-6 shadow-lg shadow-brand-500/30">
            BPBD
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Masuk ke Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 mb-8">
            BPBD Kota Semarang - Sistem Manajemen Kebencanaan
          </p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                placeholder="Masukkan email Anda"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-11 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-brand-600"
                />
                Ingat saya
              </label>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Lupa password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-bold transition disabled:opacity-50 shadow-md shadow-brand-500/20"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">atau</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Login Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Masuk dengan Google
          </button>

          <a
            href="/"
            className="block text-center text-sm text-gray-500 hover:text-brand-600 font-medium mt-6"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>

      {/* KOLOM KANAN — Panel Branding (55%) */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-brand-600 items-center justify-center">
        {/* Dekorasi lingkaran transparan */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/10"></div>
        <div className="absolute top-1/3 left-10 w-40 h-40 rounded-full bg-yellow-300/20 blur-2xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 py-16 w-full max-w-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center font-extrabold text-lg mb-10 border border-white/20 text-white">
            BPBD
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-white mb-5 max-w-lg">
            Selamat datang kembali di Sistem BPBD Kota Semarang
          </h1>
          <p className="text-lg text-orange-100 leading-relaxed max-w-md">
            Pantau, kelola, dan respon kejadian bencana secara terpadu — dari
            laporan masuk hingga penanganan di lapangan.
          </p>

          {/* Preview statistik */}
          <div className="mt-14 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-gray-900">Ringkasan Dasbor</p>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-orange-50 rounded-xl p-3">
                <p className="text-2xl font-extrabold text-gray-900">24</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Total laporan bulan ini</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-2xl font-extrabold text-gray-900">12</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Kendaraan siap</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-2xl font-extrabold text-gray-900">3</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">Posko aktif</p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-2 h-20">
              {[35, 55, 40, 70, 50, 85, 60].map((h, i) => (
                <div
                  key={i}
                  style={{ height: `${h}%` }}
                  className={`flex-1 rounded-t-md ${i === 5 ? "bg-gradient-to-t from-brand-600 to-orange-400" : "bg-gray-100"}`}
                ></div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-3">Tren laporan 7 hari terakhir</p>
          </div>
        </div>
      </div>
    </div>
  );
}