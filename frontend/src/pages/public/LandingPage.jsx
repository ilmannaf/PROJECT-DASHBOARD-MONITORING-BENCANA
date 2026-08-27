import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sectionsRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const timer = setTimeout(() => {
      document.querySelectorAll(".hero-badge, .hero-subtitle, .hero-title, .hero-desc, .hero-btn")
        .forEach((el) => el.classList.add("show"));
    }, 120);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HERO ===== */}
      <section className="relative flex h-[85vh] min-h-[500px] flex-col overflow-hidden">
        <img
          src="/assets/BPBD KOTA SEMARANG.jpeg"
          alt="Kantor BPBD Kota Semarang"
          className="absolute inset-0 h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent"></div>

        <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD Kota Semarang"
              className="h-11 w-11 rounded-lg object-cover shadow-lg shadow-black/30"
            />
            <div>
              <h2 className="text-base font-bold leading-tight text-white">
                BPBD Kota Semarang
              </h2>
              <p className="text-xs text-white/70">
                Sistem Monitoring Kebencanaan
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <button
              onClick={() => navigate("/peta")}
              className="text-sm font-semibold text-white transition hover:text-orange-300"
            >
              Peta Bencana
            </button>
            <button
              onClick={() => navigate("/lacak")}
              className="text-sm font-semibold text-white transition hover:text-orange-300"
            >
              Lacak Laporan
            </button>
            <button
              onClick={() => navigate("/lapor")}
              className="rounded-lg border border-white/50 px-4 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Lapor Bencana
            </button>
            <button
              onClick={() => navigate("/admin/login")}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
            >
              Login Admin
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-white transition hover:bg-white/10 md:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="absolute inset-x-4 top-20 z-30 space-y-3 rounded-xl border border-white/20 bg-gray-900/95 p-4 shadow-2xl backdrop-blur md:hidden">
            <button
              onClick={() => navigate("/peta")}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Peta Bencana
            </button>
            <button
              onClick={() => navigate("/lacak")}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Lacak Laporan
            </button>
            <button
              onClick={() => navigate("/lapor")}
              className="block w-full rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-brand-600"
            >
              Lapor Bencana
            </button>
            <button
              onClick={() => navigate("/admin/login")}
              className="block w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Login Admin
            </button>
          </div>
        )}

        <div className="relative z-10 flex flex-1 items-end">
          <div className="mx-auto w-full max-w-7xl px-6 pb-12 lg:pb-16">
            <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-white">
                TANGGAP DARURAT 24/7
              </span>
            </div>
            <div className="space-y-1 mt-3">
              <p className="hero-subtitle text-xs font-semibold tracking-[0.15em] text-orange-200 lg:text-sm">
                SISTEM PELAPORAN DAN MONITORING BENCANA
              </p>
              <h1 className="hero-title text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
                BPBD KOTA SEMARANG
              </h1>
            </div>
            <p className="hero-desc max-w-lg text-sm leading-relaxed text-white/70 lg:text-base mt-3">
              Laporkan kejadian bencana secara cepat dan akurat. Pantau status
              penanganan secara real-time.
            </p>
            <div className="hero-btn flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => navigate("/lapor")}
                className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Laporkan Bencana
              </button>
              <button
                onClick={() => navigate("/peta")}
                className="rounded-lg border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                Peta Bencana
              </button>
              <button
                onClick={() => navigate("/lacak")}
                className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lacak Status
              </button>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionsRef} className="relative bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal mb-12 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
              Layanan Kami
            </span>
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
              Fitur Utama
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500">
              Sistem monitoring kebencanaan yang mudah dan cepat untuk warga Kota Semarang.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="reveal">
              <FeatureCard
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="Lapor Mudah"
                description="Laporkan kejadian bencana dengan foto dan lokasi GPS dalam hitungan detik."
              />
            </div>
            <div className="reveal">
              <FeatureCard
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Dashboard Real-time"
                description="Pantau status penanganan laporan dengan tracking code unik untuk setiap laporan."
              />
            </div>
            <div className="reveal">
              <FeatureCard
                icon={
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Respon Cepat"
                description="Tim BPBD siaga 24/7 untuk merespon setiap laporan dengan prioritas tinggi."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="reveal">
              <img
                src="/assets/BPBD KOTA SEMARANG.jpeg"
                alt="Kantor BPBD Kota Semarang"
                className="rounded-xl border border-gray-200 shadow-md"
              />
            </div>

            <div className="reveal space-y-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
                Keunggulan Sistem
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
                Tanggap Darurat Terintegrasi
              </h2>
              <p className="text-sm leading-relaxed text-gray-500">
                Sistem monitoring BPBD Kota Semarang mengintegrasikan pelaporan
                masyarakat dengan manajemen sumber daya darurat.
              </p>
              <ul className="space-y-3">
                <CheckItem text="Tracking lokasi dengan GPS presisi" />
                <CheckItem text="Upload foto dokumentasi kejadian" />
                <CheckItem text="History penanganan transparan" />
                <CheckItem text="Notifikasi update status real-time" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-brand-600 py-16 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            Ada Kejadian Bencana?
          </h2>
          <p className="text-sm text-brand-100 lg:text-base mt-2">
            Setiap detik berharga dalam situasi darurat. Tim BPBD siap membantu Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <button
              onClick={() => navigate("/lapor")}
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-600 transition hover:bg-gray-50"
            >
              Buat Laporan
            </button>
            <button
              onClick={() => navigate("/peta")}
              className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Lihat Peta
            </button>
          </div>
          <div className="inline-flex items-center gap-2 mt-6 text-sm">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-semibold">112</span> / 0812-3456-7890
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <img
                  src="/assets/logo-bpbd.jpg"
                  alt="Logo BPBD Kota Semarang"
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <p className="font-bold text-white text-sm">BPBD Kota Semarang</p>
              </div>
              <p className="text-xs leading-relaxed">
                Platform pelaporan dan pemantauan bencana terpadu.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-300">
                Navigasi
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => navigate("/")} className="transition hover:text-white">
                    Beranda
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/peta")} className="transition hover:text-white">
                    Peta Bencana
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/lacak")} className="transition hover:text-white">
                    Lacak Laporan
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/lapor")} className="transition hover:text-white">
                    Laporkan Bencana
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-300">
                Kontak
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Jl. Menoreh Tengah I No.22, Semarang
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white font-semibold">112</span> / 0812-3456-7890
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  bpbd@semarangkota.go.id
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-4 text-center text-[11px]">
            © 2026 BPBD Kota Semarang
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 transition hover:shadow-md hover:border-gray-300">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
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
