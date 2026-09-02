import { useState, useEffect } from "react";
import {
  getInfoBoard,
  createInfoBoard,
  updateInfoBoard,
  deleteInfoBoard,
} from "../../services/infoBoardService";
import { isAdmin } from "../../services/authService";
import { Info, Plus, X, Trash2, Pencil, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import AnimatedNumber from "../../components/AnimatedNumber";
import { SkeletonCards, SkeletonPulse } from "../../components/Skeleton";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

export default function InfoBoardManagement() {
  const adminUser = isAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    info_date: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
  });
  const [filterDate, setFilterDate] = useState("");

  const loadData = () => {
    setLoading(true);
    getInfoBoard()
      .then(setItems)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 80);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      title: "",
      info_date: "",
      start_time: "",
      end_time: "",
      location: "",
      description: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      title: item.title || "",
      info_date: item.info_date ? item.info_date.split("T")[0] : "",
      start_time: item.start_time || "",
      end_time: item.end_time || "",
      location: item.location || "",
      description: item.description || "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateInfoBoard(editId, form);
      } else {
        await createInfoBoard(form);
      }
      resetForm();
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus informasi ini?")) return;
    try {
      await deleteInfoBoard(id);
      loadData();
    } catch {
      alert("Gagal menghapus data");
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await updateInfoBoard(item.id, { is_active: item.is_active ? 0 : 1 });
      loadData();
    } catch {
      alert("Gagal mengubah status");
    }
  };

  const formatTime = (t) => {
    if (!t) return "--:--";
    return t.substring(0, 5);
  };

  const filtered = filterDate
    ? items.filter((i) => i.info_date && i.info_date.split("T")[0] === filterDate)
    : items;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Papan Informasi</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola jadwal informasi harian untuk papan display</p>
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
            {showForm ? "Tutup Form" : "Tambah Informasi"}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center">
              {editId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editId ? "Edit Informasi" : "Tambah Informasi Baru"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                placeholder="Contoh: Apel Pagi, Rapat Koordinasi, dll"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="info_date"
                value={form.info_date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jam Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="start_time"
                value={form.start_time}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jam Selesai
              </label>
              <input
                type="time"
                name="end_time"
                value={form.end_time}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
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
                rows={3}
                placeholder="Detail informasi..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 btn btn-primary py-3.5">
                {editId ? "Simpan Perubahan" : "Tambah Informasi"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      {!loading && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-600">Filter Tanggal:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
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
          {/* Stats */}
          <div
            className={`mb-6 stat-card bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 ${showContent ? "show" : ""}`}
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Informasi</p>
              <p className="text-2xl font-extrabold text-gray-900">
                <AnimatedNumber value={items.length} />
              </p>
            </div>
          </div>

          {/* Table */}
          {filtered.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-2">Waktu</div>
                <div className="col-span-3">Judul</div>
                <div className="col-span-2 hidden sm:block">Lokasi</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-3 text-center">Aksi</div>
              </div>

              {/* Table rows */}
              <div className="divide-y divide-gray-50">
                {filtered.map((item, i) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors ${showContent ? "show" : ""}`}
                      style={{ transitionDelay: `${i * 40}ms` }}
                    >
                      <div className="col-span-1 text-center text-sm font-mono text-gray-400">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-mono font-bold text-gray-900">
                            {formatTime(item.start_time)}
                          </span>
                          {item.end_time && (
                            <span className="text-sm text-gray-400">
                              - {formatTime(item.end_time)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {item.info_date
                            ? new Date(item.info_date).toLocaleDateString("id-ID", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })
                            : "-"}
                        </p>
                      </div>

                      <div className="col-span-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                        {item.description && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.description}</p>
                        )}
                      </div>

                      <div className="col-span-2 hidden sm:block">
                        <p className="text-sm text-gray-600 truncate">{item.location || "-"}</p>
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors ${
                            item.is_active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                          title={item.is_active ? "Aktif - klik untuk nonaktifkan" : "Nonaktif - klik untuk aktifkan"}
                        >
                          {item.is_active ? (
                            <ToggleRight className="w-3 h-3" />
                          ) : (
                            <ToggleLeft className="w-3 h-3" />
                          )}
                          {item.is_active ? "Aktif" : "Off"}
                        </button>
                      </div>

                      <div className="col-span-3 flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="col-span-full py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                  <Info className="w-10 h-10 text-gray-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">Belum ada informasi</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Klik "Tambah Informasi" untuk menambahkan jadwal
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
