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
      <section className="relative flex h-[90vh] min-h-[600px] flex-col overflow-hidden">
        <img
          src="/assets/BPBD KOTA SEMARANG.jpeg"
          alt="Kantor BPBD Kota Semarang"
          className="absolute inset-0 h-full w-full object-cover scale-105 animate-[kenburns_20s_ease-in-out_infinite_alternate]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/30 to-transparent"></div>
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent"></div>

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
          <div className="mx-auto w-full max-w-7xl space-y-6 px-6 pb-16 lg:pb-20">
            <div className="hero-badge inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500"></span>
              <span className="text-xs font-bold tracking-[0.3em] text-white">
                TANGGAP DARURAT 24/7
              </span>
            </div>
            <div className="space-y-2">
              <p className="hero-subtitle text-sm font-bold tracking-[0.25em] text-orange-100 lg:text-base">
                SISTEM PELAPORAN DAN MONITORING BENCANA
              </p>
              <h1 className="hero-title text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl lg:text-7xl xl:text-8xl">
                BPBD KOTA SEMARANG
              </h1>
            </div>
            <p className="hero-desc max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
              Laporkan kejadian bencana secara cepat dan akurat. Pantau status
              penanganan secara real-time melalui sistem terpadu BPBD Kota
              Semarang.
            </p>
            <div className="hero-btn flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => navigate("/lapor")}
                className="rounded-lg border border-brand-600 bg-brand-600 px-8 py-4 text-sm font-semibold tracking-wider text-white transition hover:bg-brand-700"
              >
                Laporkan Bencana
              </button>
              <button
                onClick={() => navigate("/peta")}
                className="rounded-lg border border-white/50 bg-white/10 px-8 py-4 text-sm font-semibold tracking-wider text-white backdrop-blur transition hover:bg-white hover:text-brand-600"
              >
                Peta Bencana
              </button>
              <button
                onClick={() => navigate("/lacak")}
                className="rounded-lg border border-white/50 px-8 py-4 text-sm font-semibold tracking-wider text-white transition hover:bg-white hover:text-brand-600"
              >
                Lacak Status Laporan
              </button>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionsRef} className="relative overflow-hidden bg-white py-20">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-50 blur-3xl"></div>
        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-orange-50 blur-3xl"></div>
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="reveal mb-14 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
              Layanan Kami
            </span>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
              Fitur Utama
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Sistem monitoring kebencanaan yang mudah dan cepat untuk seluruh
              warga Kota Semarang.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="reveal">
              <FeatureCard
                gradient="from-sky-500 to-blue-600"
                shadow="shadow-sky-500/25"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="Lapor Mudah"
                description="Laporkan kejadian bencana dengan foto, lokasi GPS, dan deskripsi lengkap hanya dalam hitungan detik."
              />
            </div>
            <div className="reveal">
              <FeatureCard
                gradient="from-brand-500 to-orange-600"
                shadow="shadow-brand-500/25"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                title="Dashboard Real-time"
                description="Pantau status penanganan laporan secara real-time dengan tracking code unik untuk setiap laporan."
              />
            </div>
            <div className="reveal">
              <FeatureCard
                gradient="from-emerald-500 to-teal-600"
                shadow="shadow-emerald-500/25"
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Respon Cepat"
                description="Tim BPBD siaga 24/7 untuk merespon setiap laporan dengan prioritas tinggi pada kasus darurat."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gray-50 py-20">
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="reveal relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/15 to-orange-500/15"></div>
              <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full bg-brand-500/10 blur-2xl"></div>
              <img
                src="/assets/BPBD KOTA SEMARANG.jpeg"
                alt="Kantor BPBD Kota Semarang"
                className="relative rounded-3xl border-[6px] border-white shadow-2xl"
              />
              <div className="absolute -bottom-7 -right-5 hidden items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:flex">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Siaga 24/7</p>
                  <p className="text-xs text-gray-500">Respons cepat petugas</p>
                </div>
              </div>
            </div>

            <div className="reveal space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-600">
                Keunggulan Sistem
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 lg:text-4xl">
                Tanggap Darurat Terintegrasi
              </h2>
              <p className="leading-relaxed text-gray-600">
                Sistem monitoring BPBD Kota Semarang mengintegrasikan pelaporan
                masyarakat dengan manajemen sumber daya darurat seperti
                logistik, kendaraan, dan posko pengungsian.
              </p>
              <ul className="space-y-4">
                <CheckItem text="Tracking lokasi dengan GPS presisi" />
                <CheckItem text="Upload foto dokumentasi kejadian" />
                <CheckItem text="History penanganan transparan" />
                <CheckItem text="Notifikasi update status real-time" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-orange-800 py-20 text-white">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/10"></div>
        <div className="absolute -right-16 -bottom-32 h-[28rem] w-[28rem] rounded-full bg-white/10"></div>
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-300/20 blur-3xl"></div>

        <div className="reveal relative mx-auto max-w-4xl space-y-6 px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] backdrop-blur-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
            Call Center 24 Jam
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight lg:text-5xl">
            Ada Kejadian Bencana? <br className="hidden sm:block" />
            Segera Laporkan!
          </h2>
          <p className="text-base text-brand-100 lg:text-lg">
            Setiap detik berharga dalam situasi darurat. Tim BPBD siap membantu
            Anda segera.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/lapor")}
              className="rounded-xl bg-white px-8 py-4 font-bold text-brand-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
            >
              Buat Laporan Sekarang
            </button>
            <button
              onClick={() => navigate("/lapor")}
              className="rounded-xl border border-white/40 bg-transparent px-8 py-4 font-bold text-white transition-all hover:bg-brand-900/60"
            >
              Lihat Dashboard
            </button>
          </div>
          <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 pt-3 text-sm font-medium backdrop-blur-sm">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Hubungi Call Center Darurat:{" "}
            <span className="font-bold text-white">112 / 0812-3456-7890</span>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400">
        <div className="reveal mx-auto max-w-7xl px-6 py-14">
          <div className="grid gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/logo-bpbd.jpg"
                  alt="Logo BPBD Kota Semarang"
                  className="h-11 w-11 rounded-lg object-cover"
                />
                <div>
                  <p className="font-extrabold text-white">BPBD Kota Semarang</p>
                  <p className="text-xs text-gray-500">Sistem Monitoring Kebencanaan</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Platform pelaporan dan pemantauan bencana terpadu untuk warga
                Kota Semarang.
              </p>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                Navigasi
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => navigate("/")} className="transition hover:text-orange-300">
                    Beranda
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/peta")} className="transition hover:text-orange-300">
                    Peta Bencana
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/lacak")} className="transition hover:text-orange-300">
                    Lacak Laporan
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/lapor")} className="transition hover:text-orange-300">
                    Laporkan Bencana
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/admin/login")} className="transition hover:text-orange-300">
                    Login Admin
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">
                Kontak
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-start gap-2.5">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Jl. Menoreh Tengah I No.22, Sampangan, Semarang
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>
                    <span className="text-white">112</span> / 0812-3456-7890
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  bpbd@semarangkota.go.id
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-5 text-center text-xs">
            © 2026 BPBD Kota Semarang. Sistem Monitoring Kebencanaan Terpadu.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, gradient, shadow }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-50/60 opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100`}></div>
      <div className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg ${shadow} transition-transform duration-300 group-hover:scale-110`}>
        {icon}
      </div>
      <h3 className="relative mb-2 text-xl font-bold text-gray-900">{title}</h3>
      <p className="relative text-sm leading-relaxed text-gray-600">{description}</p>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <li className="group flex items-start gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 transition-colors group-hover:bg-emerald-200">
        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <span className="font-medium text-gray-700">{text}</span>
    </li>
  );
}
