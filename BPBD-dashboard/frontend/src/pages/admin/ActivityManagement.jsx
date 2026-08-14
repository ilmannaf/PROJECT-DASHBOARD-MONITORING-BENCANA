import { useState, useEffect } from 'react';
import { getActivities, createActivity, deleteActivity } from '../../services/activityService';

export default function ActivityManagement() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', activity_date: '', location: '' });
  const [doc, setDoc] = useState(null);

  const loadActivities = () => {
    setLoading(true);
    getActivities().then(setActivities).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadActivities(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (doc) formData.append('documentation', doc);

      await createActivity(formData);
      setForm({ title: '', description: '', activity_date: '', location: '' });
      setDoc(null);
      setShowForm(false);
      loadActivities();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah kegiatan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus kegiatan ini?')) return;
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (err) {
      alert('Gagal menghapus kegiatan');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Laporan Kegiatan</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          {showForm ? 'Batal' : '+ Tambah Kegiatan'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Judul Kegiatan</label>
            <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input type="date" name="activity_date" value={form.activity_date} onChange={handleChange} required className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lokasi</label>
            <input name="location" value={form.location} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Dokumentasi (foto)</label>
            <input type="file" accept="image/*" onChange={(e) => setDoc(e.target.files[0])} className="w-full text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Simpan</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Memuat data...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {activities.map((a) => (
            <div key={a.id} className="bg-white shadow rounded-xl p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{a.title}</h3>
                <button onClick={() => handleDelete(a.id)} className="text-red-500 text-xs underline">Hapus</button>
              </div>
              <p className="text-xs text-gray-500 mb-2">{new Date(a.activity_date).toLocaleDateString('id-ID')} · {a.location || '-'}</p>
              <p className="text-sm text-gray-700 mb-2">{a.description}</p>
              <p className="text-xs text-gray-400">Oleh: {a.created_by_name}</p>
            </div>
          ))}
          {activities.length === 0 && <p className="text-sm text-gray-500">Belum ada data kegiatan.</p>}
        </div>
      )}
    </div>
  );
}