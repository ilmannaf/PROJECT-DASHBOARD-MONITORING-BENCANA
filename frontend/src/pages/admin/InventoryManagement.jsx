import { useState, useEffect } from "react";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../services/inventoryService";
import { getPosko } from "../../services/poskoService";
import { isAdmin } from "../../services/authService";
import { Package, Search, Plus, X, Trash2, Pencil } from "lucide-react";
import AnimatedNumber from '../../components/AnimatedNumber';
import { SkeletonTable } from '../../components/Skeleton';

const CATEGORIES = ["logistik", "peralatan", "p3k"];
const CONDITIONS = ["baik", "rusak", "perlu_maintenance"];
const CONDITION_COLOR = {
  baik: "from-emerald-500 to-green-600",
  rusak: "from-red-500 to-rose-600",
  perlu_maintenance: "from-amber-400 to-orange-500",
};

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

export default function InventoryManagement() {
  const adminUser = isAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "logistik",
    item_condition: "baik",
    quantity: 0,
    unit: "",
    posko_id: "",
  });
  const [poskoList, setPoskoList] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const loadItems = () => {
    setLoading(true);
    getItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => { setLoading(false); setTimeout(() => setShowContent(true), 80); });
  };

  useEffect(() => {
    loadItems();
    getPosko().then(setPoskoList).catch(console.error);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "logistik",
      item_condition: item.item_condition || "baik",
      quantity: item.quantity || 0,
      unit: item.unit || "",
      posko_id: item.posko_id || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      category: "logistik",
      item_condition: "baik",
      quantity: 0,
      unit: "",
      posko_id: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateItem(editingId, form);
      } else {
        await createItem(form);
      }
      resetForm();
      loadItems();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan item");
    }
  };

  const handleConditionChange = async (id, item_condition) => {
    try {
      await updateItem(id, { item_condition });
      loadItems();
    } catch {
      alert("Gagal update kondisi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus item ini?")) return;
    try {
      await deleteItem(id);
      loadItems();
    } catch {
      alert("Gagal menghapus item");
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.posko_name?.toLowerCase().includes(q)
    );
  });

  const countByCondition = (c) => items.filter((i) => i.item_condition === c).length;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Inventaris</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola data inventaris dan logistik BPBD</p>
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
            {showForm ? "Tutup Form" : "Tambah Item"}
          </button>
        )}
      </div>

      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${editingId ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-brand-500 to-brand-700'}`}>
                {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Data Inventaris' : 'Formulir Inventaris'}</h2>
            </div>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Nama barang inventaris"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Satuan</label>
              <input
                name="unit"
                value={form.unit}
                onChange={handleChange}
                placeholder="unit, kg, kotak, dll"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Posko</label>
              <select
                name="posko_id"
                value={form.posko_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Pilih posko</option>
                {poskoList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kondisi</label>
              <select
                name="item_condition"
                value={form.item_condition}
                onChange={handleChange}
                className={inputClass}
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c} className="capitalize">
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className={`flex-1 btn py-3.5 ${editingId ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-blue-500/40 text-white' : 'btn-primary'}`}>
                {editingId ? 'Simpan Perubahan' : 'Simpan Item'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={items.length} /></p>
          <p className="text-xs text-gray-500 mt-1">Total item inventaris</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.08s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">✓</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Baik</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={countByCondition("baik")} /></p>
          <p className="text-xs text-gray-500 mt-1">Kondisi baik</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.16s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">!</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Maintenance</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={countByCondition("perlu_maintenance")} /></p>
          <p className="text-xs text-gray-500 mt-1">Perlu maintenance</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? 'show' : ''}`} style={{ transitionDelay: '0.24s' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">✕</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Rusak</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={countByCondition("rusak")} /></p>
          <p className="text-xs text-gray-500 mt-1">Kondisi rusak</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Daftar Inventaris</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama barang, kategori, atau posko..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Nama Barang</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kategori</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Jumlah</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Posko</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Kondisi</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/40 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="capitalize text-sm text-gray-700">{item.category}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-gray-900">
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">{item.posko_name || "-"}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${CONDITION_COLOR[item.item_condition]} text-white shadow-sm capitalize`}
                        >
                          {item.item_condition.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {adminUser ? (
                            <>
                              <select
                                value={item.item_condition}
                                onChange={(e) =>
                                  handleConditionChange(item.id, e.target.value)
                                }
                                className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white capitalize cursor-pointer"
                              >
                                {CONDITIONS.map((c) => (
                                  <option key={c} value={c}>
                                    {c.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            {searchTerm ? "Tidak ada hasil" : "Belum ada data inventaris"}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? "Coba ubah kata kunci" : 'Klik "Tambah Item" untuk memulai'}
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
