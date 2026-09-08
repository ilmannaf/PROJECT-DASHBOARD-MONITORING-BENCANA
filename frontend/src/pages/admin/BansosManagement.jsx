import { useState, useEffect } from "react";
import bidang3Service from "../../services/bidang3Service";
import { getDisasterRecords } from "../../services/disasterService";
import { isAdmin } from "../../services/authService";
import { HandHelping, Search, Plus, X, Trash2, Eye, CheckCircle, Clock, FileText } from "lucide-react";
import AnimatedNumber from "../../components/AnimatedNumber";
import { SkeletonTable } from "../../components/Skeleton";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-600" },
  { value: "diverifikasi", label: "Diverifikasi", color: "bg-blue-100 text-blue-600" },
  { value: "survey_dijadwalkan", label: "Survey Dijadwalkan", color: "bg-indigo-100 text-indigo-600" },
  { value: "sedang_survey", label: "Sedang Survey", color: "bg-purple-100 text-purple-600" },
  { value: "lolos_survey", label: "Lolos Survey", color: "bg-emerald-100 text-emerald-600" },
  { value: "tidak_lolos", label: "Tidak Lolos", color: "bg-red-100 text-red-600" },
  { value: "proses_pencairan", label: "Proses Pencairan", color: "bg-amber-100 text-amber-600" },
  { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-600" },
];

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

export default function BansosManagement() {
  const adminUser = isAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [disasterRecords, setDisasterRecords] = useState([]);
  const [form, setForm] = useState({
    disaster_record_id: "",
    kelurahan: "",
    kecamatan: "",
    nama_penerima: "",
    nik_penerima: "",
    alamat_penerima: "",
    phone_penerima: "",
    usulan_description: "",
  });
  const [suratFile, setSuratFile] = useState(null);

  const loadItems = () => {
    setLoading(true);
    bidang3Service
      .getBansosProposals()
      .then(setItems)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 80);
      });
  };

  useEffect(() => {
    loadItems();
    getDisasterRecords().then(setDisasterRecords).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({ disaster_record_id: "", kelurahan: "", kecamatan: "", nama_penerima: "", nik_penerima: "", alamat_penerima: "", phone_penerima: "", usulan_description: "" });
    setSuratFile(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (suratFile) formData.append("surat_pengajuan", suratFile);
      await bidang3Service.createBansosProposal(formData);
      resetForm();
      loadItems();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan usulan");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await bidang3Service.updateBansosStatus(id, { status, note: `Status diubah ke ${status}` });
      loadItems();
    } catch {
      alert("Gagal update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus usulan ini?")) return;
    try {
      await bidang3Service.deleteBansosProposal(id);
      loadItems();
    } catch {
      alert("Gagal menghapus usulan");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const detail = await bidang3Service.getBansosProposalById(id);
      setShowDetail(detail);
    } catch {
      alert("Gagal memuat detail");
    }
  };

  const filteredItems = items.filter((item) => {
    const q = searchTerm.toLowerCase();
    return (
      item.kelurahan?.toLowerCase().includes(q) ||
      item.nama_penerima?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q)
    );
  });

  const countByStatus = (s) => items.filter((i) => i.status === s).length;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <HandHelping className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Usulan Bansos</h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola usulan bantuan sosial dari kelurahan</p>
            </div>
          </div>
        </div>
        {adminUser && (
          <button
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/25 px-5 py-3"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? "Tutup Form" : "Tambah Usulan"}
          </button>
        )}
      </div>

      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Formulir Usulan Bansos</h2>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data Bencana <span className="text-red-500">*</span>
              </label>
              <select name="disaster_record_id" value={form.disaster_record_id} onChange={handleChange} required className={inputClass}>
                <option value="">Pilih data bencana</option>
                {disasterRecords.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.location} - {d.kelurahan} ({new Date(d.disaster_date).toLocaleDateString("id-ID")})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kelurahan <span className="text-red-500">*</span>
              </label>
              <input name="kelurahan" value={form.kelurahan} onChange={handleChange} required placeholder="Nama kelurahan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Kecamatan</label>
              <input name="kecamatan" value={form.kecamatan} onChange={handleChange} placeholder="Nama kecamatan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Penerima <span className="text-red-500">*</span>
              </label>
              <input name="nama_penerima" value={form.nama_penerima} onChange={handleChange} required placeholder="Nama lengkap penerima" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">NIK Penerima</label>
              <input name="nik_penerima" value={form.nik_penerima} onChange={handleChange} placeholder="16 digit NIK" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Penerima</label>
              <input name="alamat_penerima" value={form.alamat_penerima} onChange={handleChange} placeholder="Alamat lengkap" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">No. HP Penerima</label>
              <input name="phone_penerima" value={form.phone_penerima} onChange={handleChange} placeholder="08xxx" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Surat Pengajuan</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setSuratFile(e.target.files[0])} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Usulan</label>
              <textarea name="usulan_description" value={form.usulan_description} onChange={handleChange} rows={3} placeholder="Jelaskan kebutuhan bantuan sosial..." className={inputClass} />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="flex-1 btn btn-primary py-3.5">Simpan Usulan</button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HandHelping className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={items.length} /></p>
          <p className="text-xs text-gray-500 mt-1">Total usulan</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.08s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Survey</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">
            <AnimatedNumber value={countByStatus("survey_dijadwalkan") + countByStatus("sedang_survey")} />
          </p>
          <p className="text-xs text-gray-500 mt-1">Dalam survey</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.16s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pencairan</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={countByStatus("proses_pencairan")} /></p>
          <p className="text-xs text-gray-500 mt-1">Proses pencairan</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.24s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Selesai</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={countByStatus("selesai")} /></p>
          <p className="text-xs text-gray-500 mt-1">Selesai diproses</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Daftar Usulan Bansos</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari kelurahan, nama penerima, atau status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Kelurahan</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Penerima</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Lokasi Bencana</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const statusInfo = STATUS_OPTIONS.find((s) => s.value === item.status) || STATUS_OPTIONS[0];
                    return (
                      <tr key={item.id} className="hover:bg-orange-50/40 transition-colors group">
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900 text-sm">{item.kelurahan}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{item.kecamatan || "-"}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-gray-900">{item.nama_penerima || "-"}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{item.nik_penerima || "-"}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{item.location || "-"}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {adminUser ? (
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color} border-0 cursor-pointer focus:ring-2 focus:ring-brand-500`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewDetail(item.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {adminUser && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                          <HandHelping className="w-10 h-10 text-gray-300" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-700">
                            {searchTerm ? "Tidak ada hasil" : "Belum ada usulan bansos"}
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? "Coba ubah kata kunci" : 'Klik "Tambah Usulan" untuk memulai'}
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

      {/* Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDetail(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Detail Usulan Bansos</h3>
              <button onClick={() => setShowDetail(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="font-semibold text-gray-700">Kelurahan:</span> {showDetail.kelurahan}</div>
              <div><span className="font-semibold text-gray-700">Kecamatan:</span> {showDetail.kecamatan || "-"}</div>
              <div><span className="font-semibold text-gray-700">Lokasi Bencana:</span> {showDetail.location || "-"}</div>
              <div><span className="font-semibold text-gray-700">Nama Penerima:</span> {showDetail.nama_penerima}</div>
              <div><span className="font-semibold text-gray-700">NIK:</span> {showDetail.nik_penerima || "-"}</div>
              <div><span className="font-semibold text-gray-700">Alamat:</span> {showDetail.alamat_penerima || "-"}</div>
              <div><span className="font-semibold text-gray-700">No. HP:</span> {showDetail.phone_penerima || "-"}</div>
              <div><span className="font-semibold text-gray-700">Deskripsi:</span> {showDetail.usulan_description || "-"}</div>
              <div><span className="font-semibold text-gray-700">Status:</span> {showDetail.status}</div>
              {showDetail.surat_pengajuan_url && (
                <div>
                  <span className="font-semibold text-gray-700">Surat Pengajuan:</span>
                  <a href={showDetail.surat_pengajuan_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                    Lihat Surat
                  </a>
                </div>
              )}
              {showDetail.status_history?.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Riwayat Status:</span>
                  <div className="mt-2 space-y-2">
                    {showDetail.status_history.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="font-medium text-gray-600">{new Date(h.created_at).toLocaleString("id-ID")}</span>
                        <span className="text-gray-400">-</span>
                        <span>{h.status_from} → {h.status_to}</span>
                        {h.note && <span className="text-gray-500">({h.note})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
