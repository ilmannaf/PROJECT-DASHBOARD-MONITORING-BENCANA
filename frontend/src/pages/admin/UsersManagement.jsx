import { useState, useEffect } from 'react';
import { getUsers, createUser, resetPassword, deleteUser } from '../../services/userService';
import { getCurrentUser } from '../../services/authService';

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition bg-white";

export default function UsersManagement() {
  const currentUser = getCurrentUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const loadUsers = () => {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createUser(form);
      setForm({ name: '', email: '', password: '' });
      setShowForm(false);
      setMessage('Akun petugas berhasil dibuat.');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat akun');
    }
  };

  const handleResetPassword = async (user) => {
    const password = prompt(`Reset password untuk ${user.name} (minimal 6 karakter):`);
    if (!password) return;
    if (password.length < 6) {
      alert('Password minimal 6 karakter');
      return;
    }
    try {
      await resetPassword(user.id, password);
      setMessage(`Password ${user.name} berhasil direset.`);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal reset password');
    }
  };

  const handleDelete = async (user) => {
    if (user.id === currentUser?.id) {
      alert('Tidak bisa menghapus akun sendiri');
      return;
    }
    if (!confirm(`Yakin hapus akun ${user.name}?`)) return;
    try {
      await deleteUser(user.id);
      setMessage('Akun berhasil dihapus.');
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus akun');
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Akun</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola akun petugas BPBD</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary flex items-center gap-2 px-5 py-3 shadow-lg shadow-indigo-500/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
          {showForm ? 'Tutup Form' : '+ Tambah Petugas'}
        </button>
      </div>

      {message && (
        <div className="mb-6 text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 mb-8 animate-slide-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Buat Akun Petugas Baru</h2>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Nama petugas" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@example.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password Awal <span className="text-red-500">*</span></label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="Minimal 6 karakter" className={inputClass} />
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn btn-primary flex-1 py-3.5">Simpan Akun</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-8 btn btn-secondary py-3.5">Batal</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Daftar Pengguna
          </h2>
          <span className="text-xs text-gray-400">{users.length} pengguna</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Nama</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Email</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Role</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Terdaftar</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${u.role === 'admin' ? 'bg-gradient-to-br from-gray-700 to-gray-900' : 'bg-gradient-to-br from-brand-500 to-orange-600'}`}>
                          {u.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{u.email}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-gray-100 text-gray-700' : 'bg-brand-50 text-brand-700 border border-brand-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleResetPassword(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Reset Password"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="text-sm text-gray-500 py-8 text-center">Belum ada pengguna.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}