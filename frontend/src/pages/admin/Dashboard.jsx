import { useState, useEffect } from 'react';
import api from '../../services/api';
import { getReportStats } from '../../services/reportService';
import { getSocket } from '../../services/socket';
import { showToast } from '../../components/Toast';
import AnimatedNumber from '../../components/AnimatedNumber';
import { SkeletonStatCards, SkeletonPulse } from '../../components/Skeleton';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const STATUS_LABELS = {
  baru: 'Baru',
  diverifikasi: 'Diverifikasi',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
};

const STATUS_COLORS = {
  baru: '#dc3545',
  diverifikasi: '#ffc107',
  ditindaklanjuti: '#0d6efd',
  selesai: '#198754',
};

const STATUS_BG = {
  baru: 'bg-red-500',
  diverifikasi: 'bg-yellow-500',
  ditindaklanjuti: 'bg-blue-500',
  selesai: 'bg-green-500',
};

const STATUS_TEXT_BG = {
  baru: 'text-bg-danger',
  diverifikasi: 'text-bg-warning',
  ditindaklanjuti: 'text-bg-primary',
  selesai: 'text-bg-success',
};

export default function Dashboard() {
  const [total, setTotal] = useState(0);
  const [byStatus, setByStatus] = useState({});
  const [byType, setByType] = useState([]);
  const [recent, setRecent] = useState([]);
  const [disasterRecords, setDisasterRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const load = () => {
      Promise.all([
        getReportStats().catch(() => ({ total: 0, byStatus: {}, byType: [], recent: [] })),
        api.get('/disaster-records').catch(() => ({ data: [] })),
      ])
        .then(([stats, res2]) => {
          setTotal(stats.total);
          setByStatus(stats.byStatus);
          setByType(stats.byType);
          setRecent(stats.recent);
          setDisasterRecords(res2.data);
        })
        .catch((err) => console.error('Gagal ambil data:', err))
        .finally(() => {
          setLoading(false);
          setTimeout(() => setShowContent(true), 80);
        });
    };
    load();

    const socket = getSocket();
    const onNewReport = (data) => {
      showToast(`Laporan baru: ${data.disaster_type} di ${data.address || '-'}`, 'info');
      load();
    };
    const onStatusUpdate = (data) => {
      showToast(`Laporan ${data.tracking_code} → ${data.status}`, 'info');
      load();
    };
    socket.on('new_report', onNewReport);
    socket.on('report_status_updated', onStatusUpdate);
    return () => {
      socket.off('new_report', onNewReport);
      socket.off('report_status_updated', onStatusUpdate);
    };
  }, []);

  const countByStatus = (s) => byStatus[s] || 0;

  // AdminLTE v3 small-box stat cards
  const statCards = [
    {
      label: 'Total Laporan',
      value: total,
      icon: FileText,
      bgClass: 'bg-primary',
      footerLink: '#',
      footerText: 'More info',
    },
    {
      label: 'Laporan Baru',
      value: countByStatus('baru'),
      icon: AlertTriangle,
      bgClass: 'bg-danger',
      footerLink: '#',
      footerText: 'More info',
    },
    {
      label: 'Ditindaklanjuti',
      value: countByStatus('ditindaklanjuti'),
      icon: Clock,
      bgClass: 'bg-warning',
      footerLink: '#',
      footerText: 'More info',
    },
    {
      label: 'Selesai',
      value: countByStatus('selesai'),
      icon: CheckCircle,
      bgClass: 'bg-success',
      footerLink: '#',
      footerText: 'More info',
    },
  ];

  const pieData = Object.keys(STATUS_LABELS)
    .map((status) => ({
      name: STATUS_LABELS[status],
      value: countByStatus(status),
      color: STATUS_COLORS[status],
    }))
    .filter((d) => d.value > 0);

  const kecamatanCount = new Set(disasterRecords.map((d) => d.kecamatan)).size;
  const totalKorban = disasterRecords.reduce((sum, r) => {
    return sum + (Number(r.korban_ps) || 0) + (Number(r.korban_md) || 0) + (Number(r.korban_lb) || 0) + (Number(r.korban_lr) || 0);
  }, 0);

  if (loading) {
    return (
      <div className="animate-fade-in">
        <SkeletonStatCards />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="adminlte-card">
            <div className="adminlte-card-header">
              <SkeletonPulse className="h-4 w-40" />
            </div>
            <div className="adminlte-card-body">
              <SkeletonPulse className="h-64 w-full rounded" />
            </div>
          </div>
          <div className="adminlte-card">
            <div className="adminlte-card-header">
              <SkeletonPulse className="h-4 w-40" />
            </div>
            <div className="adminlte-card-body">
              <SkeletonPulse className="h-64 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Small Box Stat Cards - AdminLTE v3 style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`adminlte-small-box ${card.bgClass} ${showContent ? 'stat-card show' : 'stat-card'}`}
              style={{ transitionDelay: `${i * 0.06}s` }}
            >
              <div className="inner text-white">
                <h3 className="text-3xl font-bold">
                  <AnimatedNumber value={card.value} />
                </h3>
                <p className="font-medium">{card.label}</p>
              </div>
              <div className="icon text-white/30">
                <Icon className="w-20 h-20" strokeWidth={1} />
              </div>
              <a
                href={card.footerLink}
                className="small-box-footer text-white/80 hover:text-white hover:bg-black/10 transition-all"
              >
                {card.footerText} <i className="ml-1">→</i>
              </a>
            </div>
          );
        })}
      </div>

      {/* Info Boxes - Kecamatan, Korban, Pendataan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className={`adminlte-card ${showContent ? 'stat-card show' : 'stat-card'}`} style={{ transitionDelay: '0.3s' }}>
          <div className="adminlte-card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pendataan</p>
              <p className="text-2xl font-bold text-gray-800">
                <AnimatedNumber value={disasterRecords.length} />
              </p>
            </div>
          </div>
        </div>
        <div className={`adminlte-card ${showContent ? 'stat-card show' : 'stat-card'}`} style={{ transitionDelay: '0.36s' }}>
          <div className="adminlte-card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Kecamatan Terdampak</p>
              <p className="text-2xl font-bold text-gray-800">
                <AnimatedNumber value={kecamatanCount} />
              </p>
            </div>
          </div>
        </div>
        <div className={`adminlte-card ${showContent ? 'stat-card show' : 'stat-card'}`} style={{ transitionDelay: '0.42s' }}>
          <div className="adminlte-card-body flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Korban</p>
              <p className="text-2xl font-bold text-gray-800">
                <AnimatedNumber value={totalKorban} />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row - AdminLTE v3 card style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Pie Chart - Distribusi Status */}
        <div className={`adminlte-card ${showContent ? 'chart-enter show' : 'chart-enter'}`}>
          <div className="adminlte-card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Distribusi Status
            </h3>
          </div>
          <div className="adminlte-card-body">
            {pieData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.375rem',
                      border: '1px solid #dee2e6',
                      fontSize: 12,
                      boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={30}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart - Laporan per Jenis */}
        <div className={`adminlte-card lg:col-span-2 ${showContent ? 'chart-enter show' : 'chart-enter'}`} style={{ transitionDelay: '0.08s' }}>
          <div className="adminlte-card-header">
            <h3 className="card-title flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Laporan per Jenis Bencana
            </h3>
          </div>
          <div className="adminlte-card-body">
            {byType.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">Belum ada data</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={byType}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '0.375rem',
                      border: '1px solid #dee2e6',
                      fontSize: 12,
                      boxShadow: '0 2px 4px rgba(0,0,0,.1)',
                    }}
                  />
                  <Bar dataKey="jumlah" fill="#e65100" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports Table - AdminLTE v3 card style */}
      <div className={`adminlte-card ${showContent ? 'chart-enter show' : 'chart-enter'}`} style={{ transitionDelay: '0.16s' }}>
        <div className="adminlte-card-header">
          <h3 className="card-title flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Laporan Terbaru
          </h3>
          <span className="text-xs text-gray-500">{total} laporan</span>
        </div>
        <div className="adminlte-card-body p-0">
          <div className="overflow-x-auto">
            <table className="adminlte-table">
              <thead>
                <tr>
                  <th className="pl-6">Kode</th>
                  <th>Pelapor</th>
                  <th>Jenis</th>
                  <th>Lokasi</th>
                  <th className="text-center pr-6">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="pl-6">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {r.tracking_code}
                      </span>
                    </td>
                    <td className="font-medium text-gray-800">{r.reporter_name}</td>
                    <td>
                      <span className="inline-flex items-center gap-1.5 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                        {r.disaster_type}
                      </span>
                    </td>
                    <td className="text-gray-500 truncate max-w-[200px]">{r.address}</td>
                    <td className="text-center pr-6">
                      <span className={`adminlte-badge ${STATUS_TEXT_BG[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent.length === 0 && (
              <p className="text-sm text-gray-500 py-10 text-center">Belum ada laporan.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
