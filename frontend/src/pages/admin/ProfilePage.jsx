import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../services/authService";
import { getMyProfile, updateMyProfile } from "../../services/profileService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  User,
  FileText,
  Shield,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Coffee,
  Save,
  X,
  Upload,
  Trash2,
  LogOut,
  Activity,
  Briefcase,
  AlertTriangle,
} from "lucide-react";

// ---- Status options ----
const STATUS_OPTIONS = [
  {
    value: "on_duty",
    label: "Sedang Bertugas",
    icon: Briefcase,
    gradient: "from-emerald-500 to-emerald-600",
    shadow: "shadow-emerald-500/25",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    ring: "ring-emerald-500/20",
    radio: "border-emerald-500 bg-emerald-500",
    pingBg: "bg-emerald-50",
  },
  {
    value: "off_duty",
    label: "Off Duty",
    icon: XCircle,
    gradient: "from-gray-400 to-gray-500",
    shadow: "shadow-gray-400/25",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    ring: "ring-gray-400/20",
    radio: "border-gray-500 bg-gray-500",
    pingBg: "bg-gray-50",
  },
  {
    value: "resting",
    label: "Istirahat",
    icon: Coffee,
    gradient: "from-amber-400 to-amber-500",
    shadow: "shadow-amber-400/25",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    ring: "ring-amber-400/20",
    radio: "border-amber-500 bg-amber-500",
    pingBg: "bg-amber-50",
  },
];

// ---- Animation variants ----
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const photoVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

const statusBadgeVariants = {
  initial: { scale: 0.7, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 15 },
  },
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const fileInputRef = useRef(null);

  // ---- State ----
  const [profile, setProfile] = useState({
    bio: "",
    status: "on_duty",
    photo_url: null,
  });
  const [bioDraft, setBioDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("on_duty");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ---- Load profile from backend ----
  useEffect(() => {
    if (!user?.id) {
      navigate("/admin/login");
      return;
    }
    loadProfile();
  }, [user?.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      setProfile(data);
      setBioDraft(data.bio || "");
      setStatusDraft(data.status || "on_duty");
      setPhotoPreview(data.photo_url ? `${API_BASE.replace("/api", "")}${data.photo_url}` : null);
    } catch (err) {
      console.error("Gagal memuat profil:", err);
    } finally {
      setLoading(false);
    }
  };

  // ---- Detect changes ----
  useEffect(() => {
    const changed =
      bioDraft !== (profile.bio || "") ||
      statusDraft !== (profile.status || "on_duty") ||
      photoFile !== null;
    setHasChanges(changed);
  }, [bioDraft, statusDraft, photoFile, profile]);

  // ---- Handlers ----
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran foto maksimal 2MB");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      setShowPhotoModal(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setShowPhotoModal(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("bio", bioDraft);
      formData.append("status", statusDraft);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const result = await updateMyProfile(formData);
      setProfile(result.user);
      setPhotoFile(null);
      setHasChanges(false);
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2500);
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menyimpan profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setBioDraft(profile.bio || "");
    setStatusDraft(profile.status || "on_duty");
    setPhotoPreview(profile.photo_url ? `${API_BASE.replace("/api", "")}${profile.photo_url}` : null);
    setPhotoFile(null);
    setHasChanges(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // ---- Derived ----
  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/80 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center animate-pulse">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* ---- Toast ---- */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center gap-2.5 text-sm font-semibold"
          >
            <CheckCircle2 className="w-5 h-5" />
            Profil berhasil disimpan
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Photo Modal ---- */}
      <AnimatePresence>
        {showPhotoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowPhotoModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm z-10"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-900">Ubah Foto Profil</h3>
                <button
                  onClick={() => setShowPhotoModal(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-brand-50 to-orange-50 hover:from-brand-100 hover:to-orange-100 border border-brand-100 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 transition-shadow">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">Unggah Foto</p>
                    <p className="text-xs text-gray-500">JPG, PNG, maks 2MB</p>
                  </div>
                </button>

                {photoPreview && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-100 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/20">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-red-700">Hapus Foto</p>
                      <p className="text-xs text-red-400">Kembalikan ke avatar awal</p>
                    </div>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Main content ---- */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6"
      >
        {/* ---- Header ---- */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-lg shadow-brand-500/30">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight">
                Edit Profil
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Kelola informasi profil Anda</p>
            </div>
          </div>

          {/* Unsaved indicator */}
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Ada perubahan belum disimpan
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ---- Profile Card ---- */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden"
        >
          {/* Cover gradient */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-brand-500 via-orange-400 to-amber-400 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTR2Mkg4VjI0aDI4ek0xMiAxNnYySDR2LTJoOHptMjggMjh2MkgzNHYtMmg2em0wLTR2Mkg4VjI0aDI4ek0xMiA4djJINHYtMmg4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          </div>

          {/* Avatar + info */}
          <div className="px-6 sm:px-8 pb-8 relative">
            {/* Avatar */}
            <div className="relative -mt-16 sm:-mt-20 mb-5 flex items-end justify-between">
              <motion.div
                variants={photoVariants}
                initial="initial"
                animate="animate"
                className="relative group"
              >
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl shadow-gray-300/40 bg-white">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Foto profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white/90">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
                {/* Edit photo button */}
                <button
                  onClick={() => setShowPhotoModal(true)}
                  className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 hover:shadow-xl hover:shadow-brand-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Status badge on right (desktop) */}
              <div className="hidden sm:block pb-2">
                <StatusBadge status={statusDraft} />
              </div>
            </div>

            {/* Name + meta */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </span>
                <span className="flex items-center gap-1.5 capitalize">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role}
                </span>
                {user?.wilayah && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {user.wilayah}
                  </span>
                )}
              </div>
            </div>

            {/* Status badge on mobile */}
            <div className="sm:hidden mb-6">
              <StatusBadge status={statusDraft} />
            </div>
          </div>
        </motion.div>

        {/* ---- Edit sections ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ---- Status Section ---- */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Status Aktivitas</h3>
                <p className="text-xs text-gray-500">Tentukan status Anda saat ini</p>
              </div>
            </div>

            <div className="space-y-3">
              {STATUS_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = statusDraft === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStatusDraft(opt.value)}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      isActive
                        ? `${opt.bg} ${opt.border} ring-2 ${opt.ring}`
                        : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? `bg-gradient-to-br ${opt.gradient} text-white shadow-md ${opt.shadow}`
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-gray-900" : "text-gray-600"
                        }`}
                      >
                        {opt.label}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? opt.radio
                          : "border-gray-300"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-white"
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Status diperbarui otomatis saat disimpan
              </p>
            </div>
          </motion.div>

          {/* ---- Bio Section ---- */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Tentang Saya</h3>
                <p className="text-xs text-gray-500">Ceritakan diri Anda sehari-hari</p>
              </div>
            </div>

            <div className="relative">
              <textarea
                value={bioDraft}
                onChange={(e) => setBioDraft(e.target.value)}
                rows={6}
                maxLength={250}
                placeholder="Tuliskan bio Anda di sini. Contoh: Petugas lapangan BPBD Kota Semarang, bertugas di bidang penanggulangan bencana."
                className="w-full border border-gray-200 rounded-2xl px-5 py-4 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all duration-200 resize-none bg-gray-50/50 hover:bg-gray-50"
              />
              <div className="absolute bottom-3 right-4 text-xs text-gray-400">
                <span
                  className={`font-medium ${
                    bioDraft.length > 220 ? "text-amber-500" : ""
                  } ${bioDraft.length >= 250 ? "text-red-500" : ""}`}
                >
                  {bioDraft.length}
                </span>
                /250
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Bio akan ditampilkan di profil Anda
              </p>
            </div>
          </motion.div>
        </div>

        {/* ---- Action buttons ---- */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4"
        >
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className={`flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                hasChanges && !isSaving
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Simpan Perubahan
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {hasChanges && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDiscard}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Batal
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

// ---- StatusBadge sub-component ----
function StatusBadge({ status }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
  const Icon = opt.icon;
  return (
    <motion.div
      key={status}
      variants={statusBadgeVariants}
      initial="initial"
      animate="animate"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl ${opt.bg} border ${opt.border} shadow-sm`}
    >
      <div
        className={`w-7 h-7 rounded-lg bg-gradient-to-br ${opt.gradient} text-white flex items-center justify-center shadow-sm ${opt.shadow}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className={`text-sm font-bold ${opt.text}`}>{opt.label}</span>
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${opt.pingBg} opacity-75`}
        />
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br ${opt.gradient}`}
        />
      </span>
    </motion.div>
  );
}
