import { useState, useEffect } from 'react';
import { getPosko, createPosko } from '../../services/poskoService';

export default function PoskoManagement() {
  const [poskoList, setPoskoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '' });

  const loadPosko = () => {
    setLoading(true);
    getPosko().then(setPoskoList).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { loadPosko(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPosko(form);
      setForm({ name: '', address: '' });
      setShowForm(false);
      loadPosko();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambah posko');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen Posko</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm">
          {showForm ? 'Batal' : '+ Tambah Posko'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Posko</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Posko Semarang Timur" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Alamat</label>
            <input name="address" value={form.address} onChange={handleChange} placeholder="Jl. Majapahit, Semarang Timur" className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">Simpan</button>
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
                <th className="py-2 px-4">Nama Posko</th>
                <th className="py-2 px-4">Alamat</th>
              </tr>
            </thead>
            <tbody>
              {poskoList.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4">{p.address || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {poskoList.length === 0 && <p className="text-sm text-gray-500 p-4">Belum ada data posko.</p>}
        </div>
      )}
    </div>
  );
}