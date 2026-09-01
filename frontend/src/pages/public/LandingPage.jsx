import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Phone, Mail, MapPin, Clock, Shield, CheckCircle, Star,
  Waves, Mountain, Flame, Tornado, CloudRain, TreePine,
  AlertTriangle, Zap, ArrowRight,
} from "lucide-react";
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

function LatestReportCard() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get("/reports/public").then(({ data }) => {
      if (!cancelled && Array.isArray(data) && data.length > 0) {
        setLatest(data[0]);
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!latest) return null;

  const statusConfig = {
    baru: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", label: "Baru" },
    diverifikasi: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Diverifikasi" },
    ditindaklanjuti: { bg: "bg-brand-100", text: "text-brand-700", dot: "bg-brand-500", label: "Ditindaklanjuti" },
    selesai: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Selesai" },
  };

  const disasterIconMap = {
    Banjir: <Waves className="h-4 w-4 text-blue-500" />,
    "Tanah Longsor": <Mountain className="h-4 w-4 text-amber-600" />,
    "Gempa Bumi": <AlertTriangle className="h-4 w-4 text-red-500" />,
    Kebakaran: <Flame className="h-4 w-4 text-orange-500" />,
    "Angin Kencang": <Tornado className="h-4 w-4 text-purple-500" />,
    "Cuaca Ekstrem": <CloudRain className="h-4 w-4 text-indigo-500" />,
    "Pohon Tumbang": <TreePine className="h-4 w-4 text-green-600" />,
    Lainnya: <Zap className="h-4 w-4 text-gray-500" />,
  };

  const sc = statusConfig[latest.status] || statusConfig.baru;

  return (
    <div className="hero-float-right hero-delay-2 absolute bottom-4 right-4 w-[210px] overflow-hidden rounded-xl border border-white/60 bg-white/95 shadow-xl shadow-black/10 backdrop-blur-sm sm:bottom-6 sm:right-6 sm:w-[230px]">
      {latest.photo_url && (
        <div className="relative h-20 w-full overflow-hidden">
          <img
            src={latest.photo_url}
            alt={latest.disaster_type}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-gray-800 shadow-sm backdrop-blur-sm">
            <Clock className="h-3 w-3 text-brand-500" />
            Baru saja
          </div>
        </div>
      )}
      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Laporan Terbaru</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gray-100">
            {disasterIconMap[latest.disaster_type] || <Zap className="h-4 w-4 text-gray-500" />}
          </span>
          <span className="text-[13px] font-semibold text-gray-900 truncate">{latest.disaster_type}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${sc.bg} ${sc.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`}></span>
            {sc.label}
          </span>
        </div>
      </div>
    </div>
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
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-brand-100/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/assets/logo-bpbd.jpg"
              alt="Logo BPBD Kota Semarang"
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-sm font-bold text-gray-900">BPBD Kota Semarang</span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            <button
              onClick={() => navigate("/tentang")}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-brand-50 hover:text-brand-700"
            >
              Tentang Kami
            </button>
            <span className="text-gray-300 text-[10px]">•</span>
            <button
              onClick={() => navigate("/statistik")}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-brand-50 hover:text-brand-700"
            >
              Statistik
            </button>
            <span className="text-gray-300 text-[10px]">•</span>
            <button
              onClick={() => scrollToSection("kontak")}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-gray-600 transition hover:bg-brand-50 hover:text-brand-700"
            >
              Kontak
            </button>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => navigate("/admin/login")}
              className="rounded-full bg-brand-600 px-5 py-1.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-600/25 transition-all duration-200 hover:bg-brand-700 hover:shadow-md"
            >
              Login Admin
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
            <button
              onClick={() => { navigate("/tentang"); setMobileMenuOpen(false); }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => { navigate("/statistik"); setMobileMenuOpen(false); }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
            >
              Statistik
            </button>
            <button
              onClick={() => { scrollToSection("kontak"); setMobileMenuOpen(false); }}
              className="block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-brand-50 hover:text-brand-700"
            >
              Kontak
            </button>
            <button
              onClick={() => { navigate("/admin/login"); setMobileMenuOpen(false); }}
              className="mt-2 block w-full rounded-full bg-brand-600 py-2.5 text-sm font-semibold text-white"
            >
              Login Admin
            </button>
          </div>
        )}
      </nav>

      {/* ===== HERO CARD ===== */}
      <section className="px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-orange-50/60 to-amber-50 shadow-lg shadow-brand-200/40 ring-1 ring-brand-100/50">
          <div className="flex flex-col lg:flex-row">
            {/* Left Column — Text & CTA */}
            <div className="flex flex-col justify-center px-8 py-10 sm:px-10 lg:w-[45%] lg:px-12 lg:py-14">
              {/* Badge */}
              <div className="hero-float-up hero-delay-1 mb-5 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-sm shadow-brand-600/30">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  24/7 Siaga
                </span>
                <button
                  onClick={() => navigate("/statistik")}
                  className="text-[13px] font-semibold text-brand-600 underline decoration-brand-300 underline-offset-2 transition hover:text-brand-700 hover:decoration-brand-600"
                >
                  Lihat Statistik
                </button>
              </div>

              {/* Title */}
              <div className="hero-float-up hero-delay-2">
                <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl xl:text-8xl">
                  Siaga
                  <span className="relative inline-block text-brand-600">
                    +
                    <span className="absolute -top-1.5 -right-2 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-brand-400 to-orange-400"></span>
                  </span>
                </h1>
              </div>

              {/* Divider */}
              <div className="hero-float-up hero-delay-3 my-5 h-px w-full bg-gradient-to-r from-brand-300 via-brand-200 to-transparent"></div>

              {/* Description */}
              <p className="hero-float-up hero-delay-3 max-w-md text-[15px] leading-relaxed text-gray-500">
                Laporkan kejadian bencana dan pantau penanganannya secara real-time bersama BPBD Kota Semarang — cepat, akurat, dan transparan.
              </p>

              {/* Testimonial row */}
              <div className="hero-float-up hero-delay-4 mt-5 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 ring-2 ring-white">
                    <Shield className="h-3.5 w-3.5 text-brand-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">Dipercaya warga Semarang</span>
                </div>
                <div className="h-3.5 w-px bg-gray-200"></div>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-gray-900">4.9</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </div>
              </div>

              {/* CTA buttons */}
              <div className="hero-float-up hero-delay-5 mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate("/lapor")}
                  className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all duration-200 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Laporkan Sekarang — Gratis
                </button>
                <button
                  onClick={() => navigate("/statistik")}
                  className="group flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700"
                >
                  Lihat Statistik
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Right Column — Visual */}
            <div className="relative lg:w-[55%]">
              <div className="relative h-[320px] sm:h-[400px] lg:h-full lg:min-h-[540px]">
                {/* Main photo */}
                <img
                  src="/assets/hero-bpbd.jpg"
                  alt="Kegiatan BPBD Kota Semarang"
                  className="h-full w-full rounded-b-3xl object-cover lg:rounded-3xl lg:rounded-l-none lg:rounded-r-none"
                  onError={(e) => {
                    e.target.src = "/assets/BPBD KOTA SEMARANG.jpeg";
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 rounded-b-3xl bg-gradient-to-r from-brand-600/15 via-transparent to-orange-400/10 lg:rounded-3xl lg:rounded-l-none lg:rounded-r-none"></div>
                <div className="absolute inset-0 rounded-b-3xl bg-gradient-to-t from-black/25 via-transparent to-transparent lg:rounded-3xl lg:rounded-l-none lg:rounded-r-none"></div>

                {/* Floating Badge 1 — top left area */}
                <div className="hero-float-left hero-delay-1 absolute top-5 left-5 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg shadow-emerald-500/10 backdrop-blur-sm ring-1 ring-emerald-100/60 sm:top-8 sm:left-8">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle className="h-3 w-3" />
                  </span>
                  <span className="text-[12px] font-semibold text-gray-800">Laporan Terverifikasi</span>
                </div>

                {/* Floating Badge 2 — mid right */}
                <div className="hero-float-left hero-delay-2 absolute top-24 right-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg shadow-brand-500/10 backdrop-blur-sm ring-1 ring-brand-100/60 sm:top-28 sm:right-8" style={{ transform: "rotate(-2deg)" }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Shield className="h-3 w-3" />
                  </span>
                  <span className="text-[12px] font-semibold text-gray-800">Petugas Siaga</span>
                </div>

                {/* Floating Stats Card — top right */}
                <div className="hero-float-right hero-delay-1 absolute top-4 right-4 overflow-hidden rounded-2xl bg-white/95 shadow-xl shadow-brand-500/10 backdrop-blur-sm ring-1 ring-brand-100/40 sm:top-6 sm:right-6">
                  <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-br from-brand-100 to-orange-100"></div>
                  <div className="relative p-4 sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">— HINGGA</p>
                    <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                      <AnimatedNumber value={60} duration={1800} />%
                    </p>
                    <p className="mt-1 text-[11px] font-medium text-gray-500">Respons lebih cepat bulan ini</p>
                  </div>
                </div>

                {/* Floating Latest Report Card — bottom right */}
                <LatestReportCard />
              </div>
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
            <div className="reveal relative">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-brand-200/30 to-orange-200/30 blur-xl" />
              <img
                src="/assets/BPBD KOTA SEMARANG.jpeg"
                alt="Kantor BPBD Kota Semarang"
                className="relative w-full rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 object-cover"
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

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-orange-500 py-20 text-white">
        {/* Curved top */}
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] rotate-180">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="white" />
          </svg>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 h-[350px] w-[350px] rounded-full bg-white/[0.06] blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 h-[200px] w-[200px] rounded-full bg-amber-400/5 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        </div>

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Siap Tanggap 24/7
          </div>

          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl xl:text-5xl">
            Ada Kejadian Bencana?
          </h2>
          <p className="mx-auto max-w-lg text-sm text-white/70 lg:text-base">
            Setiap detik berharga dalam situasi darurat. Tim BPBD siap membantu Anda kapan saja.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/lapor")}
              className="group flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-brand-700 shadow-lg shadow-black/10 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]"
            >
              <svg className="h-4 w-4 text-brand-600 transition-transform group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Buat Laporan
            </button>
            <button
              onClick={() => navigate("/peta")}
              className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:border-white/50 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97]"
            >
              <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Lihat Peta
            </button>
          </div>

          <div className="mt-8 inline-flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-6 py-3 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">Hubungi Darurat</p>
              <p className="text-lg font-extrabold tracking-tight">
                <span className="text-white">112</span>
                <span className="mx-1.5 text-white/40">/</span>
                <span className="text-white">0812-3456-7890</span>
              </p>
            </div>
          </div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-[calc(100%+2px)] h-[50px] lg:h-[60px]" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z" fill="#111827" />
          </svg>
        </div>
      </section>

      {/* ===== SECTION: KONTAK ===== */}
      <section id="kontak" className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 py-20 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 h-[300px] w-[300px] rounded-full bg-brand-500/[0.03] blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-[250px] w-[250px] rounded-full bg-orange-500/[0.03] blur-3xl" />
        </div>
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
              <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/15 to-red-600/10 p-6 backdrop-blur-sm">
                <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-red-500/10 blur-2xl" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2 text-red-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">Kontak Darurat</span>
                  </div>
                  <p className="text-3xl font-extrabold tracking-tight text-white">112</p>
                  <p className="mt-1 text-sm text-gray-400">Nomor darurat nasional — hubungi segera saat bencana</p>
                  <div className="my-3 h-px bg-gradient-to-r from-red-500/30 via-red-500/10 to-transparent" />
                  <p className="text-lg font-bold text-white">0812-3456-7890</p>
                  <p className="text-xs text-gray-400">Hotline BPBD Kota Semarang</p>
                </div>
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

            <div className="reveal overflow-hidden rounded-2xl border border-white/10 shadow-lg shadow-black/20" style={{ minHeight: 380 }}>
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

      <footer className="relative bg-gray-900 text-gray-400">
        <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-brand-500/30 to-transparent" />
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
                  <button onClick={() => navigate("/statistik")} className="transition hover:text-white">
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

function ContactItem({ icon, label, value }) {
  return (
    <div className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:border-white/20">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 transition-colors group-hover:bg-brand-500/25 group-hover:text-brand-300">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-gradient-to-br from-brand-500 to-orange-500 opacity-[0.06] blur-2xl transition-all duration-500 group-hover:opacity-[0.12] group-hover:scale-125" />
      <div className="relative">
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-orange-500 text-white shadow-sm shadow-brand-500/20">
          {icon}
        </div>
        <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-brand-500 to-orange-500 opacity-0 transition-opacity duration-300 group-hover:opacity-50" />
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <li className="flex items-start gap-2.5 rounded-xl p-2.5 transition-colors hover:bg-brand-50/50">
      <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <span className="text-sm text-gray-600">{text}</span>
    </li>
  );
}
