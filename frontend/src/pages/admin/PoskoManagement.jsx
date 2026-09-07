import { useState, useEffect } from "react";
import { getPosko, createPosko, updatePosko, deletePosko } from "../../services/poskoService";
import { isAdmin } from "../../services/authService";
import { Building2, Plus, X, Pencil, Trash2 } from "lucide-react";
import AnimatedNumber from '../../components/AnimatedNumber';
import { SkeletonTable } from '../../components/Skeleton';

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

export default function PoskoManagement() {
  const adminUser = isAdmin();
  const [poskoList, setPoskoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", address: "" });
  const [showContent, setShowContent] = useState(false);

  const loadPosko = () => {
    setLoading(true);
    getPosko()
      .then(setPoskoList)
      .catch(console.error)
      .finally(() => { setLoading(false); setTimeout(() => setShowContent(true), 80); });
  };

  useEffect(() => {
    loadPosko();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (posko) => {
    setEditingId(posko.id);
    setForm({ name: posko.name || "", address: posko.address || "" });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus posko ini?")) return;
    try {
      await deletePosko(id);
      loadPosko();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus posko");
    }
  };

  const resetForm = () => {
    setForm({ name: "", address: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updatePosko(editingId, form);
      } else {
        await createPosko(form);
      }
      resetForm();
      loadPosko();
    } catch (err) {
      alert(err.response?.data?.message || (editingId ? "Gagal update posko" : "Gagal menambah posko"));
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Posko</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola data posko tanggap darurat BPBD</p>
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
            {showForm ? "Tutup Form" : "Tambah Posko"}
          </button>
        )}
      </div>

      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Posko' : 'Formulir Posko'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Posko <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Posko Semarang Timur"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Jl. Majapahit, Semarang Timur"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 btn btn-primary py-3.5">
                {editingId ? 'Simpan Perubahan' : 'Simpan Posko'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`stat-card bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 mb-6 ${showContent ? 'show' : ''}`}>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Total Posko</p>
        <p className="text-3xl font-extrabold text-brand-600">
          <AnimatedNumber value={poskoList.length} />
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Daftar Posko
          </h2>
          <span className="text-xs text-gray-400">{poskoList.length} posko</span>
        </div>

        {loading ? (
          <SkeletonTable rows={4} cols={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Nama Posko</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Alamat</th>
                  {adminUser && (
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {poskoList.length > 0 ? (
                  poskoList.map((p) => (
                    <tr key={p.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center text-xs font-bold">
                            {p.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{p.address || "-"}</span>
                      </td>
                      {adminUser && (
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={adminUser ? 3 : 2} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                          <Building2 className="w-10 h-10 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">Belum ada data posko</p>
                          <p className="text-sm text-gray-400 mt-1">Klik "Tambah Posko" untuk menambahkan</p>
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
