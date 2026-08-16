import { useState, useEffect } from 'react';
import { getDisasterRecords, createDisasterRecord, updateDisasterRecord, deleteDisasterRecord } from '../../services/disasterService';
import { isAdmin } from '../../services/authService';

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

export default function DisasterRecordsManagement() {
  const adminUser = isAdmin();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByKecamatan, setFilterByKecamatan] = useState('');
  const [form, setForm] = useState({
    disaster_date: '',
    disaster_time: '',
    location: '',
    kelurahan: '',
    kecamatan: '',
    pemilik: '',
    kronologi: '',
    korban: '',
    kerugian: '',
    sumber_info_nama: '',
    sumber_info_phone: ''
  });

  const loadRecords = () => {
    setLoading(true);
    getDisasterRecords()
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRecords(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      disaster_date: '',
      disaster_time: '',
      location: '',
      kelurahan: '',
      kecamatan: '',
      pemilik: '',
      kronologi: '',
      korban: '',
      kerugian: '',
      sumber_info_nama: '',
      sumber_info_phone: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDisasterRecord(editingId, form);
      } else {
        await createDisasterRecord(form);
      }
      resetForm();
      loadRecords();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleEdit = (record) => {
    setForm({
      disaster_date: record.disaster_date,
      disaster_time: record.disaster_time,
      location: record.location,
      kelurahan: record.kelurahan,
      kecamatan: record.kecamatan,
      pemilik: record.pemilik || '',
      kronologi: record.kronologi,
      korban: record.korban || '',
      kerugian: record.kerugian || '',
      sumber_info_nama: record.sumber_info_nama,
      sumber_info_phone: record.sumber_info_phone
    });
    setEditingId(record.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus data pendataan bencana ini?')) return;
    try {
      await deleteDisasterRecord(id);
      loadRecords();
    } catch {
      alert('Gagal menghapus data');
    }
  };

  const kecamatanList = [...new Set(records.map((r) => r.kecamatan))];

  const displayedRecords = filteredRecordsByTerm();

  function filteredRecordsByTerm() {
    const q = searchTerm.toLowerCase().trim();
    return records
      .filter((r) => !filterByKecamatan || r.kecamatan === filterByKecamatan)
      .filter((r) =>
        !q ||
        r.location.toLowerCase().includes(q) ||
        r.kelurahan.toLowerCase().includes(q) ||
        r.kecamatan.toLowerCase().includes(q) ||
        (r.pemilik && r.pemilik.toLowerCase().includes(q)) ||
        r.sumber_info_nama.toLowerCase().includes(q)
      );
  }

  const monthStats = records.filter((r) => {
    const d = new Date(r.disaster_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const totalKorban = records.reduce((sum, r) => {
    const match = r.korban ? r.korban.match(/\d+/g) : null;
    return sum + (match ? match.reduce((a, b) => a + parseInt(b), 0) : 0);
  }, 0);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Pendataan Bencana</h1>
              <p className="text-gray-500 text-sm mt-0.5">Catat detail kejadian bencana untuk arsip resmi</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/25 px-5 py-3"
        >
          {showForm ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {showForm ? 'Tutup Form' : 'Tambah Data'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${editingId ? 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/30' : 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/30'}`}>
              {editingId ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Data Bencana' : 'Formulir Pendataan Bencana'}</h2>
              <p className="text-sm text-gray-500">Lengkapi semua field yang ditandai wajib diisi</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Bencana <span className="text-red-500">*</span></label>
                  <input type="date" name="disaster_date" value={form.disaster_date} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Jam Kejadian <span className="text-red-500">*</span></label>
                  <input type="time" name="disaster_time" value={form.disaster_time} onChange={handleChange} required className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi Kejadian <span className="text-red-500">*</span></label>
                <input name="location" value={form.location} onChange={handleChange} required placeholder="Nama jalan / lokasi spesifik" className={inputClass} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kelurahan <span className="text-red-500">*</span></label>
                  <input name="kelurahan" value={form.kelurahan} onChange={handleChange} required placeholder="Nama kelurahan" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kecamatan <span className="text-red-500">*</span></label>
                  <input name="kecamatan" value={form.kecamatan} onChange={handleChange} required placeholder="Nama kecamatan" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Pemilik / Korban</label>
                <input name="pemilik" value={form.pemilik} onChange={handleChange} placeholder="Opsional: nama pemilik lokasi" className={inputClass} />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kronologi Kejadian <span className="text-red-500">*</span></label>
                <textarea name="kronologi" value={form.kronologi} onChange={handleChange} required rows={4} placeholder="Deskripsikan secara singkat dan jelas apa yang terjadi..." className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Korban</label>
                  <textarea name="korban" value={form.korban} onChange={handleChange} rows={3} placeholder="Contoh: 2 luka ringan, 1 meninggal" className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kerugian</label>
                  <textarea name="kerugian" value={form.kerugian} onChange={handleChange} rows={3} placeholder="Contoh: Rp 5.000.000 / 3 rumah rusak" className={`${inputClass} resize-none`} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-white border border-orange-200 flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                  Sumber Informasi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input name="sumber_info_nama" value={form.sumber_info_nama} onChange={handleChange} required placeholder="Nama sumber" className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white" />
                  <input name="sumber_info_phone" value={form.sumber_info_phone} onChange={handleChange} required placeholder="0812-XXXX-XXXX" className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 mt-4">
              <button type="submit" className={`flex-1 btn py-3.5 text-base font-semibold text-white shadow-lg ${editingId ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-blue-500/40' : 'bg-gradient-to-r from-brand-500 to-orange-600 hover:shadow-brand-500/40'}`}>
                {editingId ? 'Simpan Perubahan' : 'Simpan Data'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{records.length}</p>
          <p className="text-xs text-gray-500 mt-1">Data bencana tercatat</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bulan Ini</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{monthStats}</p>
          <p className="text-xs text-gray-500 mt-1">Kejadian bulan ini</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Wilayah</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{kecamatanList.length}</p>
          <p className="text-xs text-gray-500 mt-1">Kecamatan terdampak</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Korban</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">{totalKorban}</p>
          <p className="text-xs text-gray-500 mt-1">Total korban tercatat</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari lokasi, kelurahan, kecamatan, atau nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            />
          </div>
          <select
            value={filterByKecamatan}
            onChange={(e) => setFilterByKecamatan(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white text-gray-700"
          >
            <option value="">Semua Kecamatan</option>
            {kecamatanList.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal & Jam</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Lokasi</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kronologi</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Dampak</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Sumber Info</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayedRecords.length > 0 ? (
                  displayedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-orange-50/40 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                          {new Date(r.disaster_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {r.disaster_time} WIB
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 text-sm">{r.location}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {r.kelurahan}, {r.kecamatan}
                          </span>
                          {r.pemilik && (
                            <span className="ml-2 inline-flex items-center gap-1 text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                              👤 {r.pemilik}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{r.kronologi}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {r.korban && (
                            <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 rounded-full px-2.5 py-1 font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {r.korban}
                            </span>
                          )}
                          {r.kerugian && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 rounded-full px-2.5 py-1 font-medium block">
                              💰 {r.kerugian}
                            </span>
                          )}
                          {!r.korban && !r.kerugian && (
                            <span className="text-xs text-gray-400 italic">Tidak ada data</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold">
                            {r.sumber_info_nama.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{r.sumber_info_nama}</div>
                            <div className="text-xs text-gray-500">{r.sumber_info_phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {adminUser ? (
                          <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Hapus">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">{searchTerm || filterByKecamatan ? 'Data tidak ditemukan' : 'Belum ada data pendataan'}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm || filterByKecamatan ? 'Coba ubah kata kunci atau filter Anda' : 'Klik tombol "Tambah Data" untuk memulai'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
