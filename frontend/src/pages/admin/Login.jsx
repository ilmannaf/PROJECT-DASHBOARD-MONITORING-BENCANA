import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, "admin");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white font-sans">
      {/* ===== Animated gradient background ===== */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(255,252,245,1) 25%, rgba(255,240,215,0.6) 45%, rgba(255,183,77,0.7) 60%, rgba(255,111,0,0.85) 75%, rgba(230,81,0,0.95) 100%)",
        }}
      />

      {/* ===== Animated decorative orbs ===== */}
      <div className="absolute top-[15%] left-[8%] w-72 h-72 bg-orange-300/20 rounded-full blur-[80px] animate-[blobFloat_16s_ease-in-out_infinite_alternate]" />
      <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-amber-200/25 rounded-full blur-[70px] animate-[blobFloat_20s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-4s' }} />
      <div className="absolute top-[60%] left-[50%] w-48 h-48 bg-orange-400/15 rounded-full blur-[60px] animate-[blobFloat_14s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-8s' }} />

      {/* ===== Floating dots ===== */}
      <span className="absolute w-2 h-2 rounded-full bg-orange-300/40 top-[12%] left-[10%] z-10 animate-[heroFloatUp_3s_ease-in-out_infinite_alternate]"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-orange-200/50 top-[20%] right-[15%] z-10 animate-[heroFloatUp_4s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-1s' }}></span>
      <span className="absolute w-2.5 h-2.5 rounded-full bg-orange-300/30 bottom-[25%] left-[12%] z-10 animate-[heroFloatUp_3.5s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-2s' }}></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-orange-200/40 bottom-[18%] right-[10%] z-10 animate-[heroFloatUp_4.5s_ease-in-out_infinite_alternate]" style={{ animationDelay: '-1.5s' }}></span>

      {/* ===== Konten utama ===== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10">
        {/* Logo + Judul */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-br from-orange-400/20 to-amber-300/20 rounded-full blur-xl" />
          <img
            src="/assets/logo-bpbd.jpg"
            alt="Logo BPBD"
            className="relative w-24 h-24 rounded-full object-cover shadow-xl shadow-orange-500/15 border-4 border-white"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          BPBD KOTA SEMARANG
        </h1>
        <p className="text-[14px] text-gray-500 font-medium mb-8">
          Sistem Informasi Penanggulangan Bencana
        </p>

        {/* Card Form */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-gray-200/60 border border-gray-100 p-8 hover-lift">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-[12px] font-bold text-gray-600 mb-2 tracking-wider uppercase">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan username atau email"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] text-gray-800 placeholder-gray-400 bg-gray-50/80 input-premium focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-bold text-gray-600 mb-2 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-12 py-3.5 text-[14px] text-gray-800 placeholder-gray-400 bg-gray-50/80 input-premium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Ingat Saya + Tombol Masuk */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 text-[13px] text-gray-500 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 rounded border-2 border-gray-300 peer-checked:border-brand-500 peer-checked:bg-brand-500 transition-all duration-200 flex items-center justify-center">
                    {remember && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="group-hover:text-gray-700 transition-colors">Ingat Saya</span>
              </label>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold text-[14px] rounded-xl px-8 py-3 shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 active:scale-[0.97] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </span>
                ) : "Masuk"}
              </button>
            </div>

          </form>
        </div>

        {/* Kembali ke Beranda */}
        <a
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-[13px] text-gray-500 hover:text-brand-600 font-medium transition-colors duration-200 group"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Kembali ke Beranda
        </a>
      </div>

      {/* ===== Footer ===== */}
      <footer className="relative z-10 pb-6 px-6 flex justify-center">
        <div className="bg-gradient-to-r from-brand-500/90 to-brand-600/90 backdrop-blur-sm rounded-2xl py-3 px-8 max-w-md w-full shadow-lg shadow-brand-500/20">
          <p className="text-center text-[12px] text-white/90">
            &copy; 2026 BPBD Kota Semarang &mdash; Badan Penanggulangan Bencana Daerah
          </p>
        </div>
      </footer>
    </div>
  );
}