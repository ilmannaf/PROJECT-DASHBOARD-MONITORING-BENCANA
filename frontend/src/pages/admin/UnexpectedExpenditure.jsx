import { useState, useEffect, useRef } from "react";
import unexpectedExpenditureService from "../../services/unexpectedExpenditureService";
import bttPenerimaService from "../../services/bttPenerimaService";
import { getDisasterRecords } from "../../services/disasterService";
import { isAdmin } from "../../services/authService";
import { Wallet, Search, Plus, X, Trash2, Eye, CheckCircle, Clock, Printer, Edit, Download } from "lucide-react";
import AnimatedNumber from "../../components/AnimatedNumber";
import { SkeletonTable } from "../../components/Skeleton";

const inputClass =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition shadow-sm bg-white";

function terbilang(angka) {
  if (!angka || angka === 0) return "NOL RUPIAH";
  const bilangan = ["", "SATU", "DUA", "TIGA", "EMPAT", "LIMA", "ENAM", "TUJUH", "DELAPAN", "SEMBILAN"];
  const belasan = ["SEPULUH", "SEBELAS", "DUA BELAS", "TIGA BELAS", "EMPAT BELAS", "LIMA BELAS", "ENAM BELAS", "TUJUH BELAS", "DELAPAN BELAS", "SEMBILAN BELAS"];
  const puluhan = ["", "", "DUA PULUH", "TIGA PULUH", "EMPAT PULUH", "LIMA PULUH", "ENAM PULUH", "TUJUH PULUH", "DELAPAN PULUH", "SEMBILAN PULUH"];

  const convert = (n) => {
    if (n < 10) return bilangan[n];
    if (n < 20) return belasan[n - 10];
    if (n < 100) return (puluhan[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + bilangan[n % 10] : ""));
    if (n < 1000) return (bilangan[Math.floor(n / 100)] + " RATUS" + (n % 100 !== 0 ? " " + convert(n % 100) : ""));
    if (n < 1000000) return (convert(Math.floor(n / 1000)) + " RIBU" + (n % 1000 !== 0 ? " " + convert(n % 1000) : ""));
    if (n < 1000000000) return (convert(Math.floor(n / 1000000)) + " JUTA" + (n % 1000000 !== 0 ? " " + convert(n % 1000000) : ""));
    return (convert(Math.floor(n / 1000000000)) + " MILIAR" + (n % 1000000000 !== 0 ? " " + convert(n % 1000000000) : ""));
  };

  return convert(Math.floor(angka)) + " RUPIAH";
}

export default function UnexpectedExpenditure() {
  const adminUser = isAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [disasterRecords, setDisasterRecords] = useState([]);
  const [penerimaList, setPenerimaList] = useState([]);
  const [penerimaLoading, setPenerimaLoading] = useState(false);
  const [editPenerima, setEditPenerima] = useState(null);
  const [form, setForm] = useState({
    disaster_record_id: "",
    nama_penerima: "",
    no_kk: "",
    nik: "",
    jenis_bencana: "",
    tanggal_kejadian: "",
    kategori_kerusakan: "",
    kerusakan: "",
    status_pendanaan: "belum_cair",
    tanggal_pencairan: "",
    persentase_kerusakan: "100",
    alamat: "",
    kelurahan: "",
    kecamatan: "",
    besaran_bantuan: "",
  });

  const printRef = useRef();

  const loadItems = () => {
    setLoading(true);
    unexpectedExpenditureService
      .getUnexpectedExpenditures()
      .then(setItems)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 80);
      });
  };

  const loadPenerima = () => {
    setPenerimaLoading(true);
    bttPenerimaService
      .getBttPenerimaByBttId(1)
      .then(setPenerimaList)
      .catch(() => setPenerimaList([]))
      .finally(() => setPenerimaLoading(false));
  };

  useEffect(() => {
    loadItems();
    loadPenerima();
    getDisasterRecords().then(setDisasterRecords).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm({
      disaster_record_id: "",
      nama_penerima: "",
      no_kk: "",
      nik: "",
      jenis_bencana: "",
      tanggal_kejadian: "",
      kategori_kerusakan: "",
      kerusakan: "",
      status_pendanaan: "belum_cair",
      tanggal_pencairan: "",
      persentase_kerusakan: "100",
      alamat: "",
      kelurahan: "",
      kecamatan: "",
      besaran_bantuan: "",
    });
    setShowForm(false);
    setEditPenerima(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editPenerima) {
        await bttPenerimaService.updateBttPenerima(editPenerima.id, form);
      } else {
        await bttPenerimaService.createBttPenerima({ ...form, btt_id: items[0]?.id || 1 });
      }
      resetForm();
      loadPenerima();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan data");
    }
  };

  const handleEdit = (p) => {
    setEditPenerima(p);
    setForm({
      disaster_record_id: p.btt_id || "",
      nama_penerima: p.nama_penerima,
      no_kk: p.no_kk || "",
      nik: p.nik || "",
      jenis_bencana: p.jenis_bencana,
      tanggal_kejadian: p.tanggal_kejadian ? new Date(p.tanggal_kejadian).toISOString().split("T")[0] : "",
      kategori_kerusakan: p.kategori_kerusakan || "",
      kerusakan: p.kerusakan,
      status_pendanaan: p.status_pendanaan || "belum_cair",
      tanggal_pencairan: p.tanggal_pencairan ? new Date(p.tanggal_pencairan).toISOString().split("T")[0] : "",
      persentase_kerusakan: String(p.persentase_kerusakan),
      alamat: p.alamat,
      kelurahan: p.kelurahan,
      kecamatan: p.kecamatan,
      besaran_bantuan: String(p.besaran_bantuan),
    });
    setShowForm(true);
  };

  const handleDeletePenerima = async (id) => {
    if (!confirm("Yakin hapus data penerima ini?")) return;
    try {
      await bttPenerimaService.deleteBttPenerima(id);
      loadPenerima();
    } catch {
      alert("Gagal menghapus data penerima");
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Daftar Usulan Nama Penerima BTT</title>
          <style>
            body { font-family: 'Times New Roman', serif; margin: 20px; font-size: 12pt; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid black; padding: 8px 6px; text-align: left; vertical-align: top; }
            th { background-color: #ddd; font-weight: bold; text-align: center; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h2 { margin: 5px 0; text-transform: uppercase; }
            .total-row { font-weight: bold; background-color: #f0f0f0; }
            .terbilang { font-style: italic; margin-top: 10px; }
            .signature { margin-top: 60px; text-align: right; padding-right: 40px; }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExport = async () => {
    try {
      await bttPenerimaService.exportBttPenerima();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengekspor data BTT");
    }
  };

  const filteredPenerima = penerimaList.filter((p) => {
    const q = searchTerm.toLowerCase();
    return (
      p.nama_penerima?.toLowerCase().includes(q) ||
      p.kelurahan?.toLowerCase().includes(q) ||
      p.kecamatan?.toLowerCase().includes(q)
    );
  });

  const totalBantuan = penerimaList.reduce((sum, p) => sum + (Number(p.besaran_bantuan) || 0), 0);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Belanja Tak Terduga (BTT)</h1>
              <p className="text-gray-500 text-sm mt-0.5">Daftar usulan nama penerima dana bantuan sosial</p>
            </div>
          </div>
        </div>
        {adminUser && (
          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="btn flex items-center gap-2 px-5 py-3 bg-green-200 text-green-900 border border-green-400 hover:bg-green-300 hover:border-green-500 shadow-sm">
              <Download className="w-5 h-5" /> Export Excel
            </button>
            <button
              onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
              className="btn btn-primary flex items-center gap-2 shadow-lg shadow-brand-500/25 px-5 py-3"
            >
              {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showForm ? "Tutup Form" : "Tambah Data"}
            </button>
          </div>
        )}
      </div>

      {/* Form Tambah/Edit Data */}
      {showForm && adminUser && (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-8 mb-8 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editPenerima ? "Edit Data Penerima" : "Formulir Tambah Data Penerima"}
            </h2>
            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Penerima <span className="text-red-500">*</span>
              </label>
              <input name="nama_penerima" value={form.nama_penerima} onChange={handleChange} required placeholder="Nama lengkap penerima" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">No. KK</label>
              <input name="no_kk" value={form.no_kk} onChange={handleChange} placeholder="Nomor Kartu Keluarga" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">NIK</label>
              <input name="nik" value={form.nik} onChange={handleChange} placeholder="Nomor Induk Kependudukan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jenis Bencana <span className="text-red-500">*</span>
              </label>
              <input name="jenis_bencana" value={form.jenis_bencana} onChange={handleChange} required placeholder="Contoh: Pohon Tumbang, Banjir, dll" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tanggal Kejadian <span className="text-red-500">*</span>
              </label>
              <input name="tanggal_kejadian" type="date" value={form.tanggal_kejadian} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kategori Kerusakan
              </label>
              <input name="kategori_kerusakan" value={form.kategori_kerusakan} onChange={handleChange} placeholder="Contoh: Rumah rusak berat 70%" className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan Kerusakan</label>
              <textarea name="kerusakan" value={form.kerusakan} onChange={handleChange} rows={2} placeholder="Uraian kerusakan atau kondisi penerima" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status Pendanaan <span className="text-red-500">*</span></label>
              <select name="status_pendanaan" value={form.status_pendanaan} onChange={handleChange} required className={inputClass}>
                <option value="belum_cair">Belum Cair</option>
                <option value="cair">Cair</option>
                <option value="tidak_cair">Tidak Cair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Pencairan</label>
              <input name="tanggal_pencairan" type="date" value={form.tanggal_pencairan} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Persentase Kerusakan (%) <span className="text-red-500">*</span>
              </label>
              <input name="persentase_kerusakan" type="number" min="0" max="100" value={form.persentase_kerusakan} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alamat <span className="text-red-500">*</span>
              </label>
              <input name="alamat" value={form.alamat} onChange={handleChange} required placeholder="Alamat lengkap (contoh: Jl. Psr. Anjatlobaru 23 RT/RW 16/27)" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kelurahan <span className="text-red-500">*</span>
              </label>
              <input name="kelurahan" value={form.kelurahan} onChange={handleChange} required placeholder="Nama kelurahan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kecamatan <span className="text-red-500">*</span>
              </label>
              <input name="kecamatan" value={form.kecamatan} onChange={handleChange} required placeholder="Nama kecamatan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Besaran Bantuan (Rp) <span className="text-red-500">*</span>
              </label>
              <input name="besaran_bantuan" type="number" value={form.besaran_bantuan} onChange={handleChange} required placeholder="0" className={inputClass} />
            </div>
            <div className="flex gap-3 items-end">
              <button type="submit" className="flex-1 btn btn-primary py-3.5">
                {editPenerima ? "Update Data" : "Simpan Data"}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary py-3.5 px-8">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Penerima</span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900"><AnimatedNumber value={penerimaList.length} /></p>
          <p className="text-xs text-gray-500 mt-1">Jumlah penerima bantuan</p>
        </div>
        <div className={`stat-card bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group ${showContent ? "show" : ""}`} style={{ transitionDelay: "0.08s" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Bantuan</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">Rp {totalBantuan.toLocaleString("id-ID")}</p>
          <p className="text-xs text-gray-500 mt-1">Total besaran bantuan</p>
        </div>
      </div>

      {/* Table Daftar Penerima */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Daftar Usulan Nama Penerima Bantuan Sosial</h3>
            </div>
            {penerimaList.length > 0 && (
              <div className="flex items-center gap-2">
                <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
                  <Printer className="w-4 h-4" /> Cetak Lampiran
                </button>
              </div>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama penerima, kelurahan, atau kecamatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {penerimaLoading ? (
          <SkeletonTable rows={5} cols={8} />
        ) : filteredPenerima.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center w-10">No</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Nama Penerima</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">No. KK</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">NIK</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Jenis Bencana</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Tanggal Kejadian</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Kategori Kerusakan</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Alamat</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Kecamatan</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status Pendanaan</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">Tanggal Pencairan</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Besaran Bantuan</th>
                  {adminUser && <th className="py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPenerima.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-orange-50/40 transition-colors group">
                    <td className="py-4 px-4 text-center text-gray-500 font-medium">{idx + 1}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{p.nama_penerima}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{p.no_kk || "-"}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{p.nik || "-"}</td>
                    <td className="py-4 px-4 text-gray-600">{p.jenis_bencana}</td>
                    <td className="py-4 px-4 text-center text-gray-600">{new Date(p.tanggal_kejadian).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{p.kategori_kerusakan || p.kerusakan || "-"}</td>
                    <td className="py-4 px-4 text-gray-600 text-xs">{p.alamat}</td>
                    <td className="py-4 px-4 text-gray-600">{p.kecamatan}</td>
                    <td className="py-4 px-4 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${p.status_pendanaan === "cair" ? "bg-green-100 text-green-700" : p.status_pendanaan === "tidak_cair" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{p.status_pendanaan === "cair" ? "Cair" : p.status_pendanaan === "tidak_cair" ? "Tidak Cair" : "Belum Cair"}</span></td>
                    <td className="py-4 px-4 text-center text-gray-600 text-xs">{p.tanggal_pencairan ? new Date(p.tanggal_pencairan).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="py-4 px-4 text-right font-semibold text-gray-900">
                      Rp {Number(p.besaran_bantuan).toLocaleString("id-ID")}
                    </td>
                    {adminUser && (
                      <td className="py-4 px-4">
                        <div className="flex justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePenerima(p.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={adminUser ? 10 : 10} className="py-4 px-4 text-right text-sm text-gray-700">TOTAL</td>
                  <td className="py-4 px-4 text-right text-sm text-gray-900">
                    Rp {totalBantuan.toLocaleString("id-ID")}
                  </td>
                  {adminUser && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center">
                <Wallet className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  {searchTerm ? "Tidak ada hasil" : "Belum ada data penerima"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm ? "Coba ubah kata kunci" : 'Klik "Tambah Data" untuk memulai'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!penerimaLoading && penerimaList.length > 0 && (
          <div className="p-6 border-t border-gray-100">
            <p className="text-sm text-gray-600 italic">
              Terbilang: {terbilang(totalBantuan)}
            </p>
          </div>
        )}
      </div>

      {/* Print Layout (Hidden) */}
      <div ref={printRef} className="hidden">
        <div className="header">
          <h2>LAMPIRAN I</h2>
          <p>NOMOR: ........../........../2026</p>
          <p>TANGGAL: ............... 2026</p>
          <br />
          <h2>DAFTAR USULAN NAMA PENERIMA DANA BANTUAN SOSIAL</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>NO</th>
              <th>NAMA KEPALA KELUARGA</th>
              <th>NO. KK</th>
              <th>NIK</th>
              <th>JENIS BENCANA</th>
              <th>TANGGAL KEJADIAN</th>
              <th>ALAMAT (RT/RW)</th>
              <th>KATEGORI KERUSAKAN</th>
              <th>STATUS PENDANAAN</th>
              <th>TANGGAL PENCAIRAN</th>
              <th>BESAR BANTUAN</th>
            </tr>
          </thead>
          <tbody>
            {penerimaList.map((p, idx) => (
              <tr key={p.id}>
                <td style={{ textAlign: "center" }}>{idx + 1}</td>
                <td>{p.nama_penerima}</td>
                <td>{p.no_kk || ""}</td>
                <td>{p.nik || ""}</td>
                <td>{p.jenis_bencana}</td>
                <td style={{ textAlign: "center" }}>{new Date(p.tanggal_kejadian).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</td>
                <td>{p.alamat}</td>
                <td>{p.kategori_kerusakan || p.kerusakan || ""}</td>
                <td>{p.status_pendanaan === "cair" ? "Cair" : p.status_pendanaan === "tidak_cair" ? "Tidak Cair" : "Belum Cair"}</td>
                <td>{p.tanggal_pencairan ? new Date(p.tanggal_pencairan).toLocaleDateString("id-ID") : ""}</td>
                <td style={{ textAlign: "right" }}>Rp {Number(p.besaran_bantuan).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan="10" style={{ textAlign: "right", fontWeight: "bold" }}>TOTAL</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>Rp {totalBantuan.toLocaleString("id-ID")}</td>
            </tr>
          </tfoot>
        </table>
        <p className="terbilang">
          Terbilang: {terbilang(totalBantuan)}
        </p>
        <div className="signature">
          <p>Kepala Pelaksana,</p>
          <br /><br /><br />
          <p><strong>Drs. Endro Pudyo Martantono, M.Si.</strong></p>
          <p>Pembina Utama Muda (IV / c)</p>
          <p>NIP. 197004201989011002</p>
        </div>
      </div>
    </div>
  );
}
