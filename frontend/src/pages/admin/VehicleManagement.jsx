import { useState, useEffect } from "react";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../services/vehicleService";
import { getPosko } from "../../services/poskoService";
import { isAdmin } from "../../services/authService";

const STATUS_OPTIONS = ["siap", "maintenance", "rusak"];
const STATUS_BG = {
  siap: "from-emerald-500 to-green-600",
  maintenance: "from-amber-400 to-orange-500",
  rusak: "from-red-500 to-rose-600",
};

export default function VehicleManagement() {
  const adminUser = isAdmin();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    plate_number: "",
    type: "",
    status: "siap",
    posko_id: "",
  });
  const [poskoList, setPoskoList] = useState([]);

  const loadVehicles = () => {
    setLoading(true);
    getVehicles()
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicles();
    getPosko().then(setPoskoList).catch(console.error);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVehicle(form);
      setForm({ plate_number: "", type: "", status: "siap", posko_id: "" });
      setShowForm(false);
      loadVehicles();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah kendaraan");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateVehicle(id, { status });
      loadVehicles();
    } catch {
      alert("Gagal update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus kendaraan ini?")) return;
    try {
      await deleteVehicle(id);
      loadVehicles();
    } catch {
      alert("Gagal menghapus kendaraan");
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchTerm.toLowerCase();
    return (
      v.plate_number.toLowerCase().includes(q) ||
      v.type?.toLowerCase().includes(q) ||
      v.posko_name?.toLowerCase().includes(q)
    );
  });

  const countByStatus = (status) => vehicles.filter((v) => v.status === status).length;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l1.5-4.5A2 2 0 018.4 4h7.2a2 2 0 011.9 1.5L19 10M5 10h14a2 2 0 012 2v4a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1H8v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2zm2.5 3h.01M16.5 13h.01" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Kendaraan</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola armada dan kesiapan kendaraan BPBD</p>
            </div>
          </div>
        </div>
        {adminUser && (
          <button
            onClick={() => {
              if (showForm) {
                setShowForm(false);
                setForm({ plate_number: "", type: "", status: "siap", posko_id: "" });
              } else {
                setShowForm(true);
              }
            }}
            className="btn btn-primary flex items-center gap-2 px-5 py-3 shadow-lg shadow-purple-500/25"
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
            {showForm ? 'Tutup Form' : '+ Tambah Kendaraan'}
          </button>
        )}
      </div>

      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Formulir Kendaraan</h2>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Plat <span className="text-red-500">*</span></label>
              <input
                name="plate_number"
                value={form.plate_number}
                onChange={handleChange}
                required
                placeholder=" contoh: B 1234 AB"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kendaraan</label>
              <input
                name="type"
                value={form.type}
                onChange={handleChange}
                placeholder="Truk Tangki, Ambulans, Pickup, dll"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Posko</label>
              <select
                name="posko_id"
                value={form.posko_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                <option value="">Pilih posko</option>
                {poskoList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 btn btn-primary py-3.5"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm({ plate_number: "", type: "", status: "siap", posko_id: "" });
                }}
                className="px-8 btn btn-secondary py-3.5"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-3xl font-extrabold text-gray-900">{vehicles.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
          <p className="text-xs text-emerald-100 mb-1">Siap</p>
          <p className="text-3xl font-extrabold">{countByStatus('siap')}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/25">
          <p className="text-xs text-amber-100 mb-1">Maintenance</p>
          <p className="text-3xl font-extrabold">{countByStatus('maintenance')}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg shadow-red-500/25">
          <p className="text-xs text-red-100 mb-1">Rusak</p>
          <p className="text-3xl font-extrabold">{countByStatus('rusak')}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25">
          <p className="text-xs text-blue-100 mb-1">Posko</p>
          <p className="text-3xl font-extrabold">{new Set(vehicles.filter(v => v.posko_id).map(v => v.posko_id)).size}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari plat nomor, jenis, atau posko..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full border-4 border-purple-100 border-t-purple-500 animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Plat Nomor</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Jenis</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Posko</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-purple-50/40 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200">
                          {v.plate_number}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm font-medium text-gray-900">{v.type || '-'}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-600">{v.posko_name || '-'}</p>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${STATUS_BG[v.status]} text-white shadow-sm`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'siap' ? 'bg-white animate-pulse' : 'bg-white/60'}`}></span>
                          <span className="capitalize">{v.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {adminUser ? (
                          <div className="flex justify-center gap-2">
                            <select
                              value={v.status}
                              onChange={(e) => handleStatusChange(v.id, e.target.value)}
                              className="border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition bg-white capitalize cursor-pointer"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleDelete(v.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Hapus"
                            >
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
                    <td colSpan="5" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l1.5-4.5A2 2 0 018.4 4h7.2a2 2 0 011.9 1.5L19 10M5 10h14a2 2 0 012 2v4a2 2 0 01-2 2h-1a2 2 0 01-2-2v-1H8v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2zm2.5 3h.01M16.5 13h.01" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">{searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada data kendaraan'}</p>
                          <p className="text-sm text-gray-400 mt-1">{searchTerm ? 'Coba ubah kata kunci pencarian Anda' : 'Klik tombol "+ Tambah Kendaraan" untuk menambahkan'}</p>
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
