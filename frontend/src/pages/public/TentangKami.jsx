import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap, Eye, Link as LinkIcon, Monitor, Phone, ArrowLeft, Shield, Users, Heart,
  ArrowUpRight, Target, Handshake, FileCheck, BookOpen, CheckCircle, Sparkles,
  MapPin, Clock, Mail,
} from "lucide-react";

export default function TentangKami() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-30 border-b border-brand-100/60 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600 transition-all duration-200 hover:bg-brand-100 hover:border-brand-300 hover:shadow-sm active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/logo-bpbd.jpg"
                alt="Logo BPBD Kota Semarang"
                className="h-9 w-9 rounded-lg object-cover shadow-sm"
              />
              <span className="text-sm font-bold text-gray-900">Tentang Kami</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/25 transition-all duration-200 hover:bg-brand-700 hover:shadow-md active:scale-95"
          >
            Beranda
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-orange-500 pb-24 pt-16 text-white lg:pb-28 lg:pt-20">
        {/* Curved top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="white" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/[0.07] blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" />
            Profil Lembaga
          </div>
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
            Tentang Kami
          </h1>
          <p className="mx-auto max-w-xl text-sm text-white/70 lg:text-base">
            Mengenal BPBD Kota Semarang lebih dekat — lembaga yang berdedikasi
            untuk melindungi warga dari ancaman bencana.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5 text-white/70" />
              <span className="font-medium text-white/90">Kota Semarang</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span className="font-medium text-white/90">Melayani 24/7</span>
            </div>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* Profil */}
      <section className="bg-gray-50 pb-16 pt-4 lg:pb-20 lg:pt-6">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
                <FileCheck className="h-3 w-3" />
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

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-100/40 to-orange-100/40 blur-xl" />
              <img
                src="/assets/tentang-bpbd.jpg"
                alt="Kegiatan BPBD Kota Semarang"
                className="relative w-full rounded-2xl border border-gray-200/80 object-cover shadow-lg shadow-gray-200/50"
                style={{ minHeight: 360 }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Nilai & Komitmen */}
      <section className="bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
              <Sparkles className="h-3 w-3" />
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
              gradient="from-orange-500 to-red-500"
              iconBg="bg-orange-100"
              iconColor="text-orange-600"
              ring="ring-orange-200"
            />
            <ValueCard
              icon={<Eye className="h-5 w-5" />}
              title="Transparan"
              desc="Informasi publik terbuka dan akuntabel untuk semua warga"
              gradient="from-blue-500 to-indigo-500"
              iconBg="bg-blue-100"
              iconColor="text-blue-600"
              ring="ring-blue-200"
            />
            <ValueCard
              icon={<LinkIcon className="h-5 w-5" />}
              title="Terpadu"
              desc="Koordinasi lintas instansi dan stakeholder secara sinergis"
              gradient="from-emerald-500 to-green-500"
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              ring="ring-emerald-200"
            />
            <ValueCard
              icon={<Monitor className="h-5 w-5" />}
              title="Berbasis Teknologi"
              desc="Sistem monitoring real-time berbasis digital modern"
              gradient="from-purple-500 to-violet-500"
              iconBg="bg-purple-100"
              iconColor="text-purple-600"
              ring="ring-purple-200"
            />
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="bg-gray-50 py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
              <Target className="h-3 w-3" />
              Arah
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
              Visi & Misi
            </h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-125" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm shadow-brand-500/20">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Visi</h3>
                <p className="text-sm leading-relaxed text-gray-500">
                  Mewujudkan Kota Semarang yang tangguh dan aman dari bencana
                  melalui penanggulangan yang terkoordinasi, responsif, dan
                  berbasis komunitas.
                </p>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand-500 to-orange-500 opacity-40 transition-opacity group-hover:opacity-70" />
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-125" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-sm shadow-emerald-500/20">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">Misi</h3>
                <ul className="space-y-2.5 text-sm text-gray-500">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Memperkuat kapasitas mitigasi dan kesiapsiagaan masyarakat
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Membangun sistem peringatan dini yang terintegrasi
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Meningkatkan koordinasi antar pemangku kepentingan
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Mengoptimalkan pemanfaatan teknologi informasi
                  </li>
                </ul>
              </div>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-green-500 opacity-40 transition-opacity group-hover:opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-orange-500 py-20 text-white">
        {/* Curved top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="#f3f4f6" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 h-[350px] w-[350px] rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <Heart className="h-3.5 w-3.5" />
            Siap Membantu
          </div>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl xl:text-5xl">
            Butuh Bantuan?
          </h2>
          <p className="mx-auto max-w-lg text-sm text-white/70 lg:text-base">
            Hubungi kami kapan saja untuk informasi atau bantuan darurat.
          </p>

          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">Darurat 24/7</p>
              <p className="text-2xl font-extrabold tracking-tight">112</p>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => navigate("/")}
              className="group inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50 hover:shadow-lg active:scale-95"
            >
              Kembali ke Beranda
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="#111827" />
          </svg>
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
    <li className="flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-brand-50/50">
      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
      <span className="text-sm text-gray-600">{text}</span>
    </li>
  );
}

function ValueCard({ icon, title, desc, gradient, iconBg, iconColor, ring }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className={`absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-[0.08] blur-2xl transition-all duration-500 group-hover:opacity-[0.15] group-hover:scale-125`} />
      <div className="relative">
        <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ring-2 ${iconBg} ${ring} ${iconColor}`}>
          {icon}
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${gradient} opacity-40 transition-opacity duration-300 group-hover:opacity-70`} />
    </div>
  );
}
