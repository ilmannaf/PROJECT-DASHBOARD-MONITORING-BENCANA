import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";
import { getAllPetugasProfiles } from "../../services/profileService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  Briefcase,
  XCircle,
  Coffee,
  Mail,
  MapPin,
  Shield,
  Clock,
  X,
  FileText,
  User,
  ChevronDown,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ---- Status config ----
const STATUS_CONFIG = {
  on_duty: {
    label: "Sedang Bertugas",
    icon: Briefcase,
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/25",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  off_duty: {
    label: "Off Duty",
    icon: XCircle,
    gradient: "from-gray-400 to-gray-500",
    shadow: "shadow-gray-400/25",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    dot: "bg-gray-400",
  },
  resting: {
    label: "Istirahat",
    icon: Coffee,
    gradient: "from-amber-400 to-amber-500",
    shadow: "shadow-amber-400/25",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
};

const FILTER_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "on_duty", label: "Sedang Bertugas" },
  { value: "off_duty", label: "Off Duty" },
  { value: "resting", label: "Istirahat" },
];

// ---- Animation variants ----
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.9, y: 20 },
};

export default function PetugasProfiles() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [petugas, setPetugas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showFilter, setShowFilter] = useState(false);
  const [selectedPetugas, setSelectedPetugas] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      navigate("/admin/login");
      return;
    }
    loadProfiles();
  }, [user?.id]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getAllPetugasProfiles();
      setPetugas(data);
    } catch (err) {
      console.error("Gagal memuat profil petugas:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Filter & search ----
  const filtered = petugas.filter((p) => {
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.wilayah?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  // ---- Stats ----
  const stats = {
    total: petugas.length,
    on_duty: petugas.filter((p) => p.status === "on_duty").length,
    off_duty: petugas.filter((p) => p.status === "off_duty").length,
    resting: petugas.filter((p) => p.status === "resting").length,
  };

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    return `${API_BASE.replace("/api", "")}${photoUrl}`;
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/80">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6"
      >
        {/* ---- Header ---- */}
        <motion.div variants={cardVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                Profil Petugas
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Lihat profil semua petugas BPBD</p>
            </div>
          </div>
        </motion.div>

        {/* ---- Stats ---- */}
        <motion.div variants={cardVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Users}
            label="Total Petugas"
            value={stats.total}
            gradient="from-brand-500 to-brand-600"
          />
          <StatCard
            icon={Briefcase}
            label="Bertugas"
            value={stats.on_duty}
            gradient="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={XCircle}
            label="Off Duty"
            value={stats.off_duty}
            gradient="from-gray-400 to-gray-500"
          />
          <StatCard
            icon={Coffee}
            label="Istirahat"
            value={stats.resting}
            gradient="from-amber-400 to-amber-500"
          />
        </motion.div>

        {/* ---- Search & Filter ---- */}
        <motion.div variants={cardVariants} className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, atau wilayah..."
              className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 bg-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              {FILTER_OPTIONS.find((f) => f.value === filter)?.label}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {showFilter && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 py-2 z-20"
                >
                  {FILTER_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilter(opt.value);
                        setShowFilter(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        filter === opt.value
                          ? "bg-brand-50 text-brand-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ---- Petugas Grid ---- */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded-lg w-full" />
                  <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            variants={cardVariants}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-gray-700">Tidak ada petugas ditemukan</p>
            <p className="text-sm text-gray-400 mt-1">
              {search || filter !== "all"
                ? "Coba ubah kata kunci atau filter"
                : "Belum ada data petugas"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((p) => {
              const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.on_duty;
              const StatusIcon = statusCfg.icon;
              const photoUrl = getPhotoUrl(p.photo_url);
              const initials = getInitials(p.name);

              return (
                <motion.div
                  key={p.id}
                  variants={cardVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  onClick={() => setSelectedPetugas(p)}
                  className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 cursor-pointer hover:shadow-2xl hover:shadow-gray-300/40 transition-all duration-300 group"
                >
                  {/* Header: avatar + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-gray-100 shadow-md">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                              <span className="text-lg font-bold text-white">{initials}</span>
                            </div>
                          )}
                        </div>
                        {/* Status dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${statusCfg.dot}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{p.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{p.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${statusCfg.bg} border ${statusCfg.border} mb-3`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusCfg.text}`} />
                    <span className={`text-xs font-semibold ${statusCfg.text}`}>{statusCfg.label}</span>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-xs text-gray-500">
                    {p.wilayah && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{p.wilayah}</span>
                      </div>
                    )}
                    {p.bio && (
                      <div className="flex items-start gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                        <p className="line-clamp-2 leading-relaxed">{p.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(p.created_at)}
                    </span>
                    <span className="text-[11px] text-brand-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Lihat Detail
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* ---- Detail Modal ---- */}
      <AnimatePresence>
        {selectedPetugas && (
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedPetugas(null)}
            />
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden"
            >
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-brand-500 via-orange-400 to-amber-400 relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg4VjI0aDI4ek0xMiAxNnYySDR2LTJoOHptMjggMjh2MkgzNHYtMmg2em0wLTR2Mkg4VjI0aDI4ek0xMiA4djJINHYtMmg4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setSelectedPetugas(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="px-6 pb-6 -mt-10 relative">
                {/* Avatar */}
                <div className="mb-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-white">
                    {getPhotoUrl(selectedPetugas.photo_url) ? (
                      <img
                        src={getPhotoUrl(selectedPetugas.photo_url)}
                        alt={selectedPetugas.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {getInitials(selectedPetugas.name)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Name + status */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPetugas.name}</h2>
                    <ModalStatusBadge status={selectedPetugas.status} />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <span>{selectedPetugas.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="capitalize">{selectedPetugas.role}</span>
                  </div>
                  {selectedPetugas.wilayah && (
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <span>{selectedPetugas.wilayah}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <span>Bergabung {formatDate(selectedPetugas.created_at)}</span>
                  </div>
                </div>

                {/* Bio */}
                {selectedPetugas.bio && (
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Bio</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedPetugas.bio}</p>
                  </div>
                )}

                {!selectedPetugas.bio && (
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Belum menulis bio</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---- StatCard sub-component ----
function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/60 border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// ---- ModalStatusBadge sub-component ----
function ModalStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.on_duty;
  const SIcon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl ${cfg.bg} border ${cfg.border}`}>
      <SIcon className={`w-3.5 h-3.5 ${cfg.text}`} />
      <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
    </span>
  );
}
