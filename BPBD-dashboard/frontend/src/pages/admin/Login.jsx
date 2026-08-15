import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const [tab, setTab] = useState("admin");
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
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-500 to-orange-400">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=1000&fit=crop"
          alt="Tim tanggap darurat"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
        />

        <div className="relative z-10 flex flex-col justify-center p-16 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-extrabold text-xl mb-8 border border-white/30">
            BPBD
          </div>
          <h1 className="text-4xl font-extrabold leading-tight mb-4">
            Dashboard Monitoring Kebencanaan
          </h1>
          <p className="text-lg text-white/90 leading-relaxed max-w-md">
            Kelola laporan bencana, inventaris logistik, kendaraan, dan kegiatan
            penanganan secara terpadu.
          </p>
          <div className="mt-10 flex gap-6">
            <div>
              <p className="text-3xl font-bold">24/7</p>
              <p className="text-sm text-white/80">Siaga Darurat</p>
            </div>
            <div className="w-px bg-white/30"></div>
            <div>
              <p className="text-3xl font-bold">112</p>
              <p className="text-sm text-white/80">Call Center</p>
            </div>
            <div className="w-px bg-white/30"></div>
            <div>
              <p className="text-3xl font-bold">Real-time</p>
              <p className="text-sm text-white/80">Monitoring</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-sm mb-4 shadow-lg shadow-brand-200">
              BPBD
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Login BPBD Semarang
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Pilih jenis akun untuk masuk
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTab("admin")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition ${
                tab === "admin"
                  ? "bg-white text-brand-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              👤 Login Admin / Petugas
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition ${
                tab === "public"
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              🔐 Login Public
            </button>
          </div>

          {error && (
            <p className="text-red-600 text-sm mb-4 text-center bg-red-50 border border-red-100 rounded-lg py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="email@bpbdsemarang.go.id"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-brand-200"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>AKUN DEFAULT (seed):</p>
            <p>admin@bpbdsemarang.go.id / admin123</p>
          </div>

          <a
            href="/"
            className="block text-center text-sm text-gray-500 hover:text-brand-600 font-medium mt-4"
          >
            ← Kembali ke Beranda
          </a>
        </div>
      </div>
    </div>
  );
}
