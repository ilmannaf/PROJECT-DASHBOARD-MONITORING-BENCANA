import { useEffect, useState } from 'react';
import { Download, MapPinned, Plus, Pencil, Trash2, X } from 'lucide-react';
import { GeoJSON, MapContainer, Marker, Polygon, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import semarangGeojson from '../../assets/kota_semarang.json';
import api from '../../services/api';
import { isAdmin } from '../../services/authService';
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
  exportLocations,
} from '../../services/locationService';
import { createAdminReport, deleteReport, updateReportData } from '../../services/reportService';

const inputClass = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white';

const SEMARANG_CENTER = [-7.005, 110.4381];
const SEMARANG_ZOOM = 11;
const SEMARANG_RING = semarangGeojson.features[0].geometry.coordinates[0];
const SEMARANG_LATLNG = SEMARANG_RING.map(([longitude, latitude]) => [latitude, longitude]);
const WORLD_RECT = [
  [-85, -180],
  [-85, 180],
  [85, 180],
  [85, -180],
];

const DISASTER_MARKERS = {
  Banjir: { color: '#0ea5e9', icon: '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>' },
  Longsor: { color: '#795548', icon: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>' },
  Kebakaran: { color: '#e53935', icon: '<path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>' },
  'Angin Puting Beliung': { color: '#8e24aa', icon: '<path d="M21 4H3"/><path d="M18 8H6"/><path d="M19 12H9"/><path d="M16 16h-6"/><path d="M11 20H9"/>' },
  'Gempa Bumi': { color: '#f59e0b', icon: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>' },
  Lainnya: { color: '#616161', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
};

const createLocationIcon = (type, disasterType) => {
  const disasterMarker = DISASTER_MARKERS[disasterType] || DISASTER_MARKERS.Lainnya;
  const color = type === 'smab' ? '#3b82f6' : type === 'katana' ? '#10b981' : disasterMarker.color;
  const icon = type === 'bencana'
    ? disasterMarker.icon
    : type === 'smab'
    ? '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a1.999 1.999 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />'
    : type === 'katana'
      ? '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />'
      : '<path d="m12 9 4 4-4 4-4-4 4-4Z"/><path d="M12 2 2 20h20L12 2Z"/><path d="M12 8v4"/><path d="M12 16h.01" />';
  return L.divIcon({
    html: `<div style="width:28px;height:28px;background:${color};border:2px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);display:flex"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg></span></div>`,
    className: 'custom-div-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const EMPTY_FORM = {
  nama_sekolah: '',
  kelurahan: '',
  kecamatan: '',
  ancaman_bencana: '',
  tahun_pembentukan: '',
  pembentukan: '',
  sumber_dana: '',
  latitude: '',
  longitude: '',
};

const EMPTY_REPORT_FORM = {
  reporter_name: 'Admin BPBD',
  reporter_phone: '',
  disaster_type: 'Banjir',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
};

const DISASTER_TYPES = ['Banjir', 'Longsor', 'Kebakaran', 'Angin Puting Beliung', 'Gempa Bumi', 'Lainnya'];

const typeConfig = {
  smab: {
    label: 'SMAB',
    title: 'Sekolah/Madrasah',
    nameField: 'nama_sekolah',
    yearField: 'tahun_pembentukan',
    color: 'blue',
  },
  katana: {
    label: 'KATANA',
    title: 'Kelurahan',
    nameField: 'kelurahan',
    yearField: 'pembentukan',
    color: 'emerald',
  },
  bencana: {
    label: 'Bencana',
    title: 'Laporan Bencana',
    nameField: 'address',
    color: 'red',
  },
};

export default function LocationManagement() {
  const adminUser = isAdmin();
  const [type, setType] = useState('smab');
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [reportForm, setReportForm] = useState(EMPTY_REPORT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const config = typeConfig[type];

  const loadLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = type === 'bencana' ? await api.get('/reports') : null;
      setLocations(type === 'bencana' ? (response.data?.data || []) : await getLocations(type));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data lokasi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      setError('');
      try {
        const response = type === 'bencana' ? await api.get('/reports') : null;
        setLocations(type === 'bencana' ? (response.data?.data || []) : await getLocations(type));
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data lokasi');
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [type]);

  const changeType = (nextType) => {
    setType(nextType);
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleEdit = (location) => {
    if (type === 'bencana') {
      setEditingId(location.id);
      setReportForm({
        disaster_type: location.disaster_type || 'Lainnya',
        description: location.description || '',
        address: location.address || '',
        latitude: location.latitude || '',
        longitude: location.longitude || '',
      });
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setEditingId(location.id);
    setForm({ ...EMPTY_FORM, ...location });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setReportForm(EMPTY_REPORT_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(`Yakin hapus data ${config.label} ini?`)) return;
    try {
      if (type === 'bencana') await deleteReport(id);
      else await deleteLocation(type, id);
      await loadLocations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus lokasi');
    }
  };

  const handleExport = async () => {
    try {
      await exportLocations(type);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengekspor data ke Excel');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (type === 'bencana') {
        const payload = {
          ...reportForm,
          latitude: Number(reportForm.latitude),
          longitude: Number(reportForm.longitude),
        };
        if (editingId) await updateReportData(editingId, payload);
        else await createAdminReport(payload);
        resetForm();
        await loadLocations();
        return;
      }
      const payload = {
        ...form,
        [config.yearField]: form[config.yearField] ? Number(form[config.yearField]) : null,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      };
      if (editingId) await updateLocation(type, editingId, payload);
      else await createLocation(type, payload);
      resetForm();
      await loadLocations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan lokasi');
    }
  };

  return (
    <div className="p-5 lg:p-8 animate-fade-in bg-gradient-to-b from-slate-50 to-white min-h-full">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between mb-8 gap-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
            <MapPinned className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600 mb-1">Pusat Data Spasial</p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Lokasi & Peta Bencana</h1>
            <p className="text-slate-500 text-sm mt-1">Kelola titik lokasi yang ditampilkan pada peta publik</p>
          </div>
        </div>
        {adminUser && <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button onClick={handleExport} className="btn btn-secondary flex items-center justify-center gap-2 px-5 py-3 bg-white border-slate-200 shadow-sm">
            <Download className="w-5 h-5" /> Export Excel
          </button>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="btn btn-primary flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 px-5 py-3"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Tutup Form' : `Tambah ${config.label}`}
          </button>
        </div>}
      </div>

      <div className="flex flex-wrap gap-2 mb-5 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {Object.entries(typeConfig).map(([key, item]) => (
          <button
            key={key}
            onClick={() => changeType(key)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition ${type === key ? (key === 'smab' ? 'bg-blue-600 text-white shadow-md' : key === 'katana' ? 'bg-emerald-600 text-white shadow-md' : 'bg-red-600 text-white shadow-md') : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Data Aktif</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{locations.length}</p>
          <p className="text-xs text-slate-500 mt-1">titik pada kategori {config.label}</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Mode Peta</p>
          <p className="text-lg font-extrabold text-slate-900 mt-2">Kota Semarang</p>
          <p className="text-xs text-slate-500 mt-1">batas wilayah aktif</p>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Akses Data</p>
          <p className="text-lg font-extrabold text-slate-900 mt-2">{adminUser ? 'Admin penuh' : 'Lihat saja'}</p>
          <p className="text-xs text-slate-500 mt-1">sesuai peran akun</p>
        </div>
      </div>

      {showForm && adminUser && type !== 'bencana' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <h2 className="md:col-span-2 text-xl font-bold text-gray-900">{editingId ? `Edit ${config.label}` : `Tambah ${config.label}`}</h2>
          <label className="text-sm font-semibold text-gray-700">
            {config.title} <span className="text-red-500">*</span>
            <input name={config.nameField} value={form[config.nameField]} onChange={handleChange} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Kecamatan <span className="text-red-500">*</span>
            <input name="kecamatan" value={form.kecamatan} onChange={handleChange} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Ancaman Bencana
            <input name="ancaman_bencana" value={form.ancaman_bencana} onChange={handleChange} className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            {type === 'smab' ? 'Tahun Pembentukan' : 'Tahun Pembentukan'}
            <input name={config.yearField} type="number" min="1900" max="2200" value={form[config.yearField]} onChange={handleChange} className={`${inputClass} mt-2`} />
          </label>
          {type === 'katana' && (
            <label className="text-sm font-semibold text-gray-700">
              Sumber Dana
              <input name="sumber_dana" value={form.sumber_dana} onChange={handleChange} className={`${inputClass} mt-2`} />
            </label>
          )}
          <label className="text-sm font-semibold text-gray-700">
            Latitude <span className="text-red-500">*</span>
            <input name="latitude" type="number" step="any" min="-90" max="90" value={form.latitude} onChange={handleChange} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Longitude <span className="text-red-500">*</span>
            <input name="longitude" type="number" step="any" min="-180" max="180" value={form.longitude} onChange={handleChange} required className={`${inputClass} mt-2`} />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="flex-1 btn btn-primary py-3.5">{editingId ? 'Simpan Perubahan' : 'Simpan Lokasi'}</button>
            <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">Batal</button>
          </div>
        </form>
      )}

      {showForm && adminUser && type === 'bencana' && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-5">
          <h2 className="md:col-span-2 text-xl font-bold text-gray-900">{editingId ? 'Edit Data Bencana' : 'Tambah Data Bencana'}</h2>
          <label className="text-sm font-semibold text-gray-700">
            Nama Pelapor <span className="text-red-500">*</span>
            <input name="reporter_name" value={reportForm.reporter_name} onChange={(event) => setReportForm((current) => ({ ...current, reporter_name: event.target.value }))} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Nomor Telepon
            <input name="reporter_phone" value={reportForm.reporter_phone} onChange={(event) => setReportForm((current) => ({ ...current, reporter_phone: event.target.value }))} className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Jenis Bencana <span className="text-red-500">*</span>
            <select name="disaster_type" value={reportForm.disaster_type} onChange={(event) => setReportForm((current) => ({ ...current, disaster_type: event.target.value }))} className={`${inputClass} mt-2`} required>
              {DISASTER_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Alamat/Lokasi
            <input name="address" value={reportForm.address} onChange={(event) => setReportForm((current) => ({ ...current, address: event.target.value }))} className={`${inputClass} mt-2`} />
          </label>
          <label className="md:col-span-2 text-sm font-semibold text-gray-700">
            Deskripsi Bencana
            <textarea name="description" value={reportForm.description} onChange={(event) => setReportForm((current) => ({ ...current, description: event.target.value }))} rows={4} className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Latitude <span className="text-red-500">*</span>
            <input name="latitude" type="number" step="any" min="-90" max="90" value={reportForm.latitude} onChange={(event) => setReportForm((current) => ({ ...current, latitude: event.target.value }))} required className={`${inputClass} mt-2`} />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Longitude <span className="text-red-500">*</span>
            <input name="longitude" type="number" step="any" min="-180" max="180" value={reportForm.longitude} onChange={(event) => setReportForm((current) => ({ ...current, longitude: event.target.value }))} required className={`${inputClass} mt-2`} />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="flex-1 btn btn-primary py-3.5">{editingId ? 'Simpan Perubahan' : 'Tambah Bencana'}</button>
            <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">Batal</button>
          </div>
        </form>
      )}

      {error && <div className="mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 p-4">{error}</div>}

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Peta Lokasi {config.label}</h2>
            <p className="text-xs text-gray-500 mt-1">Klik titik untuk melihat detail lokasi</p>
          </div>
          <span className="text-xs text-gray-400">{locations.length} titik</span>
        </div>
        <div className="h-[380px] w-full">
          <MapContainer center={SEMARANG_CENTER} zoom={SEMARANG_ZOOM} minZoom={5} maxZoom={18} className="h-full w-full">
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polygon
              positions={[WORLD_RECT, SEMARANG_LATLNG]}
              pathOptions={{ stroke: false, fillColor: '#0f172a', fillOpacity: 0.35, fillRule: 'evenodd' }}
            />
            <GeoJSON
              key="admin-kota-semarang-boundary"
              data={semarangGeojson}
              style={{ color: '#f97316', weight: 3, opacity: 0.9, fill: false }}
            />
            {locations.map((location) => {
              const latitude = Number(location.latitude);
              const longitude = Number(location.longitude);
              if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
              return (
                <Marker
                  key={`admin-${type}-${location.id}`}
                  position={[latitude, longitude]}
                  icon={createLocationIcon(type, location.disaster_type)}
                >
                  <Popup>
                    <strong>{location[config.nameField] || location.disaster_type || 'Laporan Bencana'}</strong><br />
                    {location.kecamatan || location.status || '-'}<br />
                    {location.description ? `${location.description.slice(0, 100)}${location.description.length > 100 ? '...' : ''}` : ''}<br />
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Daftar Lokasi {config.label}</h2>
          <span className="text-xs text-gray-400">{locations.length} lokasi</span>
        </div>
        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat data lokasi...</div>
        ) : locations.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Belum ada data {config.label}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="bg-gray-50/80">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Nama</th>
                {type === 'bencana' && <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Jenis Bencana</th>}
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kecamatan</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Koordinat</th>
                {adminUser && <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>}
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {locations.map((location) => (
                  <tr key={location.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-gray-900">{location[config.nameField] || location.disaster_type || '-'}</td>
                    {type === 'bencana' && <td className="py-4 px-6 text-sm text-gray-700">{location.disaster_type || '-'}</td>}
                    <td className="py-4 px-6 text-sm text-gray-600">{location.kecamatan || location.status || '-'}</td>
                    <td className="py-4 px-6 text-xs font-mono text-gray-600">{location.latitude}, {location.longitude}</td>
                    {adminUser && <td className="py-4 px-6 text-center"><div className="flex justify-center gap-1">
                      <button onClick={() => handleEdit(location)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(location.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
