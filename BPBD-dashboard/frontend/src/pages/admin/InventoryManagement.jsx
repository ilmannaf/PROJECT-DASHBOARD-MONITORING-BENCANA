import { useState, useEffect } from "react";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../services/inventoryService";
import { getPosko } from "../../services/poskoService";

const CATEGORIES = ["logistik", "peralatan", "p3k"];
const CONDITIONS = ["baik", "rusak", "perlu_maintenance"];
const CONDITION_COLOR = {
  baik: "bg-green-100 text-green-700",
  rusak: "bg-red-100 text-red-700",
  perlu_maintenance: "bg-yellow-100 text-yellow-700",
};

export default function InventoryManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "logistik",
    item_condition: "baik",
    quantity: 0,
    unit: "",
    posko_id: "",
  });
  const [poskoList, setPoskoList] = useState([]);

  const loadItems = () => {
    setLoading(true);
    getItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
    getPosko().then(setPoskoList).catch(console.error);
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createItem(form);
      setForm({
        name: "",
        category: "logistik",
        item_condition: "baik",
        quantity: 0,
        unit: "",
      });
      setShowForm(false);
      loadItems();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menambah item");
    }
  };

  const handleConditionChange = async (id, item_condition) => {
    try {
      await updateItem(id, { item_condition });
      loadItems();
    } catch (err) {
      alert("Gagal update kondisi");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus item ini?")) return;
    try {
      await deleteItem(id);
      loadItems();
    } catch (err) {
      alert("Gagal menghapus item");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Inventaris</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          {showForm ? "Batal" : "+ Tambah Item"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Nama Barang
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Jumlah</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Satuan</label>
            <input
              name="unit"
              value={form.unit}
              onChange={handleChange}
              placeholder="unit, kg, kotak, dll"
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
                <th className="py-2 px-4">Nama</th>
                <th className="py-2 px-4">Kategori</th>
                <th className="py-2 px-4">Jumlah</th>
                <th className="py-2 px-4">Posko</th>
                <th className="py-2 px-4">Kondisi</th>
                <th className="py-2 px-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="py-2 px-4">{item.name}</td>
                  <td className="py-2 px-4 capitalize">{item.category}</td>
                  <td className="py-2 px-4">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="py-2 px-4">{item.posko_name || "-"}</td>
                  <td className="py-2 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${CONDITION_COLOR[item.item_condition]}`}
                    >
                      {item.item_condition}
                    </span>
                  </td>
                  <td className="py-2 px-4 flex gap-2 items-center">
                    <select
                      value={item.item_condition}
                      onChange={(e) =>
                        handleConditionChange(item.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-xs"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 text-xs underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="text-sm text-gray-500 p-4">
              Belum ada data inventaris.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
