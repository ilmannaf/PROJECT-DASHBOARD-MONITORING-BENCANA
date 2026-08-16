import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { submitReport } from "../../services/reportService";

const DISASTER_TYPES = [
  { id: "Banjir", label: "Banjir", icon: "banjir" },
  { id: "Longsor", label: "Longsor", icon: "longsor" },
  { id: "Kebakaran", label: "Kebakaran", icon: "kebakaran" },
  { id: "Angin Puting Beliung", label: "Angin Puting Beliung", icon: "angin" },
  { id: "Gempa Bumi", label: "Gempa Bumi", icon: "gempa" },
  { id: "Lainnya", label: "Lainnya", icon: "lainnya" },
];

export default function ReportForm() {
  const [form, setForm] = useState({
    reporter_name: "",
    reporter_phone: "",
    disaster_type: "",
    description: "",
    address: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError("Browser tidak mendukung geolocation");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Gagal mendapatkan lokasi, isi alamat manual saja");
      },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        formData.append(key, value),
      );
      if (location) {
        formData.append("latitude", location.latitude);
        formData.append("longitude", location.longitude);
      }
      if (photo) formData.append("photo", photo);
      const data = await submitReport(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengirim laporan");
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setResult(null);
    setForm({
      reporter_name: "",
      reporter_phone: "",
      disaster_type: "",
      description: "",
      address: "",
    });
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setLocation(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ReportHeader />
        <main className="max-w-xl mx-auto px-4 py-12 lg:py-16">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 px-6 py-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white">Laporan Terkirim</h1>
              <p className="text-emerald-50 text-sm mt-1">Terima kasih, laporan Anda akan segera ditindaklanjuti</p>
            </div>

            <div className="p-6 lg:p-8">
              <p className="text-sm text-gray-500 mb-3">Simpan kode berikut untuk melacak status laporan Anda:</p>
              <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-center mb-6">
                <p className="font-mono text-2xl font-extrabold tracking-widest text-gray-900">
                  {result.tracking_code}
                </p>
              </div>
              <div className="space-y-2.5">
                <a
                  href={`/lacak?code=${result.tracking_code}`}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3 font-semibold transition"
                >
                  Lacak Status Laporan
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <button
                  onClick={resetAll}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 font-medium py-2 transition"
                >
                  Kirim laporan lain
                </button>
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
        <div className="mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-1 mb-4 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Siaga Darurat
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Laporkan Kejadian Bencana
          </h1>
          <p className="mt-2 text-gray-600 leading-relaxed">
            Isi formulir berikut sejelas mungkin agar tim kami dapat merespons dengan cepat dan tepat.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <aside className="lg:col-span-2 space-y-6 order-2 lg:order-1">
            <div className="bg-gray-900 rounded-2xl text-white p-6 overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand-600/10 rounded-full"></div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-red-500/90 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h1a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm0 10a2 2 0 012-2h1a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1zm12-8a2 2 0 012-2h1a2 2 0 012 2v1a2 2 0 01-2 2h-1a2 2 0 01-2-2V7zm-6-2l-1-2h-1l-1 2m1 9v3l1 2m-1-2h-2a1 1 0 01-1-1v-1a1 1 0 011-1h2m6-2v3l1 2m-1-2h2a1 1 0 001-1v-1a1 1 0 00-1-1h-2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 20h12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold">Tanggap Darurat 24 Jam</p>
                  <p className="text-xs text-gray-400">BPBD Kota Semarang</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-2xl font-extrabold">112</p>
                  <p className="text-xs text-gray-400 mt-0.5">Call Center</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-2xl font-extrabold">24/7</p>
                  <p className="text-xs text-gray-400 mt-0.5">Siaga Bencana</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-900 mb-5">Setelah Anda melapor</h2>
              <ol className="space-y-5">
                {[
                  { title: "Laporan dicatat", desc: "Setiap laporan mendapat kode tracking unik." },
                  { title: "Diverifikasi petugas", desc: "Tim kami memverifikasi kejadian di lapangan." },
                  { title: "Ditindaklanjuti", desc: "Koordinasi penanganan dengan unit terkait." },
                  { title: "Pantau status", desc: "Lacak perkembangan laporan melalui kode Anda." },
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className="w-7 h-7 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center border border-brand-100 shrink-0">
                        {i + 1}
                      </span>
                      {i < 3 && <span className="w-px flex-1 bg-gray-200 my-1"></span>}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-gray-900">{s.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <form
            onSubmit={handleSubmit}
            className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden order-1 lg:order-2"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900">Formulir Laporan</h2>
                <p className="text-xs text-gray-500 mt-0.5">Tanda * wajib diisi</p>
              </div>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
                Gratis
              </span>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nama Pelapor" required>
                  <div className="relative">
                    <FieldIcon name="user" />
                    <input
                      name="reporter_name"
                      value={form.reporter_name}
                      onChange={handleChange}
                      required
                      placeholder="Nama lengkap Anda"
                      className={inputClass}
                    />
                  </div>
                </Field>
                <Field label="Nomor HP / WhatsApp" optional>
                  <div className="relative">
                    <FieldIcon name="phone" />
                    <input
                      name="reporter_phone"
                      value={form.reporter_phone}
                      onChange={handleChange}
                      placeholder="08xx-xxxx-xxxx"
                      type="tel"
                      className={inputClass}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Jenis Bencana" required>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DISASTER_TYPES.map((t) => {
                    const active = form.disaster_type === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setForm({ ...form, disaster_type: t.id })}
                        className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 text-sm font-medium transition-all ${
                          active
                            ? "border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                            : "border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:bg-brand-50/40"
                        }`}
                      >
                        <DisasterIcon name={t.icon} active={active} />
                        <span className="text-center leading-tight">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Deskripsi Kejadian" optional>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Contoh: air mulai naik sekitar 50 cm, warga terdampak ±20 KK di RT 03/RW 02..."
                  className={textareaClass}
                />
              </Field>

              <Field label="Alamat / Lokasi" required>
                <div className="space-y-2.5">
                  <div className="relative">
                    <FieldIcon name="pin" />
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder="Jalan, RT/RW, kelurahan, kecamatan"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 border border-brand-100 rounded-lg px-3.5 py-2 transition disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {locating
                      ? "Mendeteksi lokasi..."
                      : location
                        ? "Lokasi GPS terdeteksi"
                        : "Pakai lokasi saya saat ini"}
                  </button>
                  {location && (
                    <p className="text-xs text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                      {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </Field>

              <Field label="Foto Kejadian" optional>
                <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/60 hover:border-brand-300 hover:bg-brand-50/30 transition cursor-pointer py-7 px-4 text-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Pratinjau foto" className="h-36 object-cover rounded-lg" />
                  ) : (
                    <>
                      <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Klik untuk unggah foto
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          JPG / PNG, maksimal 5 MB
                        </p>
                      </div>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
              </Field>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-3.5 font-bold text-base transition shadow-lg shadow-brand-600/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {loading ? "Mengirim laporan..." : "Kirim Laporan"}
                </button>
                <p className="text-xs text-gray-400 text-center mt-3">
                  Dengan mengirim, Anda menyatakan informasi yang diberikan benar.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <ReportFooter />
    </div>
  );
}

const inputClass =
  "w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white";

const textareaClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition bg-white resize-none";

function Field({ label, required, optional, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {optional && <span className="text-gray-400 font-normal"> (opsional)</span>}
      </label>
      {children}
    </div>
  );
}

function FieldIcon({ name }) {
  const paths = {
    user: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </>
    ),
    phone: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2a1 1 0 011 .707l1.828 3.657a1 1 0 01-.436 1.329l-1.279.749a11.995 11.995 0 005.466 5.466l.749-1.28a1 1 0 011.329-.436L18.293 14a1 1 0 01.707 1V17a2 2 0 01-2 2h-1A13 13 0 013 5z" />
      </>
    ),
    pin: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </>
    ),
  };
  return (
    <span className="absolute left-0 top-0 h-full w-10 flex items-center justify-center text-gray-400 pointer-events-none">
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {paths[name]}
      </svg>
    </span>
  );
}

function DisasterIcon({ name, active }) {
  const stroke = active ? "text-brand-700" : "text-gray-400";
  const paths = {
    banjir: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 21c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 13c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0M3 9c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0" />
    ),
    longsor: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V10l4-4v7M9 6l3-3 3 3M9 6v6M12 3v5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 21v-7l4-4" />
      </>
    ),
    kebakaran: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
    angin: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8h9a3 3 0 10-3-3M3 12h13a3 3 0 11-3 3M3 16h7a3 3 0 11-3 3" />
    ),
    gempa: (
      <>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h4l2-6 3 12 2-6h3" />
      </>
    ),
    lainnya: (
      <>
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </>
    ),
  };
  return (
    <svg className={`w-6 h-6 ${stroke}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}

function ReportHeader() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-xs">
            BPBD
          </div>
          <div className="leading-tight text-left">
            <p className="font-extrabold text-gray-900 text-sm">BPBD Kota Semarang</p>
            <p className="text-[11px] text-gray-500">Sistem Monitoring Kebencanaan</p>
          </div>
        </button>
        <div className="hidden sm:flex items-center gap-1">
          <NavLinkPath to="/lacak" label="Lacak Laporan" />
          <NavLinkPath to="/dashboard" label="Dashboard" />
        </div>
      </div>
    </header>
  );
}

function NavLinkPath({ to, label }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="text-sm font-medium text-gray-600 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-brand-50 transition cursor-pointer"
    >
      {label}
    </button>
  );
}

function ReportFooter() {
  return (
    <footer className="mt-10 bg-gray-900 text-gray-400 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <p>© 2026 BPBD Kota Semarang. Sistem Monitoring Kebencanaan Terpadu.</p>
        <p>
          Darurat: <span className="text-white font-semibold">112</span>
        </p>
      </div>
    </footer>
  );
}