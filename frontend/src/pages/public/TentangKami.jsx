import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, Link as LinkIcon, Monitor, Phone, ArrowLeft, Shield, Users, Heart } from "lucide-react";

export default function TentangKami() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD Kota Semarang"
                className="h-9 w-9 rounded-lg object-cover"
              />
              <span className="text-sm font-bold text-gray-900">BPBD Kota Semarang</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-700"
          >
            Kembali ke Beranda
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-orange-600 py-20 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Shield className="h-3 w-3" />
            Profil Lembaga
          </span>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Tentang Kami
          </h1>
          <p className="mx-auto max-w-xl text-sm text-white/80 lg:text-base">
            Mengenal BPBD Kota Semarang lebih dekat — lembaga yang berdedikasi
            untuk melindungi warga dari ancaman bencana.
          </p>
        </div>
      </section>

      {/* Profil */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
                Profil BPBD
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                Badan Penanggulangan Bencana Daerah
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Badan Penanggulangan Bencana Daerah (BPBD) Kota Semarang adalah
                lembaga pemerintah yang bertanggung jawab atas koordinasi dan
                penanggulangan bencana di wilayah Kota Semarang. BPBD berfungsi
                sebagai pelaksana kebijakan penanggulangan bencana yang meliputi
                mitigasi, kesiapsiagaan, tanggap darurat, dan pemulihan.
              </p>
              <p className="text-sm leading-relaxed text-gray-500">
                Dengan semangat gotong royong dan dukungan teknologi modern, BPBD
                Kota Semarang terus berupaya meningkatkan kesiapan masyarakat dalam
                menghadapi berbagai potensi bencana seperti banjir, longsor,
                kebakaran, dan bencana lainnya.
              </p>

              <div className="space-y-3 pt-2">
                <CheckItem text="Pencegahan bencana melalui mitigasi dan edukasi masyarakat" />
                <CheckItem text="Kesiapsiagaan dengan membentuk relawan dan simulasi rutin" />
                <CheckItem text="Tanggap darurat cepat dan terkoordinasi saat bencana terjadi" />
                <CheckItem text="Pemulihan pasca-bencana untuk mengembalikan kondisi normal" />
              </div>
            </div>

            <div>
              <img
                src="/assets/tentang-bpbd.jpg"
                alt="Kegiatan BPBD Kota Semarang"
                className="w-full rounded-xl border border-gray-200 shadow-md object-cover"
                style={{ minHeight: 360 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nilai & Komitmen */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
              Nilai Kami
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
              Nilai & Komitmen
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500">
              Prinsip yang menjadi landasan setiap langkah kami
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={<Zap className="h-5 w-5" />}
              title="Cepat Tanggap"
              desc="Respon darurat dalam hitungan menit saat bencana terjadi"
              color="orange"
            />
            <ValueCard
              icon={<Eye className="h-5 w-5" />}
              title="Transparan"
              desc="Informasi publik terbuka dan akuntabel untuk semua warga"
              color="blue"
            />
            <ValueCard
              icon={<LinkIcon className="h-5 w-5" />}
              title="Terpadu"
              desc="Koordinasi lintas instansi dan stakeholder secara sinergis"
              color="green"
            />
            <ValueCard
              icon={<Monitor className="h-5 w-5" />}
              title="Berbasis Teknologi"
              desc="Sistem monitoring real-time berbasis digital modern"
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Visi</h3>
              <p className="text-sm leading-relaxed text-gray-500">
                Mewujudkan Kota Semarang yang tangguh dan aman dari bencana
                melalui penanggulangan yang terkoordinasi, responsif, dan
                berbasis komunitas.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Misi</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Memperkuat kapasitas mitigasi dan kesiapsiagaan masyarakat
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Membangun sistem peringatan dini yang terintegrasi
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Meningkatkan koordinasi antar pemangku kepentingan
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                  Mengoptimalkan pemanfaatan teknologi informasi
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            Butuh Bantuan?
          </h2>
          <p className="mt-2 text-sm text-brand-100 lg:text-base">
            Hubungi kami kapan saja untuk informasi atau bantuan darurat.
          </p>
          <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-white/10 px-6 py-4 backdrop-blur-sm">
            <Phone className="h-5 w-5 text-white" />
            <div className="text-left">
              <p className="text-xs text-white/70">Darurat 24/7</p>
              <p className="text-xl font-extrabold tracking-tight">112</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-[11px]">
          &copy; {new Date().getFullYear()} BPBD Kota Semarang
        </div>
      </footer>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm text-gray-600">{text}</span>
    </li>
  );
}

function ValueCard({ icon, title, desc, color }) {
  const colors = {
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", hover: "hover:border-orange-200 hover:bg-orange-50/50" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", hover: "hover:border-blue-200 hover:bg-blue-50/50" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100", hover: "hover:border-green-200 hover:bg-green-50/50" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", hover: "hover:border-purple-200 hover:bg-purple-50/50" },
  };
  const c = colors[color] || colors.orange;

  return (
    <div className={`rounded-xl border ${c.border} bg-white p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${c.hover}`}>
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
