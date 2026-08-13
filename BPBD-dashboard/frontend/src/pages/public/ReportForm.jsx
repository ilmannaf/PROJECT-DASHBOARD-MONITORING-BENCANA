import { useState } from 'react';
import { submitReport } from '../../services/reportService';

const DISASTER_TYPES = ['Banjir', 'Longsor', 'Kebakaran', 'Angin Puting Beliung', 'Gempa Bumi', 'Lainnya'];

export default function ReportForm() {
  const [form, setForm] = useState({ reporter_name: '', reporter_phone: '', disaster_type: '', description: '', address: '' });
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser tidak mendukung geolocation');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setError('Gagal mendapatkan lokasi, isi alamat manual saja')
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (location) {
        formData.append('latitude', location.latitude);
        formData.append('longitude', location.longitude);
      }
      if (photo) formData.append('photo', photo);
      const data = await submitReport(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow rounded-xl p-8 max-w-sm w-full text-center">
          <h1 className="text-lg font-bold text-green-600 mb-2">Laporan Terkirim</h1>
          <p className="text-sm text-gray-600 mb-4">Simpan kode ini untuk melacak status laporan Anda:</p>
          <p className="text-2xl font-mono font-bold bg-gray-100 rounded-lg py-3 mb-4">{result.tracking_code}</p>
          <button onClick={() => { setResult(null); setForm({ reporter_name: '', reporter_phone: '', disaster_type: '', description: '', address: '' }); setPhoto(null); setLocation(null); }} className="text-sm text-blue-600 underline">
            Kirim laporan lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-1">Lapor Kejadian Bencana</h1>
        <p className="text-sm text-gray-500 mb-6">BPBD Kota Semarang</p>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nama Pelapor</label>
          <input name="reporter_name" value={form.reporter_name} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nomor HP</label>
          <input name="reporter_phone" value={form.reporter_phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Jenis Bencana</label>
          <select name="disaster_type" value={form.disaster_type} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Pilih jenis bencana</option>
            {DISASTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Deskripsi Kejadian</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Alamat / Lokasi</label>
          <input name="address" value={form.address} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          <button type="button" onClick={handleGetLocation} className="text-xs text-blue-600 mt-1 underline">
            {location ? '✓ Lokasi GPS tersimpan' : 'Gunakan lokasi saat ini'}
          </button>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Foto Kejadian</label>
          <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="w-full text-sm" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-red-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50">
          {loading ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
      </form>
    </div>
  );
}