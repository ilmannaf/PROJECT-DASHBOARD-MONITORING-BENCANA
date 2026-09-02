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
      {/* ===== Gradient background — setengah putih, setengah oranye ===== */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 30%, rgba(255,248,240,0.9) 40%, rgba(255,230,190,0.7) 45%, rgba(255,180,100,0.85) 50%, rgba(255,155,65,0.95) 55%, rgba(255,140,50,1) 65%, rgba(255,140,50,1) 100%)",
        }}
      ></div>

      {/* ===== Decorative dots ===== */}
      <span className="absolute w-2.5 h-2.5 rounded-full bg-orange-300/50 top-[12%] left-[10%] z-10"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-orange-200/60 top-[20%] right-[15%] z-10"></span>
      <span className="absolute w-2 h-2 rounded-full bg-orange-300/40 bottom-[25%] left-[12%] z-10"></span>
      <span className="absolute w-1.5 h-1.5 rounded-full bg-orange-200/50 bottom-[18%] right-[10%] z-10"></span>

      {/* ===== Konten utama ===== */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 relative z-10">
        {/* Logo + Judul */}
        <img
          src="/assets/logo-bpbd.jpg"
          alt="Logo BPBD"
          className="w-24 h-24 rounded-full object-cover shadow-md mb-4 border-4 border-white"
        />
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          BPBD KOTA SEMARANG
        </h1>
        <p className="text-[15px] text-orange-400 font-medium mb-8">
          Sistem Informasi Penanggulangan Bencana
        </p>

        {/* Card Form */}
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-8">
          {error && (
            <div className="mb-5 bg-orange-50 border border-orange-100 text-orange-600 text-[13px] rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username / Email */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1.5 tracking-wide">
                USERNAME / EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan username atau email"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-gray-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-300/40 focus:border-orange-400 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1.5 tracking-wide">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-[14px] text-gray-800 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-orange-500"
                />
                Ingat Saya
              </label>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[14px] rounded-xl px-6 py-2.5 shadow-sm hover:shadow-md active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>

            {/* Lupa Password */}
            <div className="text-center pt-1">
              <a
                href="/lupa-password"
                className="text-[13px] text-orange-500 underline hover:text-orange-600 font-medium"
              >
                Lupa Password?
              </a>
            </div>
          </form>
        </div>
      </div>

      {/* ===== Footer oranye ===== */}
      <footer className="relative z-10 pb-6 px-6 flex justify-center">
        <div className="bg-orange-500/90 backdrop-blur-sm rounded-2xl py-3 px-8 max-w-md w-full shadow-lg">
          <p className="text-center text-[12px] text-white/90">
            &copy; 2024 BPBD Kota Semarang &mdash; Badan Penanggulangan Bencana Daerah
          </p>
        </div>
      </footer>
    </div>
  );
}