import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polygon, GeoJSON, useMapEvents, useMap } from "react-leaflet";
import { MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { submitReport } from "../../services/reportService";
import semarangGeojson from "../../assets/kota_semarang.json";

const DISASTER_TYPES = [
  { id: "Banjir", label: "Banjir", icon: "banjir" },
  { id: "Longsor", label: "Longsor", icon: "longsor" },
  { id: "Kebakaran", label: "Kebakaran", icon: "kebakaran" },
  { id: "Angin Puting Beliung", label: "Angin Puting Beliung", icon: "angin" },
  { id: "Gempa Bumi", label: "Gempa Bumi", icon: "gempa" },
  { id: "Lainnya", label: "Lainnya", icon: "lainnya" },
];

const SEMARANG_CENTER = [-7.005, 110.4381];
const SEMARANG_ZOOM = 11;
const MAX_PHOTOS = 5;

const KOTA_SEMARANG_GEOJSON = semarangGeojson;
const SEMARANG_RING = semarangGeojson.features[0].geometry.coordinates[0];
const SEMARANG_LATLNG = SEMARANG_RING.map(([lng, lat]) => [lat, lng]);
const SEMARANG_BOUNDS = L.latLngBounds(SEMARANG_LATLNG);
const SEMARANG_MAX_BOUNDS = SEMARANG_BOUNDS.pad(0.06);

const WORLD_RECT = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

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

// custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return location ? (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={markerIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          setLocation({ latitude: latlng.lat, longitude: latlng.lng });
        },
      }}
    />
  ) : null;
}

export default function ReportForm() {
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_phone: "",
    disaster_type: "",
    description: "",
    address: "",
  });
  const [photos, setPhotos] = useState([]); // [{file, preview}]
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [photoAnimKey, setPhotoAnimKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setShowForm(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotos = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      setError(`Maksimal ${MAX_PHOTOS} foto`);
      return;
    }
    const toAdd = selected.slice(0, remaining);
    // validate type & size
    const valid = [];
    for (const f of toAdd) {
      if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(f.type)) {
        setError("Format harus JPG/PNG/WEBP");
        continue;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`Foto ${f.name} melebihi 5MB`);
        continue;
      }
      valid.push({ file: f, preview: URL.createObjectURL(f) });
    }
    if (selected.length > remaining) {
      setError(`Hanya ${remaining} foto lagi yang bisa ditambahkan (maks ${MAX_PHOTOS})`);
    } else {
      setError("");
    }
    setPhotos((prev) => [...prev, ...valid].slice(0, MAX_PHOTOS));
    setPhotoAnimKey((k) => k + 1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[idx].preview);
      copy.splice(idx, 1);
      return copy;
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocation(loc);
        setLocating(false);
        setGpsSuccess(true);
        setTimeout(() => setGpsSuccess(false), 400);
        if (mapRef.current) {
          mapRef.current.setView([loc.latitude, loc.longitude], 15);
        }
      },
      () => {
        setLocating(false);
        setError("Gagal mendapatkan lokasi, silakan pilih titik di peta");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (photos.length > MAX_PHOTOS) {
      setError(`Maksimal ${MAX_PHOTOS} foto`);
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (location) {
        formData.append("latitude", location.latitude);
        formData.append("longitude", location.longitude);
      }
      photos.forEach((p) => formData.append("photos", p.file));
      const data = await submitReport(formData);
      // simpan tracking code ke localStorage agar muncul di Dashboard Publik walau anonim
      try {
        const key = 'myReportCodes';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (data.tracking_code && !existing.includes(data.tracking_code)) {
          existing.unshift(data.tracking_code);
          localStorage.setItem(key, JSON.stringify(existing.slice(0,20)));
        }
        const histKey = 'trackHistory';
        const hist = JSON.parse(localStorage.getItem(histKey) || '[]');
        if (data.tracking_code && !hist.includes(data.tracking_code)) {
          hist.unshift(data.tracking_code);
          localStorage.setItem(histKey, JSON.stringify(hist.slice(0,5)));
        }
      } catch {}
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setForm({ reporter_name: "", reporter_phone: "", disaster_type: "", description: "", address: "" });
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
    setLocation(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ReportHeader />
        <main className="max-w-xl mx-auto px-4 py-12 lg:py-16">
          <div className="result-bounce bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-6 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-3">
                <svg className="check-anim w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold text-white">Laporan Terkirim</h1>
              <p className="text-emerald-100 text-sm mt-1">Laporan Anda akan segera ditindaklanjuti</p>
            </div>
            <div className="p-5">
              <p className="text-xs text-gray-500 mb-2">Simpan kode ini untuk melacak status:</p>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-center mb-5">
                <p className="font-mono text-xl font-extrabold tracking-widest text-gray-900 scale-bounce-in" style={{ animationDelay: '0.3s' }}>{result.tracking_code}</p>
              </div>
              <div className="space-y-2">
                <a href={`/lacak?code=${result.tracking_code}`} className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 font-semibold text-sm transition hover:scale-[1.02] active:scale-[0.98]">Lacak Status</a>
                <button onClick={resetAll} className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition hover:scale-[1.02] active:scale-[0.98]">Kirim laporan lain</button>
              </div>
            </div>
          </div>
        </main>
        <ReportFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ReportHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className={`form-section mb-8 max-w-2xl ${showForm ? 'show' : ''}`}>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-full px-2.5 py-0.5 mb-3">Siaga Darurat</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Laporkan Kejadian Bencana</h1>
          <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">Isi formulir berikut sejelas mungkin. Tandai titik di peta agar petugas tepat lokasi.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <aside className={`form-section lg:col-span-2 space-y-4 order-2 lg:order-1 ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.12s' }}>
            <div className="bg-gray-900 rounded-xl text-white p-5 overflow-hidden">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div><p className="font-bold text-sm">Tanggap Darurat 24 Jam</p><p className="text-[10px] text-gray-400">BPBD Kota Semarang</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <p className="text-xl font-extrabold">112</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Call Center</p>
                </div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <p className="text-xl font-extrabold">24/7</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Siaga Bencana</p>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-900 text-sm mb-4">Setelah Anda melapor</h2>
              <ol className="space-y-3">
                {[
                  { title: "Laporan dicatat", desc: "Mendapat kode tracking unik." },
                  { title: "Diverifikasi petugas", desc: "Tim memverifikasi kejadian." },
                  { title: "Ditindaklanjuti", desc: "Koordinasi penanganan." },
                  { title: "Pantau status", desc: "Lacak melalui kode Anda." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-2.5">
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold flex items-center justify-center border border-brand-100 shrink-0">{i + 1}</span>
                      {i < 3 && <span className="w-px flex-1 bg-gray-200 my-0.5"></span>}
                    </div>
                    <div className="pb-0.5">
                      <p className="text-xs font-semibold text-gray-900">{s.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className={`form-section lg:col-span-3 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden order-1 lg:order-2 ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.2s' }}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Formulir Laporan</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Tanda * wajib diisi</p>
              </div>
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">Gratis</span>
            </div>

            <div className="p-5 space-y-5">
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 animate-fade-in">{error}</p>}

              <div className={`grid sm:grid-cols-2 gap-4 field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.28s' }}>
                <Field label="Nama Pelapor" required>
                  <div className="relative"><FieldIcon name="user" /><input name="reporter_name" value={form.reporter_name} onChange={handleChange} required placeholder="Nama lengkap Anda" className={inputClass} /></div>
                </Field>
                <Field label="Nomor HP / WhatsApp" optional>
                  <div className="relative"><FieldIcon name="phone" /><input name="reporter_phone" value={form.reporter_phone} onChange={handleChange} placeholder="08xx-xxxx-xxxx" type="tel" className={inputClass} /></div>
                </Field>
              </div>

              <div className={`field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.36s' }}>
                <Field label="Jenis Bencana" required>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {DISASTER_TYPES.map((t) => {
                      const active = form.disaster_type === t.id;
                      return (
                        <button key={t.id} type="button" onClick={() => setForm({ ...form, disaster_type: t.id })} className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] ${active ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20" : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50/40"}`}>
                          <DisasterIcon name={t.icon} active={active} /><span className="text-center leading-tight">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              <div className={`field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.44s' }}>
                <Field label="Deskripsi Kejadian" optional>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4} placeholder="Contoh: air mulai naik sekitar 50 cm, warga terdampak ±20 KK di RT 03/RW 02..." className={textareaClass} />
                </Field>
              </div>

              <div className={`field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.52s' }}>
                <Field label="Alamat / Lokasi" required>
                  <div className="relative"><FieldIcon name="pin" /><input name="address" value={form.address} onChange={handleChange} required placeholder="Jalan, RT/RW, kelurahan, kecamatan" className={inputClass} /></div>
                </Field>
              </div>

              {/* MAP PICKER - koordinat opsional tapi presisi */}
              <div className={`field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.60s' }}>
                <Field label="Titik Lokasi di Peta" optional>
                  <p className="text-xs text-gray-500 mb-2">Klik pada peta untuk menandai lokasi, geser marker untuk presisi. Boleh kosong jika tidak tahu koordinat — alamat tetap wajib.</p>
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <MapContainer
                      center={SEMARANG_CENTER}
                      zoom={SEMARANG_ZOOM}
                      minZoom={11}
                      maxBounds={SEMARANG_MAX_BOUNDS}
                      maxBoundsViscosity={1.0}
                      style={{ height: "300px", width: "100%" }}
                      ref={mapRef}
                      whenReady={(e) => { mapRef.current = e.target; }}
                    >
                      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <FitSemarang />
                      <Polygon positions={[WORLD_RECT, SEMARANG_LATLNG]} pathOptions={{ stroke: false, fillColor: "#0f172a", fillOpacity: 0.55, fillRule: "evenodd" }} />
                      <GeoJSON key="kota-semarang-boundary" data={KOTA_SEMARANG_GEOJSON} style={{ color: "#f97316", weight: 3, opacity: 0.9, fill: false }} />
                      <LocationPicker location={location} setLocation={setLocation} />
                    </MapContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button type="button" onClick={handleGetLocation} disabled={locating} className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-lg px-3.5 py-2 transition disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]">
                      {locating ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : gpsSuccess ? (
                        <svg className={`w-4 h-4 text-emerald-600 ${gpsSuccess ? 'gps-success' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      )}
                      {locating ? "Mendeteksi..." : location ? "Update lokasi GPS" : "Pakai lokasi saya"}
                    </button>
                    {location && (
                      <button type="button" onClick={() => setLocation(null)} className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3.5 py-2 transition hover:scale-[1.02] active:scale-[0.98]">Hapus titik</button>
                    )}
                  </div>
                  {location ? (
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 mt-2 animate-fade-in flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} — akan tampil di peta bencana</p>
                  ) : (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">Belum ada titik peta — laporan tetap bisa dikirim, tapi tidak muncul di peta sebaran</p>
                  )}
                </Field>
              </div>

              <div className={`field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.68s' }}>
                <Field label={`Foto Kejadian (maks ${MAX_PHOTOS})`} optional>
                  <div className="space-y-3">
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                        {photos.map((p, idx) => (
                          <div key={idx} className={`relative group photo-enter ${idx === photos.length - 1 && photoAnimKey > 0 ? '' : 'show'}`}>
                            <img src={p.preview} alt={`preview ${idx}`} className="h-24 w-full object-cover rounded-xl border border-gray-200" />
                            <button type="button" onClick={() => removePhoto(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow hover:scale-110 transition">×</button>
                            <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">{idx + 1}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  {photos.length < MAX_PHOTOS ? (
                    <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 hover:border-brand-300 hover:bg-brand-50/30 transition cursor-pointer py-6 px-4 text-center">
                      <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                      <div><p className="text-sm font-medium text-gray-700">{photos.length === 0 ? "Klik untuk unggah foto" : `Tambah foto (${photos.length}/${MAX_PHOTOS})`}</p><p className="text-xs text-gray-400 mt-0.5">JPG / PNG / WEBP, maksimal 5MB per foto</p></div>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" multiple onChange={handlePhotos} className="hidden" />
                    </label>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">Maksimal {MAX_PHOTOS} foto tercapai</p>
                  )}
                </div>
              </Field>
              </div>

              <div className={`pt-2 field-stagger ${showForm ? 'show' : ''}`} style={{ transitionDelay: '0.76s' }}>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg py-3 font-semibold text-sm transition hover:scale-[1.02] active:scale-[0.98]">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      <span>Kirim Laporan</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-gray-400 text-center mt-2">Dengan mengirim, Anda menyatakan informasi yang diberikan benar.</p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <ReportFooter />
    </div>
  );
}

const inputClass = "w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white";
const textareaClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white resize-none";

function Field({ label, required, optional, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-0.5">*</span>}{optional && <span className="text-gray-400 font-normal"> (opsional)</span>}</label>
      {children}
    </div>
  );
}

function FieldIcon({ name }) {
  const paths = {
    user: <><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></>,
    phone: <><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2a1 1 0 011 .707l1.828 3.657a1 1 0 01-.436 1.329l-1.279.749a11.995 11.995 0 005.466 5.466l.749-1.28a1 1 0 011.329-.436L18.293 14a1 1 0 01.707 1V17a2 2 0 01-2 2h-1A13 13 0 013 5z" /></>,
    pin: <><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></>,
  };
  return <span className="absolute left-0 top-0 h-full w-9 flex items-center justify-center text-gray-400 pointer-events-none"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>{paths[name]}</svg></span>;
}

function DisasterIcon({ name, active }) {
  const stroke = active ? "text-brand-700" : "text-gray-400";
  const paths = {
    banjir: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 21c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />,
    longsor: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V10l4-4v7M9 6l3-3 3 3M9 6v6M12 3v5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 21v-7l4-4" /></>,
    kebakaran: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
    angin: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8h9a3 3 0 10-3-3M3 12h13a3 3 0 11-3 3M3 16h7a3 3 0 11-3 3" />,
    gempa: <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h4l2-6 3 12 2-6h3" /></>,
    lainnya: <><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></>,
  };
  return <svg className={`w-5 h-5 ${stroke}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function ReportHeader() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2.5 cursor-pointer">
          <img src="/assets/logo-bpbd.jpg" alt="Logo BPBD Kota Semarang" className="h-8 w-8 rounded-lg object-cover" />
          <div className="leading-tight text-left">
            <p className="font-bold text-gray-900 text-sm">BPBD Kota Semarang</p>
          </div>
        </button>
        <div className="hidden sm:flex items-center gap-1">
          <NavLinkPath to="/lacak" label="Lacak" />
          <NavLinkPath to="/" label="Beranda" />
        </div>
      </div>
    </header>
  );
}
function NavLinkPath({ to, label }) {
  const navigate = useNavigate();
  return <button onClick={() => navigate(to)} className="text-xs font-medium text-gray-600 hover:text-brand-600 px-2.5 py-1.5 rounded-md hover:bg-brand-50 transition cursor-pointer">{label}</button>;
}
function ReportFooter() {
  return <footer className="mt-10 bg-gray-900 text-gray-400 py-6"><div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"><p>© 2026 BPBD Kota Semarang</p><p>Darurat: <span className="text-white font-semibold">112</span></p></div></footer>;
}
