import { useState, useEffect } from "react";
import {
  getActivities,
  createActivity,
  deleteActivity,
} from "../../services/activityService";
import { isAdmin } from "../../services/authService";
import { Calendar, Plus, X, Trash2 } from "lucide-react";
import AnimatedNumber from '../../components/AnimatedNumber';
import { SkeletonCards, SkeletonPulse } from '../../components/Skeleton';

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

export default function ActivityManagement() {
  const adminUser = isAdmin();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    activity_date: "",
    location: "",
  });
  const [doc, setDoc] = useState(null);

  const loadActivities = () => {
    setLoading(true);
    getActivities()
      .then(setActivities)
      .catch(console.error)
      .finally(() => { setLoading(false); setTimeout(() => setShowContent(true), 80); });
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ title: "", description: "", activity_date: "", location: "" });
    setDoc(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (doc) formData.append("documentation", doc);

      await createActivity(formData);
      resetForm();
      loadActivities();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah kegiatan");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus kegiatan ini?")) return;
    try {
      await deleteActivity(id);
      loadActivities();
    } catch {
      alert("Gagal menghapus kegiatan");
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Laporan Kegiatan</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola kegiatan dan dokumentasi lapangan BPBD</p>
            </div>
          </div>
        </div>
        {adminUser && (
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/25 px-5 py-3"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Tutup Form" : "Tambah Kegiatan"}
          </button>
        )}
      </div>

      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Formulir Kegiatan</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Judul kegiatan"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="activity_date"
                value={form.activity_date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lokasi</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Lokasi kegiatan"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Deskripsi kegiatan..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dokumentasi (foto)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDoc(e.target.files[0])}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 btn btn-primary py-3.5">
                Simpan Kegiatan
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4">
              <SkeletonPulse className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <SkeletonPulse className="h-4 w-48" />
                <SkeletonPulse className="h-3 w-32" />
              </div>
            </div>
          </div>
          <SkeletonCards count={6} />
        </div>
      ) : (
        <>
        <div className={`mb-6 stat-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 ${showContent ? 'show' : ''}`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Kegiatan</p>
            <p className="text-2xl font-extrabold text-gray-900"><AnimatedNumber value={activities.length} /></p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activities.length > 0 ? (
            activities.map((a, i) => (
              <div
                key={a.id}
                className={`stat-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? 'show' : ''}`}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{a.title}</h3>
                  {adminUser && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(a.activity_date).toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  {a.location && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span>{a.location}</span>
                    </>
                  )}
                </p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3 leading-relaxed">
                  {a.description}
                </p>
                <p className="text-[11px] text-gray-400">
                  Oleh: <span className="font-medium text-gray-500">{a.created_by_name}</span>
                </p>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-gray-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">Belum ada data kegiatan</p>
                  <p className="text-sm text-gray-400 mt-1">Klik "Tambah Kegiatan" untuk menambahkan</p>
                </div>
              </div>
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
