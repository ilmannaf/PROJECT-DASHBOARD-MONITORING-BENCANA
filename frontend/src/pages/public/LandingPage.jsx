import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Clock, BarChart3, FileText, CheckCircle, Loader2, Shield } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import AnimatedNumber from "../../components/AnimatedNumber";
import api from "../../services/api";

const GALERI_IMAGES = [
  { src: "/assets/dokumentasi1.jpeg", alt: "Dokumentasi Kegiatan 1" },
  { src: "/assets/dokumentasi2.jpeg", alt: "Dokumentasi Kegiatan 2" },
  { src: "/assets/dokumentasi3.jpeg", alt: "Dokumentasi Kegiatan 3" },
  { src: "/assets/dokumentasi4.jpeg", alt: "Dokumentasi Kegiatan 4" },
  { src: "/assets/dokumentasi5.jpeg", alt: "Dokumentasi Kegiatan 5" },
  { src: "/assets/dokumentasi6.jpeg", alt: "Dokumentasi Kegiatan 6" },
  { src: "/assets/BPBD KOTA SEMARANG.jpeg", alt: "BPBD Kota Semarang" },
];

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function FotoHighlight() {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const total = GALERI_IMAGES.length;

  const goTo = useCallback((idx) => {
    setCurrent(((idx % total) + total) % total);
  }, [total]);

  const next = useCallback(() => setCurrent((p) => (p + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + total) % total), [total]);

  useEffect(() => {
    if (isHovered || isDragging) return;
    timerRef.current = setInterval(next, 3500);
    return () => clearInterval(timerRef.current);
  }, [isHovered, isDragging, next]);

  const handlePointerDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX ?? e.touches?.[0]?.clientX ?? 0);
    setDragDelta(0);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    setDragDelta(x - startX);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragDelta) > 50) {
      dragDelta < 0 ? next() : prev();
    }
    setDragDelta(0);
  };

  const getCardTransform = (idx) => {
    let diff = idx - current;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    const absDiff = Math.abs(diff);
    const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;

    if (absDiff === 0) {
      return {
        transform: "translateX(0) translateZ(60px) rotateY(0deg) scale(1)",
        zIndex: 20,
        opacity: 1,
      };
    }

    if (absDiff === 1) {
      const dragOffset = isDragging ? (dragDelta / (containerRef.current?.offsetWidth || 1)) * 30 * sign : 0;
      return {
        transform: `translateX(${sign * 55 + dragOffset}%) translateZ(-80px) rotateY(${sign * -30}deg) scale(0.88)`,
        zIndex: 15 - absDiff,
        opacity: 0.85,
      };
    }

    if (absDiff === 2) {
      return {
        transform: `translateX(${sign * 90}%) translateZ(-160px) rotateY(${sign * -30}deg) scale(0.75)`,
        zIndex: 15 - absDiff,
        opacity: 0.5,
      };
    }

    return {
      transform: `translateX(${sign * 110}%) translateZ(-240px) rotateY(${sign * -30}deg) scale(0.65)`,
      zIndex: 1,
      opacity: 0,
    };
  };

  return (
    <section
      className="relative py-20 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "radial-gradient(ellipse at center, rgba(120,53,15,0.15) 0%, rgba(17,24,39,1) 70%)",
      }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-[100px]"></div>
      </div>

      <div className="mx-auto max-w-6xl px-6 relative z-10">
        <div className="reveal mb-16 text-center">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse"></span>
            Galeri Foto
          </span>
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-white lg:text-3xl">
            Dokumentasi Kegiatan
          </h2>
          <p className="mx-auto max-w-lg text-sm text-gray-400">
            Cuplikan momen penting dalam penanganan bencana di Kota Semarang.
          </p>
        </div>

        {/* 3D Coverflow Carousel */}
        <div
          ref={containerRef}
          className="relative mx-auto cursor-grab active:cursor-grabbing select-none hidden md:block"
          style={{ perspective: 1000, height: 440 }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchStart={(e) => handlePointerDown(e)}
          onTouchMove={(e) => handlePointerMove(e)}
          onTouchEnd={handlePointerUp}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateX(${isDragging ? (dragDelta / (containerRef.current?.offsetWidth || 1)) * 8 : 0}%)`,
              transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {GALERI_IMAGES.map((img, idx) => {
              const style = getCardTransform(idx);
              const isActive = idx === current;

              return (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: style.transform,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                    transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.4,0,0.2,1)",
                    cursor: isActive ? "default" : "pointer",
                  }}
                  onClick={() => {
                    if (!isActive) goTo(idx);
                  }}
                >
                  <div
                    className={`relative overflow-hidden rounded-2xl ${
                      isActive
                        ? "shadow-2xl shadow-brand-500/25 ring-1 ring-white/10"
                        : "shadow-lg shadow-black/30"
                    }`}
                    style={{
                      width: 280,
                      height: 400,
                      filter: isActive ? "none" : "brightness(0.65) saturate(0.9)",
                      transition: "filter 0.5s ease",
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />

                    {/* Bottom gradient for caption — always present, stronger on active */}
                    <div
                      className={`absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-opacity duration-500 ${
                        isActive ? "opacity-100" : "opacity-60"
                      }`}
                    />

                    {/* Caption */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-500 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                      }`}
                    >
                      <p className="text-sm font-semibold text-white leading-snug">{img.alt}</p>
                      <div className="mt-1.5 h-0.5 w-8 rounded-full bg-brand-400/60"></div>
                    </div>

                    {/* Active glow edge */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: single card view */}
        <div className="md:hidden">
          <div
            className="relative mx-auto overflow-hidden rounded-2xl shadow-2xl shadow-black/40"
            style={{ maxWidth: 320, height: 380 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={(e) => handlePointerDown(e)}
            onTouchMove={(e) => handlePointerMove(e)}
            onTouchEnd={handlePointerUp}
          >
            <img
              src={GALERI_IMAGES[current].src}
              alt={GALERI_IMAGES[current].alt}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-sm font-semibold text-white">{GALERI_IMAGES[current].alt}</p>
              <div className="mt-1.5 h-0.5 w-8 rounded-full bg-brand-400/60"></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-5 mt-8">
          <button
            onClick={prev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-brand-500/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            {GALERI_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`rounded-full transition-all duration-400 ${
                  idx === current
                    ? "h-2.5 w-7 bg-brand-500 shadow-sm shadow-brand-500/40"
                    : "h-2 w-2 bg-white/25 hover:bg-white/45"
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-gray-200 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-brand-500/20"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const timer2 = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el, i) => {
        if (!el.dataset.delaySet) {
          el.dataset.delaySet = '1';
          const parent = el.closest('[data-stagger-group]');
          if (parent) {
            const siblings = Array.from(parent.querySelectorAll('.reveal'));
            const idx = siblings.indexOf(el);
            el.style.transitionDelay = `${idx * 0.1}s`;
          }
        }
        observer.observe(el);
      });
    }, 50);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
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
              onClick={() => navigate("/tentang")}
              className="text-sm font-semibold text-white transition hover:text-orange-300"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => scrollToSection("statistik")}
              className="text-sm font-semibold text-white transition hover:text-orange-300"
            >
              Statistik
            </button>
            <button
              onClick={() => scrollToSection("kontak")}
              className="text-sm font-semibold text-white transition hover:text-orange-300"
            >
              Kontak
            </button>
            <button
              onClick={() => navigate("/admin/login")}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98]"
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
              onClick={() => { navigate("/tentang"); setMobileMenuOpen(false); }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => { scrollToSection("statistik"); setMobileMenuOpen(false); }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Statistik
            </button>
            <button
              onClick={() => { scrollToSection("kontak"); setMobileMenuOpen(false); }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Kontak
            </button>
            <button
              onClick={() => { navigate("/admin/login"); setMobileMenuOpen(false); }}
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
                className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98]"
              >
                Laporkan Bencana
              </button>
              <button
                onClick={() => navigate("/peta")}
                className="rounded-lg border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
              >
                Peta Bencana
              </button>
              <button
                onClick={() => navigate("/lacak")}
                className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
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
          <div className="grid gap-5 md:grid-cols-3" data-stagger-group>
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
              className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-600 transition-all duration-200 hover:bg-gray-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              Buat Laporan
            </button>
            <button
              onClick={() => navigate("/peta")}
              className="rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
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

      {/* ===== SECTION: STATISTIK ===== */}
      <section id="statistik" className="relative bg-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal mb-14 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-600">
              <BarChart3 className="h-3 w-3" />
              Statistik
            </span>
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-gray-900 lg:text-3xl">
              Statistik Penanganan Bencana
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500">
              Data real-time kejadian bencana di Kota Semarang
            </p>
          </div>

          <StatistikSection />

          <div className="reveal mt-14">
            <StatistikChart />
          </div>
        </div>
      </section>

      {/* ===== SECTION: KONTAK ===== */}
      <section id="kontak" className="relative bg-gray-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="reveal mb-14 text-center">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-300">
              <Phone className="h-3 w-3" />
              Kontak
            </span>
            <h2 className="mb-2 text-2xl font-extrabold tracking-tight lg:text-3xl">
              Hubungi Kami
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-400">
              Kontak darurat dan informasi BPBD Kota Semarang
            </p>
          </div>

          <div className="grid items-start gap-10 lg:grid-cols-2">
            <div className="reveal space-y-6">
              {/* Emergency Contact Card */}
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 backdrop-blur-sm">
                <div className="mb-2 flex items-center gap-2 text-red-400">
                  <Phone className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Kontak Darurat</span>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white">112</p>
                <p className="mt-1 text-sm text-gray-400">Nomor darurat nasional — hubungi segera saat bencana</p>
                <p className="mt-2 text-lg font-bold text-white">0812-3456-7890</p>
                <p className="text-xs text-gray-400">Hotline BPBD Kota Semarang</p>
              </div>

              <div className="space-y-4">
                <ContactItem
                  icon={<Phone className="h-5 w-5" />}
                  label="Telepon"
                  value="(024) 355-1234"
                />
                <ContactItem
                  icon={<Mail className="h-5 w-5" />}
                  label="Email"
                  value="bpbd@semarangkota.go.id"
                />
                <ContactItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Alamat"
                  value="Kompleks Terminal Penggaron, Jl. Brigjen Sudiarto No.KM. 11, Penggaron Kidul, Pedurungan, Semarang 50194"
                />
                <ContactItem
                  icon={<Clock className="h-5 w-5" />}
                  label="Jam Operasional"
                  value="24/7 — Tanggap Darurat Siaga"
                />
              </div>
            </div>

            <div className="reveal overflow-hidden rounded-xl border border-white/10" style={{ minHeight: 380 }}>
              <iframe
                src="https://maps.google.com/maps?q=-7.017402,110.493722&z=15&output=embed"
                width="100%"
                height="380"
                style={{ border: 0, filter: "grayscale(0.6) contrast(1.1) brightness(0.8)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi BPBD Kota Semarang"
              />
            </div>
          </div>
        </div>
      </section>

      <FotoHighlight />

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
                  <button onClick={() => navigate("/tentang")} className="transition hover:text-white">
                    Tentang Kami
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("statistik")} className="transition hover:text-white">
                    Statistik
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("kontak")} className="transition hover:text-white">
                    Kontak
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
                  Jl. Brigjen Sudiarto No.KM. 11, Penggaron Kidul, Semarang
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
                <li className="flex items-center gap-2">
                  <svg className="w-3 h-3 shrink-0 text-brand-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  <a href="https://instagram.com/bpbdkotasemarang" target="_blank" rel="noopener noreferrer" className="hover:underline">
                    @bpbdkotasemarang
                  </a>
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

function StatistikSection() {
  const [stats, setStats] = useState({ total: 0, byStatus: {}, byType: [] });
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/public/stats");
        setStats({
          total: data.laporan || 0,
          byStatus: data.byStatus || {},
          byType: data.byType || [],
        });
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div ref={sectionRef} className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  const topTypes = (stats.byType || [])
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 4);

  return (
    <div ref={sectionRef} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-stagger-group>
      <StatCard
        icon={<FileText className="h-5 w-5" />}
        label="Total Laporan"
        value={stats.total}
        color="brand"
        visible={visible}
      />
      <StatCard
        icon={<CheckCircle className="h-5 w-5" />}
        label="Selesai Ditangani"
        value={stats.byStatus?.selesai || 0}
        color="green"
        visible={visible}
      />
      <StatCard
        icon={<Loader2 className="h-5 w-5" />}
        label="Sedang Diproses"
        value={(stats.byStatus?.ditindaklanjuti || 0) + (stats.byStatus?.diverifikasi || 0)}
        color="blue"
        visible={visible}
      />
      {topTypes.length > 0 && (
        <StatCard
          icon={<Shield className="h-5 w-5" />}
          label={`Terbanyak: ${topTypes[0].name}`}
          value={topTypes[0].jumlah}
          color="orange"
          visible={visible}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, visible }) {
  const colorMap = {
    brand: { bg: "bg-brand-50", text: "text-brand-600", border: "border-brand-100" },
    green: { bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100" },
  };
  const c = colorMap[color] || colorMap.brand;

  return (
    <div
      className={`rounded-xl border ${c.border} bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02]`}
    >
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900">
        {visible ? <AnimatedNumber value={value} duration={1400} /> : 0}
      </p>
    </div>
  );
}

function StatistikChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthTypes, setMonthTypes] = useState([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const fetchMonthly = async () => {
      try {
        const currentYear = new Date().getFullYear();
        const { data: res } = await api.get("/public/stats/monthly", { params: { year: currentYear } });
        const monthlyRaw = res.monthly || [];
        setData(
          monthlyRaw.slice(0, new Date().getMonth() + 1).map((count, idx) => ({
            name: MONTH_LABELS[idx],
            jumlah: count,
            monthIndex: idx + 1,
          }))
        );
      } catch {
        const currentMonth = new Date().getMonth();
        setData(
          MONTH_LABELS.slice(0, currentMonth + 1).map((m, idx) => ({
            name: m,
            jumlah: 0,
            monthIndex: idx + 1,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMonthly();
  }, []);

  const handleBarClick = async (monthIndex, monthName) => {
    if (selectedMonth === monthIndex) {
      setSelectedMonth(null);
      setMonthTypes([]);
      setMonthTotal(0);
      return;
    }

    setSelectedMonth(monthIndex);
    setLoadingDetail(true);
    try {
      const currentYear = new Date().getFullYear();
      const { data: res } = await api.get("/public/stats/monthly/by-type", {
        params: { year: currentYear, month: monthIndex },
      });
      setMonthTypes(res.byType || []);
      setMonthTotal(res.total || 0);
    } catch {
      setMonthTypes([]);
      setMonthTotal(0);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-6" style={{ height: 280 }}>
        <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">Tren Laporan per Bulan ({new Date().getFullYear()})</h3>
        {!selectedMonth && (
          <span className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-semibold text-orange-600">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Klik bar untuk lihat detail bencana
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={28}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              fontSize: 12,
            }}
            formatter={(val) => [`${val} laporan`, "Jumlah"]}
            cursor={{ fill: "rgba(249,115,22,0.08)" }}
          />
          <Bar
            dataKey="jumlah"
            radius={[4, 4, 0, 0]}
            onClick={(entry) => handleBarClick(entry.monthIndex, entry.name)}
            style={{ cursor: "pointer" }}
          >
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={
                  selectedMonth === entry.monthIndex
                    ? "#ea580c"
                    : entry.jumlah > 0
                    ? "#f97316"
                    : "#e5e7eb"
                }
                opacity={
                  selectedMonth === entry.monthIndex
                    ? 1
                    : entry.jumlah > 0
                    ? 0.85
                    : 0.4
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Detail breakdown when a month is clicked */}
      {selectedMonth && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800">
                  Jenis Bencana — {MONTH_LABELS[selectedMonth - 1]}
                </h4>
                <span className="text-xs text-gray-400">
                  Total: <span className="font-semibold text-gray-600">{monthTotal}</span> laporan
                </span>
              </div>
              {monthTypes.length === 0 ? (
                <p className="py-4 text-center text-xs text-gray-400">
                  Tidak ada laporan pada bulan ini.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {monthTypes.map((item, idx) => {
                    const pct = monthTotal > 0 ? Math.round((item.jumlah / monthTotal) * 100) : 0;
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-700">
                          {item.name}
                        </span>
                        <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-orange-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 shrink-0 text-right text-xs font-bold text-gray-800">
                          {item.jumlah}
                        </span>
                        <span className="w-10 shrink-0 text-right text-[11px] text-gray-400">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ContactItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="mt-0.5 text-brand-400">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98]">
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
