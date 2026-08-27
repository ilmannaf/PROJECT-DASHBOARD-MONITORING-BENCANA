import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polygon, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";
import semarangGeojson from "../../assets/kota_semarang.json";
import { smabData } from "../../data/smabData";
import { katanaData } from "../../data/katanaData";

// Kota Semarang - center agar seluruh kota terlihat
const SEMARANG_CENTER = [-7.005, 110.4381];
const SEMARANG_ZOOM = 11;

// Batas administratif resmi Kota Semarang (BPS/WFP/OCHA via geoBoundaries)
const KOTA_SEMARANG_GEOJSON = semarangGeojson;
const SEMARANG_RING = semarangGeojson.features[0].geometry.coordinates[0]; // [[lng, lat], ...]
const SEMARANG_LATLNG = SEMARANG_RING.map(([lng, lat]) => [lat, lng]);
const SEMARANG_BOUNDS = L.latLngBounds(SEMARANG_LATLNG);
const SEMARANG_MAX_BOUNDS = SEMARANG_BOUNDS.pad(0.06);

// Mask yang menutupi seluruh dunia KECUALI wilayah Kota Semarang (lubang)
const WORLD_RECT = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

// Titik berada di dalam Kota Semarang (ray casting)
function pointInSemarang(lat, lng) {
  let inside = false;
  for (let i = 0, j = SEMARANG_RING.length - 1; i < SEMARANG_RING.length; j = i++) {
    const [xi, yi] = SEMARANG_RING[i];
    const [xj, yj] = SEMARANG_RING[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function FitSemarang() {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!fitted.current) {
      fitted.current = true;
      map.fitBounds(SEMARANG_BOUNDS, { padding: [12, 12] });
    }
  }, [map]);
  return null;
}

const STATUS_META = {
  baru: { label: "Baru", color: "#ef4444", bg: "bg-red-100 text-red-700 border-red-200" },
  diverifikasi: { label: "Diverifikasi", color: "#eab308", bg: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  ditindaklanjuti: { label: "Ditindaklanjuti", color: "#3b82f6", bg: "bg-blue-100 text-blue-700 border-blue-200" },
  selesai: { label: "Selesai", color: "#22c55e", bg: "bg-green-100 text-green-700 border-green-200" },
};

// Warna marker berdasarkan disaster_type — brand-consistent
const DISASTER_META = {
  Banjir: { color: "#0ea5e9", label: "Banjir", bg: "bg-sky-500" },
  Longsor: { color: "#795548", label: "Longsor", bg: "bg-[#795548]" },
  Kebakaran: { color: "#e53935", label: "Kebakaran", bg: "bg-red-500" },
  "Angin Puting Beliung": { color: "#8e24aa", label: "Angin Puting Beliung", bg: "bg-purple-600" },
  "Gempa Bumi": { color: "#f59e0b", label: "Gempa Bumi", bg: "bg-amber-500" },
  Lainnya: { color: "#616161", label: "Lainnya", bg: "bg-gray-500" },
};

const ALL_TYPES = ["Banjir", "Longsor", "Kebakaran", "Angin Puting Beliung", "Gempa Bumi", "Lainnya"];
const ALL_STATUS = ["baru", "diverifikasi", "ditindaklanjuti", "selesai"];

function getColorForType(type) {
  return DISASTER_META[type]?.color || DISASTER_META["Lainnya"].color;
}

function createDivIcon(type) {
  const color = getColorForType(type);
  const html = `
    <div style="
      width:32px;height:32px;
      background:${color};
      border:3px solid white;
      border-radius:50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    ">
      <span style="
        transform: rotate(45deg);
        color:white;
        font-size:14px;
        line-height:1;
        display:flex;
      ">${getEmojiForType(type)}</span>
    </div>
  `;
  return L.divIcon({
    html,
    className: "custom-div-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function getEmojiForType(type) {
  switch (type) {
    case "Banjir": return "🌊";
    case "Longsor": return "⛰️";
    case "Kebakaran": return "🔥";
    case "Angin Puting Beliung": return "🌪️";
    case "Gempa Bumi": return "🏚️";
    default: return "⚠️";
  }
}

function formatDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

export default function DisasterMap() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(true);
  const [mapMode, setMapMode] = useState("bencana"); // bencana | smab | katana
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowStats(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const { data } = await api.get("/reports/public");
        if (mounted) setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || "Gagal memuat data peta");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const toggleType = (type) => {
    setSelectedTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };
  const toggleStatus = (status) => {
    setSelectedStatus((prev) => prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]);
  };
  const resetFilter = () => {
    setSelectedTypes([]);
    setSelectedStatus([]);
  };

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const lat = parseFloat(r.latitude);
      const lng = parseFloat(r.longitude);
      if (isNaN(lat) || isNaN(lng)) return false;
      if (!pointInSemarang(lat, lng)) return false;
      if (selectedTypes.length > 0 && !selectedTypes.includes(r.disaster_type)) return false;
      if (selectedStatus.length > 0 && !selectedStatus.includes(r.status)) return false;
      return true;
    });
  }, [reports, selectedTypes, selectedStatus]);

  const stats = useMemo(() => {
    const total = filteredReports.length;
    const perType = {};
    ALL_TYPES.forEach((t) => { perType[t] = 0; });
    filteredReports.forEach((r) => {
      const key = DISASTER_META[r.disaster_type] ? r.disaster_type : "Lainnya";
      perType[key] = (perType[key] || 0) + 1;
    });
    const perStatus = {};
    ALL_STATUS.forEach((s) => { perStatus[s] = 0; });
    filteredReports.forEach((r) => {
      if (perStatus[r.status] !== undefined) perStatus[r.status] += 1;
    });
    return { total, perType, perStatus };
  }, [filteredReports]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              aria-label="Toggle filter"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            </button>
            <img src="/assets/logo-bpbd.jpg" alt="Logo BPBD" className="h-9 w-9 rounded-lg object-cover hidden sm:block" />
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-gray-900 leading-tight">
                {mapMode === "bencana" && "Peta Sebaran Bencana"}
                {mapMode === "smab" && "Peta SMAB (Satuan Pendidikan Aman Bencana)"}
                {mapMode === "katana" && "Peta KATANA (FPRB Kelurahan)"}
                {" "}- BPBD Kota Semarang
              </h1>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                {mapMode === "bencana" && "Monitoring lokasi kejadian bencana secara real-time"}
                {mapMode === "smab" && "Peta sekolah/madrasah aman bencana di Kota Semarang"}
                {mapMode === "katana" && "Peta forum penanggulangan risiko bencana kelurahan"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setMapMode("bencana")}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                  mapMode === "bencana"
                    ? "bg-brand-100 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Bencana
              </button>
              <button
                onClick={() => setMapMode("smab")}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                  mapMode === "smab"
                    ? "bg-brand-100 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                SMAB
              </button>
              <button
                onClick={() => setMapMode("katana")}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition ${
                  mapMode === "katana"
                    ? "bg-brand-100 text-brand-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                KATANA
              </button>
            </div>
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {mapMode === "bencana" && (loading ? "Memuat..." : `${filteredReports.length} titik`)}
              {mapMode === "smab" && `${smabData.length} lokasi`}
              {mapMode === "katana" && `${katanaData.length} lokasi`}
            </span>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-brand-600 bg-white border border-gray-200 hover:border-brand-200 rounded-lg px-3 sm:px-4 py-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Kembali</span>
              <span className="sm:hidden">Beranda</span>
            </button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <div className="flex flex-1 mx-auto w-full max-w-[1600px] gap-0 lg:gap-4 p-0 lg:p-4">
        {/* Sidebar Filter */}
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-[900] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
        )}
        <aside
           className={`
            fixed lg:static inset-y-0 left-0 z-[901] w-[300px] lg:w-[300px] shrink-0 bg-white border-r lg:border border-gray-200 lg:rounded-2xl shadow-xl lg:shadow-sm overflow-y-auto
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            top-[61px] lg:top-auto h-[calc(100vh-61px)] lg:h-auto lg:max-h-[calc(100vh-80px)] lg:sticky lg:self-start
          `}
        >
          <div className="p-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {mapMode === "bencana" ? "Filter Peta" : "Informasi"}
              </h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-gray-100">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mode Selector */}
            <div className="lg:hidden space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Mode Peta</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMapMode("bencana")}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition ${
                    mapMode === "bencana"
                      ? "bg-brand-100 text-brand-700 border border-brand-300"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Bencana
                </button>
                <button
                  onClick={() => setMapMode("smab")}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition ${
                    mapMode === "smab"
                      ? "bg-brand-100 text-brand-700 border border-brand-300"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  SMAB
                </button>
                <button
                  onClick={() => setMapMode("katana")}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg transition ${
                    mapMode === "katana"
                      ? "bg-brand-100 text-brand-700 border border-brand-300"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  KATANA
                </button>
              </div>
            </div>

            {/* Bencana Filters */}
            {mapMode === "bencana" && (
              <>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Jenis Bencana</h3>
                  <div className="space-y-2">
                    {ALL_TYPES.map((type) => {
                      const checked = selectedTypes.includes(type);
                      const meta = DISASTER_META[type];
                      return (
                        <label key={type} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition ${checked ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleType(type)}
                            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: meta.color }}></span>
                          <span className="text-sm font-medium text-gray-700 flex-1">{type}</span>
                          <span className="text-xs text-gray-400">{stats.perType[type] ?? 0}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Status Penanganan</h3>
                  <div className="space-y-2">
                    {ALL_STATUS.map((status) => {
                      const checked = selectedStatus.includes(status);
                      const meta = STATUS_META[status];
                      return (
                        <label key={status} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition ${checked ? "border-brand-300 bg-brand-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleStatus(status)}
                            className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: meta.color }}></span>
                          <span className="text-sm font-medium text-gray-700 flex-1 capitalize">{meta.label}</span>
                          <span className="text-xs text-gray-400">{stats.perStatus[status] ?? 0}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={resetFilter}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 hover:text-brand-700 bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-200 rounded-xl py-3 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filter
                </button>

                <div className="rounded-xl bg-gradient-to-br from-brand-50 to-orange-50 border border-brand-100 p-4">
                  <p className="text-xs font-bold text-brand-700 flex items-center gap-1.5 mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Privasi Terjaga
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed">Data pelapor (nama & no. HP) tidak ditampilkan di peta publik untuk menjaga privasi warga.</p>
                </div>
              </>
            )}

            {/* SMAB Info */}
            {mapMode === "smab" && (
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 p-4">
                <p className="text-xs font-bold text-blue-700 mb-2">SMAB - Satuan Pendidikan Aman Bencana</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">Peta menampilkan lokasi sekolah/madrasah yang telah terlatih dan tersertifikasi dalam penanggulangan bencana.</p>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>✓ Total SMAB: <span className="font-bold">{smabData.length}</span></p>
                  <p>✓ Klik marker untuk detail</p>
                </div>
              </div>
            )}

            {/* KATANA Info */}
            {mapMode === "katana" && (
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-4">
                <p className="text-xs font-bold text-emerald-700 mb-2">KATANA - FPRB Kelurahan</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">Peta menampilkan lokasi Forum Penanggulangan Risiko Bencana (FPRB) di tingkat kelurahan Kota Semarang.</p>
                <div className="text-xs space-y-1 text-gray-600">
                  <p>✓ Total KATANA: <span className="font-bold">{katanaData.length}</span></p>
                  <p>✓ Klik marker untuk detail</p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Map + Stats */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Map Card */}
          <div className="relative bg-white lg:rounded-2xl border-y lg:border border-gray-200 shadow-sm overflow-hidden">
            {/* Map */}
            <div className="relative h-[65vh] sm:h-[70vh] lg:h-[62vh] min-h-[380px] w-full">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                  <div className="w-10 h-10 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin mb-3"></div>
                  <p className="text-sm text-gray-500">Memuat peta...</p>
                </div>
              ) : error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 p-6 text-center">
                  <p className="text-sm text-red-600 mb-2">{error}</p>
                  <button onClick={() => window.location.reload()} className="text-sm font-semibold text-brand-600 hover:text-brand-700">Coba lagi</button>
                </div>
               ) : (
                <MapContainer
                  center={SEMARANG_CENTER}
                  zoom={SEMARANG_ZOOM}
                  minZoom={11}
                  maxZoom={18}
                  maxBounds={SEMARANG_MAX_BOUNDS}
                  maxBoundsViscosity={1.0}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitSemarang />
                  {/* Gelapkan area di luar Kota Semarang */}
                  <Polygon
                    positions={[WORLD_RECT, SEMARANG_LATLNG]}
                    pathOptions={{ stroke: false, fillColor: "#0f172a", fillOpacity: 0.35, fillRule: "evenodd" }}
                  />
                  {/* Garis batas resmi Kota Semarang */}
                  <GeoJSON
                    key="kota-semarang-boundary"
                    data={KOTA_SEMARANG_GEOJSON}
                    style={{ color: "#f97316", weight: 3, opacity: 0.9, fill: false }}
                  />
                  
                  {/* Markers Bencana */}
                  {mapMode === "bencana" && filteredReports.map((report) => {
                    const lat = parseFloat(report.latitude);
                    const lng = parseFloat(report.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    return (
                      <Marker
                        key={report.id}
                        position={[lat, lng]}
                        icon={createDivIcon(report.disaster_type)}
                      >
                        <Popup maxWidth={300} minWidth={240}>
                          <div className="space-y-2 text-sm leading-relaxed">
                            <div className="flex items-center justify-between gap-2">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full text-white" style={{ background: getColorForType(report.disaster_type) }}>
                                {report.disaster_type}
                              </span>
                              <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${STATUS_META[report.status]?.bg || "bg-gray-100 text-gray-600"}`}>
                                {STATUS_META[report.status]?.label || report.status}
                              </span>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Lokasi</p>
                              <p className="font-semibold text-gray-900">{report.address || "-"}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-400">Tanggal</p>
                                <p className="font-medium text-gray-700">{formatDate(report.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Koordinat</p>
                                <p className="font-mono text-xs text-gray-600">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                              </div>
                            </div>
                            {report.description && (
                              <div>
                                <p className="text-xs text-gray-400">Keterangan</p>
                                <p className="text-gray-700 line-clamp-3">{report.description}</p>
                              </div>
                            )}
                            {(report.photos?.length > 0 || report.photo_url) && (
                              <div>
                                <p className="text-xs text-gray-400">Foto ({(report.photos || [report.photo_url]).filter(Boolean).length})</p>
                                <div className="grid grid-cols-2 gap-1 mt-1">
                                  {(report.photos || [report.photo_url]).filter(Boolean).slice(0,5).map((url, idx) => (
                                    <img key={idx} src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api','')}${url}`} alt="" className="w-full h-20 object-cover rounded border" onError={(e)=> e.target.style.display='none'} />
                                  ))}
                                </div>
                              </div>
                            )}
                            {report.tracking_code && (
                              <p className="text-[11px] font-mono text-gray-400">Kode: {report.tracking_code}</p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Markers SMAB */}
                  {mapMode === "smab" && smabData.map((smab) => {
                    const lat = parseFloat(smab.latitude);
                    const lng = parseFloat(smab.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    const icon = L.divIcon({
                      html: `
                        <div style="
                          width:28px;height:28px;
                          background:#3b82f6;
                          border:2px solid white;
                          border-radius:50% 50% 50% 0;
                          transform: rotate(-45deg);
                          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                          display:flex;align-items:center;justify-content:center;
                        ">
                          <span style="
                            transform: rotate(45deg);
                            color:white;
                            font-size:13px;
                            line-height:1;
                            display:flex;
                          ">🏫</span>
                        </div>
                      `,
                      className: "custom-div-icon",
                      iconSize: [28, 28],
                      iconAnchor: [14, 28],
                      popupAnchor: [0, -28],
                    });
                    return (
                      <Marker key={`smab-${smab.id}`} position={[lat, lng]} icon={icon}>
                        <Popup maxWidth={300} minWidth={240}>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Nama Sekolah</p>
                              <p className="font-bold text-gray-900">{smab.nama_sekolah}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-400">Kecamatan</p>
                                <p className="font-medium text-gray-700">{smab.kecamatan}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Tahun</p>
                                <p className="font-medium text-gray-700">{smab.tahun_pembentukan}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Ancaman Bencana</p>
                              <p className="font-medium text-gray-700">{smab.ancaman_bencana}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Koordinat</p>
                              <p className="font-mono text-xs text-gray-600">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <p className="text-xs font-semibold text-blue-700">✓ Status: Sekolah Aman Bencana (SMAB)</p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {/* Markers KATANA */}
                  {mapMode === "katana" && katanaData.map((katana) => {
                    const lat = parseFloat(katana.latitude);
                    const lng = parseFloat(katana.longitude);
                    if (isNaN(lat) || isNaN(lng)) return null;
                    const icon = L.divIcon({
                      html: `
                        <div style="
                          width:28px;height:28px;
                          background:#10b981;
                          border:2px solid white;
                          border-radius:50% 50% 50% 0;
                          transform: rotate(-45deg);
                          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                          display:flex;align-items:center;justify-content:center;
                        ">
                          <span style="
                            transform: rotate(45deg);
                            color:white;
                            font-size:13px;
                            line-height:1;
                            display:flex;
                          ">🛡️</span>
                        </div>
                      `,
                      className: "custom-div-icon",
                      iconSize: [28, 28],
                      iconAnchor: [14, 28],
                      popupAnchor: [0, -28],
                    });
                    return (
                      <Marker key={`katana-${katana.id}`} position={[lat, lng]} icon={icon}>
                        <Popup maxWidth={300} minWidth={240}>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-xs text-gray-400 font-medium">Kelurahan</p>
                              <p className="font-bold text-gray-900">{katana.kelurahan}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <p className="text-xs text-gray-400">Kecamatan</p>
                                <p className="font-medium text-gray-700">{katana.kecamatan}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Pembentukan</p>
                                <p className="font-medium text-gray-700">{katana.pembentukan}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Ancaman Bencana</p>
                              <p className="font-medium text-gray-700">{katana.ancaman_bencana}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Sumber Dana</p>
                              <p className="font-medium text-gray-700">{katana.sumber_dana}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Koordinat</p>
                              <p className="font-mono text-xs text-gray-600">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                              <p className="text-xs font-semibold text-emerald-700">✓ Forum Penanggulangan Risiko Bencana Kelurahan</p>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              )}

              {/* Legend */}
              <div className="absolute z-[400] bottom-3 right-3 left-3 sm:left-auto sm:w-64">
                <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setLegendOpen(!legendOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-800 hover:bg-gray-50 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                      Legenda
                    </span>
                    <svg className={`w-4 h-4 text-gray-500 transition-transform ${legendOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {legendOpen && (
                    <div className="px-4 pb-3 border-t border-gray-100 pt-3">
                      {mapMode === "bencana" && (
                        <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
                          {ALL_TYPES.map((t) => (
                            <div key={t} className="flex items-center gap-2">
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shrink-0" style={{ background: getColorForType(t) }}></span>
                              <span className="text-xs font-medium text-gray-700">{t}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {mapMode === "smab" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center text-lg">🏫</span>
                            <span className="text-xs font-medium text-gray-700">Sekolah/Madrasah Aman Bencana</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Warna biru menunjukkan lokasi SMAB yang telah tersertifikasi dalam penanggulangan bencana.</p>
                        </div>
                      )}
                      {mapMode === "katana" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 flex items-center justify-center text-lg">🛡️</span>
                            <span className="text-xs font-medium text-gray-700">Forum Penanggulangan Risiko Bencana</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Warna hijau menunjukkan lokasi KATANA (FPRB Kelurahan) di Kota Semarang.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter count badge - mobile */}
              {!loading && !error && (
                <div className="absolute z-[400] top-3 left-3 bg-white/95 backdrop-blur rounded-full shadow border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  Menampilkan {filteredReports.length} dari {reports.length} laporan
                </div>
              )}
            </div>
          </div>

           {/* Statistik Ringkas */}
           <div className="px-4 lg:px-0">
            {mapMode === "bencana" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className={`map-stat bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col ${showStats ? 'show' : ''}`} style={{ transitionDelay: '0s' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-orange-600 text-white flex items-center justify-center shadow">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</span>
                    </div>
                    <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500">Laporan tampil</p>
                  </div>

                  {ALL_TYPES.slice(0, 3).map((type, i) => (
                    <div key={type} className={`map-stat bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition ${showStats ? 'show' : ''}`} style={{ transitionDelay: `${(i + 1) * 0.08}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow text-sm" style={{ background: getColorForType(type) }}>
                          {getEmojiForType(type)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 truncate max-w-[70px]">{type}</span>
                      </div>
                      <p className="text-2xl font-extrabold" style={{ color: getColorForType(type) }}>{stats.perType[type] || 0}</p>
                      <p className="text-xs text-gray-500">Laporan {type}</p>
                    </div>
                  ))}
                </div>

                {/* Breakdown full */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                      Breakdown per Jenis Bencana
                    </h3>
                    <div className="space-y-2">
                      {ALL_TYPES.map((type) => {
                        const count = stats.perType[type] || 0;
                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: getColorForType(type) }}></span>
                            <span className="text-sm text-gray-700 flex-1 truncate">{type}</span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: getColorForType(type) }}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Breakdown per Status
                    </h3>
                    <div className="space-y-2">
                      {ALL_STATUS.map((status) => {
                        const count = stats.perStatus[status] || 0;
                        const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                        const meta = STATUS_META[status];
                        return (
                          <div key={status} className="flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.color }}></span>
                            <span className="text-sm text-gray-700 flex-1 capitalize">{meta.label}</span>
                            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: meta.color }}></div>
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-6 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4 px-4">
                  Data bersumber dari laporan masyarakat terverifikasi • Klik marker untuk detail • Privasi pelapor dilindungi
                </p>
              </>
            )}

            {mapMode === "smab" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Statistik SMAB
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Total SMAB</span>
                        <span className="text-2xl font-bold text-blue-600">{smabData.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Kecamatan</span>
                        <span className="text-lg font-bold text-gray-900">{new Set(smabData.map(s => s.kecamatan)).size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Tahun Pembentukan
                    </h3>
                    <div className="space-y-2">
                      {[...new Set(smabData.map(s => s.tahun_pembentukan))].sort((a, b) => a - b).map((year) => {
                        const count = smabData.filter(s => s.tahun_pembentukan === year).length;
                        return (
                          <div key={year} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{year}</span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4 px-4">
                  SMAB = Satuan Pendidikan Aman Bencana • Klik marker untuk detail lokasi
                </p>
              </>
            )}

            {mapMode === "katana" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Statistik KATANA
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Total KATANA</span>
                        <span className="text-2xl font-bold text-emerald-600">{katanaData.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Kecamatan</span>
                        <span className="text-lg font-bold text-gray-900">{new Set(katanaData.map(k => k.kecamatan)).size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Tahun Pembentukan
                    </h3>
                    <div className="space-y-2">
                      {[...new Set(katanaData.map(k => k.pembentukan))].sort((a, b) => a - b).map((year) => {
                        const count = katanaData.filter(k => k.pembentukan === year).length;
                        return (
                          <div key={year} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{year}</span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4 px-4">
                  KATANA = Forum Penanggulangan Risiko Bencana Kelurahan • Klik marker untuk detail lokasi
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
