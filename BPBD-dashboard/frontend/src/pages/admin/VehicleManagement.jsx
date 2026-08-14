import { useState, useEffect } from "react";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../services/vehicleService";
import { getPosko } from "../../services/poskoService";

const STATUS_OPTIONS = ["siap", "maintenance", "rusak"];
const STATUS_COLOR = {
  siap: "bg-green-100 text-green-700",
  maintenance: "bg-yellow-100 text-yellow-700",
  rusak: "bg-red-100 text-red-700",
};

export default function VehicleManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
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
      setForm({ plate_number: "", type: "", status: "siap" });
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Kendaraan</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {showForm ? "Batal" : "+ Tambah Kendaraan"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Plat</label>
            <input
              name="plate_number"
              value={form.plate_number}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Jenis Kendaraan
            </label>
            <input
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="Truk, Ambulans, dll"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Posko</label>
            <select
              name="posko_id"
              value={form.posko_id}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Pilih posko</option>
              {poskoList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Memuat data...</p>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4">Plat Nomor</th>
                <th className="py-2 px-4">Jenis</th>
                <th className="py-2 px-4">Posko</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="py-2 px-4 font-mono">{v.plate_number}</td>
                  <td className="py-2 px-4">{v.type || "-"}</td>
                  <td className="py-2 px-4">{v.posko_name || "-"}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs capitalize ${STATUS_COLOR[v.status]}`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 items-center">
                    <select
                      value={v.status}
                      onChange={(e) => handleStatusChange(v.id, e.target.value)}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="text-red-500 text-xs underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {vehicles.length === 0 && (
            <p className="text-sm text-gray-500 p-4">
              Belum ada data kendaraan.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
