import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bidang3Service from "../../services/bidang3Service";
import AnimatedNumber from "../../components/AnimatedNumber";
import { Droplets, HandHelping, Building, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

const STATUS_COLOR = {
  pending: "bg-gray-100 text-gray-600",
  diverifikasi: "bg-blue-100 text-blue-600",
  survey_dijadwalkan: "bg-indigo-100 text-indigo-600",
  sedang_survey: "bg-purple-100 text-purple-600",
  lolos_survey: "bg-emerald-100 text-emerald-600",
  tidak_lolos: "bg-red-100 text-red-600",
  proses_pencairan: "bg-amber-100 text-amber-600",
  diproses: "bg-blue-100 text-blue-600",
  dalam_pengerjaan: "bg-orange-100 text-orange-600",
  selesai: "bg-green-100 text-green-600",
};

export default function Bidang3Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    bidang3Service
      .getBidang3Stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => {
        setLoading(false);
        setTimeout(() => setShowContent(true), 80);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-100 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse">
              <div className="h-20 bg-gray-100 rounded-xl mb-4"></div>
              <div className="h-6 bg-gray-100 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-50 rounded w-48"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Bidang 3 - Distribusi Bantuan
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Kelola usulan air bersih, bansos, dan infrastruktur
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Air Bersih */}
        <Link
          to="/admin/bidang3/air-bersih"
          className={`stat-card bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group cursor-pointer ${
            showContent ? "show" : ""
          }`}
          style={{ transitionDelay: "0s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <Droplets className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Air Bersih
            </span>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">
            <AnimatedNumber value={stats?.air_bersih?.total || 0} />
          </p>
          <p className="text-sm text-gray-500 mb-4">Total usulan air bersih</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.pending}`}>
              <Clock className="w-3 h-3" /> {stats?.air_bersih?.pending || 0} Pending
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.diproses}`}>
              <AlertCircle className="w-3 h-3" /> {stats?.air_bersih?.diproses || 0} Diproses
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.selesai}`}>
              <CheckCircle className="w-3 h-3" /> {stats?.air_bersih?.selesai || 0} Selesai
            </span>
          </div>
        </Link>

        {/* Bansos */}
        <Link
          to="/admin/bidang3/bansos"
          className={`stat-card bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all group cursor-pointer ${
            showContent ? "show" : ""
          }`}
          style={{ transitionDelay: "0.1s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
              <HandHelping className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Bansos
            </span>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">
            <AnimatedNumber value={stats?.bansos?.total || 0} />
          </p>
          <p className="text-sm text-gray-500 mb-4">Total usulan bansos</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.pending}`}>
              <Clock className="w-3 h-3" /> {stats?.bansos?.pending || 0} Pending
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.lolos_survey}`}>
              <CheckCircle className="w-3 h-3" /> {stats?.bansos?.lolos || 0} Lolos
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.selesai}`}>
              <CheckCircle className="w-3 h-3" /> {stats?.bansos?.selesai || 0} Selesai
            </span>
          </div>
        </Link>

        {/* Infrastruktur */}
        <Link
          to="/admin/bidang3/infrastruktur"
          className={`stat-card bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group cursor-pointer ${
            showContent ? "show" : ""
          }`}
          style={{ transitionDelay: "0.2s" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Building className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Infrastruktur
            </span>
          </div>
          <p className="text-4xl font-extrabold text-gray-900 mb-1">
            <AnimatedNumber value={stats?.infrastruktur?.total || 0} />
          </p>
          <p className="text-sm text-gray-500 mb-4">Total usulan infrastruktur</p>
          <div className="flex gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.pending}`}>
              <Clock className="w-3 h-3" /> {stats?.infrastruktur?.pending || 0} Pending
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.lolos_survey}`}>
              <CheckCircle className="w-3 h-3" /> {stats?.infrastruktur?.lolos || 0} Lolos
            </span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR.selesai}`}>
              <CheckCircle className="w-3 h-3" /> {stats?.infrastruktur?.selesai || 0} Selesai
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/bidang3/air-bersih"
            className="flex items-center gap-3 p-4 rounded-xl border border-cyan-200 bg-cyan-50 hover:bg-cyan-100 transition-colors"
          >
            <Droplets className="w-5 h-5 text-cyan-600" />
            <span className="font-medium text-cyan-700">Kelola Air Bersih</span>
          </Link>
          <Link
            to="/admin/bidang3/bansos"
            className="flex items-center gap-3 p-4 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
          >
            <HandHelping className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-700">Kelola Bansos</span>
          </Link>
          <Link
            to="/admin/bidang3/infrastruktur"
            className="flex items-center gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <Building className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-700">Kelola Infrastruktur</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
