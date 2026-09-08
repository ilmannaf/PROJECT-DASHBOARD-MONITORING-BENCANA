import { useState, useEffect, useCallback, useRef } from "react";
import waterDistributionService from "../../services/waterDistributionService";
import { isAdmin } from "../../services/authService";
import WaterDistributionMap from "../../components/WaterDistributionMap";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polygon } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import semarangGeojson from "../../assets/kota_semarang.json";
import {
  Droplets,
  Search,
  Plus,
  X,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit3,
  Map,
  List,
  Camera,
  FileText,
  MapPin,
  Activity,
  Settings,
} from "lucide-react";
import AnimatedNumber from "../../components/AnimatedNumber";
import { SkeletonTable } from "../../components/Skeleton";

const STATUS_OPTIONS = [
  { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-600" },
  { value: "dalam_proses", label: "Dalam Proses", color: "bg-blue-100 text-blue-600" },
  { value: "dibatalkan", label: "Dibatalkan", color: "bg-red-100 text-red-600" },
];

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

const SEMARANG_CENTER = [-6.997, 110.44];
const SEMARANG_ZOOM = 12;

const SEMARANG_RING = semarangGeojson.features[0].geometry.coordinates[0];
const SEMARANG_LATLNG = SEMARANG_RING.map(([lng, lat]) => [lat, lng]);

const SEMARANG_BOUNDS = L.latLngBounds(
  SEMARANG_LATLNG.map(([lat, lng]) => [lat, lng])
);

function RestrictFormMap() {
  const map = useMap();
  useEffect(() => {
    map.setMaxBounds(SEMARANG_BOUNDS.pad(0.1));
    map.setMinZoom(11);
    map.setMaxZoom(18);
    map.on("drag", () => {
      map.panInsideBounds(SEMARANG_BOUNDS.pad(0.1), { animate: false });
    });
  }, [map]);
  return null;
}

function FitMapToMarker({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView([parseFloat(position.lat), parseFloat(position.lng)], map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

async function geocodeAddress(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&limit=1`;
    const res = await fetch(url, { headers: { "User-Agent": "DashboardBencana/1.0" } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat).toFixed(4), lng: parseFloat(data[0].lon).toFixed(4) };
    }
  } catch (err) {
    console.error("Geocoding error:", err);
  }
  return null;
}

function LocationMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat.toFixed(4), lng: e.latlng.lng.toFixed(4) });
    },
  });
  return position ? (
    <Marker
      position={[parseFloat(position.lat), parseFloat(position.lng)]}
      icon={L.divIcon({
        html: `<div style="width:28px;height:28px;background:#0ea5e9;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })}
    />
  ) : null;
}

export default function WaterDistribution() {
  const adminUser = isAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [supplyInput, setSupplyInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    totalData: 0,
    inProcess: 0,
    selesai: 0,
    dibatalkan: 0,
    totalLiters: 0,
    totalSupply: 0,
    tersedia: 0,
    totalTanks: 0,
    totalKelurahan: 0,
    totalKecamatan: 0,
  });
  const [form, setForm] = useState({
    distribution_date: "",
    kelurahan: "",
    kecamatan: "",
    location_address: "",
    latitude: "",
    longitude: "",
    amount_liters: "",
    total_supply: "",
    notes: "",
    status: "selesai",
  });

  const geocodeTimerRef = useRef(null);

  const geocodeAndUpdate = useCallback(async (query, isDetailed = false) => {
    const result = await geocodeAddress(query);
    if (result) {
      setForm((prev) => ({ ...prev, latitude: result.lat, longitude: result.lng }));
    }
  }, []);

  useEffect(() => {
    if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);

    const { kelurahan, kecamatan, location_address } = form;

    if (location_address && location_address.length > 5) {
      geocodeTimerRef.current = setTimeout(() => {
        geocodeAndUpdate(`${location_address}, ${kecamatan}, Semarang, Jawa Tengah`, true);
      }, 800);
    } else if (kecamatan && kecamatan.length > 2) {
      geocodeTimerRef.current = setTimeout(() => {
        geocodeAndUpdate(`${kelurahan}, ${kecamatan}, Semarang, Jawa Tengah`, false);
      }, 800);
    } else if (kelurahan && kelurahan.length > 2) {
      geocodeTimerRef.current = setTimeout(() => {
        geocodeAndUpdate(`${kelurahan}, Semarang, Jawa Tengah`, false);
      }, 800);
    }

    return () => {
      if (geocodeTimerRef.current) clearTimeout(geocodeTimerRef.current);
    };
  }, [form.kelurahan, form.kecamatan, form.location_address, geocodeAndUpdate]);


  const loadItems = () => {
    setLoading(true);
    waterDistributionService
      .getWaterDistributions()
      .then(setItems)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 80);
      });
  };

  const loadSummary = () => {
    waterDistributionService
      .getDistributionSummary()
      .then((data) => {
        setSummary({
          totalData: parseInt(data.totalData) || 0,
          inProcess: parseInt(data.inProcess) || 0,
          selesai: parseInt(data.selesai) || 0,
          dibatalkan: parseInt(data.dibatalkan) || 0,
          totalLiters: parseInt(data.totalLiters) || 0,
          totalSupply: parseInt(data.totalSupply) || 0,
          tersedia: parseInt(data.tersedia) || 0,
          totalTanks: parseInt(data.totalTanks) || 0,
          totalKelurahan: parseInt(data.totalKelurahan) || 0,
          totalKecamatan: parseInt(data.totalKecamatan) || 0,
        });
      })
      .catch(console.error);
  };

  const handleOpenSupplyModal = async () => {
    try {
      const settings = await waterDistributionService.getSupplySettings();
      setSupplyInput(settings.total_supply || 0);
      setShowSupplyModal(true);
    } catch {
      setSupplyInput("");
      setShowSupplyModal(true);
    }
  };

  const handleSaveSupply = async () => {
    const value = parseInt(supplyInput);
    if (isNaN(value) || value < 0) {
      alert("Masukkan angka yang valid");
      return;
    }
    try {
      await waterDistributionService.updateSupplySettings({ total_supply: value });
      setShowSupplyModal(false);
      loadSummary();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan total persediaan");
    }
  };

  useEffect(() => {
    loadItems();
    loadSummary();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      distribution_date: "",
      kelurahan: "",
      kecamatan: "",
      location_address: "",
      latitude: "",
      longitude: "",
      amount_liters: "",
      total_supply: "",
      notes: "",
      status: "selesai",
    });
    setShowForm(false);
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseInt(form.amount_liters) || 0;
    if (amount > 5000) {
      alert("Jumlah air maksimal 5.000 liter");
      return;
    }
    try {
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude) || null,
        longitude: parseFloat(form.longitude) || null,
        amount_liters: amount,
        total_supply: parseInt(form.total_supply) || 0,
      };
      if (editId) {
        await waterDistributionService.updateWaterDistribution(editId, payload);
      } else {
        await waterDistributionService.createWaterDistribution(payload);
      }
      resetForm();
      loadItems();
      loadSummary();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan data distribusi");
    }
  };

  const handleEdit = (item) => {
    setForm({
      distribution_date: item.distribution_date || "",
      kelurahan: item.kelurahan || "",
      kecamatan: item.kecamatan || "",
      location_address: item.location_address || "",
      latitude: item.latitude || "",
      longitude: item.longitude || "",
      amount_liters: item.amount_liters || "",
      total_supply: item.total_supply || "",
      notes: item.notes || "",
      status: item.status || "selesai",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await waterDistributionService.updateWaterDistributionStatus(id, { status });
      loadItems();
      loadSummary();
    } catch {
      alert("Gagal update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus data distribusi ini?")) return;
    try {
      await waterDistributionService.deleteWaterDistribution(id);
      loadItems();
      loadSummary();
    } catch {
      alert("Gagal menghapus data");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const detail = await waterDistributionService.getWaterDistributionById(id);
      setShowDetail(detail);
    } catch {
      alert("Gagal memuat detail");
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.kelurahan?.toLowerCase().includes(q) ||
      item.location_address?.toLowerCase().includes(q) ||
      item.kecamatan?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const formatNumber = (num) => {
    return Number(num)?.toLocaleString('id-ID') || "0";
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pendistribusian Air Bersih</h1>
              <p className="text-gray-500 text-sm mt-0.5">Pantau dan kelola distribusi air bersih ke daerah terdampak bencana</p>
            </div>
          </div>
        </div>
        {adminUser && (
          <button
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/25 px-5 py-3"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Tutup Form" : "Tambah Distribusi"}
          </button>
        )}
      </div>

      {/* Header Info Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 mb-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Droplets className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">DISTRIBUSI AIR BERSIH</h2>
            <p className="text-blue-100 text-sm mt-1">Pendistribusian air bersih untuk masyarakat terdampak bencana di wilayah Semarang</p>
          </div>
        </div>
      </div>

      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editId ? "Edit Data Distribusi" : "Formulir Pendistribusian Air Bersih"}
            </h2>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Distribusi <span className="text-red-500">*</span></label>
              <input type="date" name="distribution_date" value={form.distribution_date} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kelurahan <span className="text-red-500">*</span></label>
              <input name="kelurahan" value={form.kelurahan} onChange={handleChange} required placeholder="Nama kelurahan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kecamatan <span className="text-red-500">*</span></label>
              <input name="kecamatan" value={form.kecamatan} onChange={handleChange} required placeholder="Nama kecamatan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lokasi <span className="text-red-500">*</span></label>
              <input name="location_address" value={form.location_address} onChange={handleChange} required placeholder="Alamat lokasi distribusi" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
              <input type="number" step="0.0001" name="latitude" value={form.latitude} onChange={handleChange} placeholder="Contoh: -6.997" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
              <input type="number" step="0.0001" name="longitude" value={form.longitude} onChange={handleChange} placeholder="Contoh: 110.44" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Lokasi di Peta <span className="text-gray-400 font-normal">(klik pada peta untuk mengisi koordinat)</span></label>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: "300px" }}>
                <MapContainer
                  center={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : SEMARANG_CENTER}
                  zoom={form.latitude && form.longitude ? 15 : SEMARANG_ZOOM}
                  className="w-full h-full"
                  style={{ height: "100%", width: "100%" }}
                  worldCopyJump={false}
                  maxBoundsViscosity={1.0}
                >
                  <RestrictFormMap />
                  <FitMapToMarker position={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Polygon
                    positions={SEMARANG_LATLNG}
                    path={{ color: "#0ea5e9", weight: 2, dashArray: "8, 4", fillColor: "#0ea5e9", fillOpacity: 0.05 }}
                  />
                  <LocationMarker
                    position={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
                    onPositionChange={(pos) => setForm((prev) => ({ ...prev, latitude: pos.lat, longitude: pos.lng }))}
                  />
                </MapContainer>
              </div>
              {form.latitude && form.longitude && (
                <p className="text-xs text-gray-500 mt-2">
                  Koordinat: {form.latitude}, {form.longitude}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Air Didistribusikan (Liter)</label>
              <input type="number" name="amount_liters" value={form.amount_liters} onChange={handleChange} placeholder="Jumlah liter" max="5000" min="0" className={inputClass} />
              <p className="text-xs text-gray-400 mt-1">Maksimal 5.000 liter</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Catatan</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Catatan tambahan..." className={inputClass} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 btn btn-primary py-3.5">{editId ? "Perbarui" : "Simpan"}</button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Ringkasan Distribusi Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-600" />
          RINGKASAN DISTRIBUSI
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={summary.totalLiters || 0} /></p>
            <p className="text-xs text-gray-500 mt-1">Total Air Tersalurkan (Liter)</p>
          </div>
          <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.08s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={summary.totalTanks || 0} /></p>
            <p className="text-xs text-gray-500 mt-1">Total Tangki Air</p>
          </div>
          <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.16s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={summary.totalData || 0} /></p>
            <p className="text-xs text-gray-500 mt-1">Titik Distribusi</p>
          </div>
          <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.24s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={summary.totalKelurahan || 0} /></p>
            <p className="text-xs text-gray-500 mt-1">Kelurahan Penerima</p>
          </div>
          <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.32s" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={summary.totalKecamatan || 0} /></p>
            <p className="text-xs text-gray-500 mt-1">Kecamatan Terdampak</p>
          </div>
        </div>
      </div>

      {/* Total Persediaan Air Bersih Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-600" />
            TOTAL PERSEDIAAN AIR BERSIH
          </h2>
          {adminUser && (
            <button
              onClick={handleOpenSupplyModal}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
              Atur Persediaan
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Droplets className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-extrabold">{formatNumber(summary.totalSupply)} Liter</p>
                <p className="text-blue-100 text-sm mt-1">Total Persediaan</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <p className="text-3xl font-extrabold">{formatNumber(summary.tersedia)} Liter</p>
                <p className="text-green-100 text-sm mt-1">Tersedia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rasio Distribusi Section */}
      <div className="mb-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            RASIO DISTRIBUSI
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Air Terdistribusi</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatNumber(summary.totalLiters || 0)} / {formatNumber(summary.totalSupply || 0)} Liter
                </span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${summary.totalSupply > 0 ? Math.min((summary.totalLiters / summary.totalSupply) * 100, 100) : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {summary.totalSupply > 0
                  ? `${((summary.totalLiters / summary.totalSupply) * 100).toFixed(1)}% dari total persediaan sudah didistribusikan`
                  : "Atur total persediaan untuk melihat rasio"}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-lg font-extrabold text-green-600">{formatNumber(summary.totalLiters || 0)}</p>
                <p className="text-xs text-green-600 mt-1">Terdistribusi</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <p className="text-lg font-extrabold text-blue-600">{formatNumber(summary.tersedia || 0)}</p>
                <p className="text-xs text-blue-600 mt-1">Tersisa</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-extrabold text-gray-600">{formatNumber(summary.totalSupply || 0)}</p>
                <p className="text-xs text-gray-600 mt-1">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Map className="w-5 h-5 text-blue-600" />
          PETA DISTRIBUSI
        </h2>
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden h-[650px]">
          {loading ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="animate-pulse text-gray-400">Memuat peta...</div>
            </div>
          ) : (
            <WaterDistributionMap items={filteredItems} onItemClick={(item) => setShowDetail(item)} />
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <List className="w-5 h-5 text-blue-600" />
            DAFTAR DISTRIBUSI
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelurahan, lokasi, atau kecamatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition text-sm w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kelurahan</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kecamatan</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Lokasi</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Liter</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <SkeletonTable rows={5} cols={7} />
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const statusInfo = STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={item.id} className="hover:bg-cyan-50/40 transition-colors group">
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {item.distribution_date ? new Date(item.distribution_date).toLocaleDateString("id-ID") : "-"}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900 text-sm">{item.kelurahan}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{item.kecamatan || "-"}</td>
                      <td className="py-4 px-6 text-sm text-gray-600 max-w-xs truncate">{item.location_address || "-"}</td>
                      <td className="py-4 px-6 text-center text-sm font-medium text-gray-700">{item.amount_liters || "-"}</td>
                      <td className="py-4 px-6 text-center">
                        {adminUser ? (
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color} border-0 cursor-pointer focus:ring-2 focus:ring-brand-500`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleViewDetail(item.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Detail">
                            <Eye className="w-4 h-4" />
                          </button>
                          {adminUser && (
                            <>
                              <button onClick={() => handleEdit(item)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Droplets className="w-10 h-10 text-gray-300" />
                      <div>
                        <p className="text-lg font-semibold text-gray-700">
                          {searchTerm ? "Tidak ada hasil" : "Belum ada data pendistribusian"}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          {searchTerm ? "Coba ubah kata kunci" : 'Klik "Tambah Distribusi" untuk memulai'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply Settings Modal */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowSupplyModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Atur Total Persediaan Air
              </h3>
              <button onClick={() => setShowSupplyModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Persediaan (Liter)</label>
                <input
                  type="number"
                  value={supplyInput}
                  onChange={(e) => setSupplyInput(e.target.value)}
                  placeholder="Masukkan total persediaan air"
                  className={inputClass}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Total persediaan air bersih yang tersedia. Sisa akan dihitung otomatis: Total - Sudah Didistribusikan.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveSupply} className="flex-1 btn btn-primary py-3">
                  Simpan
                </button>
                <button onClick={() => setShowSupplyModal(false)} className="btn btn-secondary py-3 px-6">
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50" style={{ zIndex: 9999 }} onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[85vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDetail(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition z-10">
              <X className="w-5 h-5" />
            </button>
            <div className="pr-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Detail Pendistribusian Air Bersih</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="font-semibold text-gray-700">Tanggal:</span> <span>{showDetail.distribution_date ? new Date(showDetail.distribution_date).toLocaleDateString("id-ID") : "-"}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-gray-700">Kelurahan:</span> <span>{showDetail.kelurahan || "-"}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-gray-700">Kecamatan:</span> <span>{showDetail.kecamatan || "-"}</span></div>
              <div><span className="font-semibold text-gray-700">Alamat Lokasi:</span> <span>{showDetail.location_address || "-"}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-gray-700">Koordinat:</span> <span>{showDetail.latitude ? `${parseFloat(showDetail.latitude).toFixed(4)}, ${parseFloat(showDetail.longitude).toFixed(4)}` : "-"}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-gray-700">Jumlah Air Didistribusikan:</span> <span>{showDetail.amount_liters || "-"} Liter</span></div>
              <div className="flex justify-between"><span className="font-semibold text-gray-700">Total Persediaan:</span> <span>{showDetail.total_supply || "-"} Liter</span></div>
              <div><span className="font-semibold text-gray-700">Catatan:</span> <span>{showDetail.notes || "-"}</span></div>
              <div><span className="font-semibold text-gray-700">Dibuat oleh:</span> <span>{showDetail.created_by_name || "-"}</span></div>
              {showDetail.created_at && (
                <div><span className="font-semibold text-gray-700">Dibuat:</span> <span>{new Date(showDetail.created_at).toLocaleString("id-ID")}</span></div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
