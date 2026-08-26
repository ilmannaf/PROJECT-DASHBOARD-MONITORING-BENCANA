import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackReport } from '../../services/reportService';

const STATUS_STEPS = ['baru', 'diverifikasi', 'ditindaklanjuti', 'selesai'];
const STATUS_LABELS = {
  baru: 'Laporan Diterima',
  diverifikasi: 'Diverifikasi',
  ditindaklanjuti: 'Ditindaklanjuti',
  selesai: 'Selesai',
};

export default function TrackStatus() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('trackHistory') || '[]');
    setSearchHistory(history);
    
    // Auto-search jika ada code di URL
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
      performSearch(codeFromUrl);
    }
  }, []);

  const performSearch = async (searchCode) => {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const data = await trackReport(searchCode.trim());
      setResult(data);
      setShowResult(false);
      setShowSteps(false);
      requestAnimationFrame(() => {
        setShowResult(true);
        setTimeout(() => setShowSteps(true), 200);
      });
      
      const history = JSON.parse(localStorage.getItem('trackHistory') || '[]');
      const newHistory = [searchCode.trim(), ...history.filter(c => c !== searchCode.trim())].slice(0, 5);
      localStorage.setItem('trackHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (err) {
      setError(err.response?.data?.message || 'Laporan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await performSearch(code);
  };

  const handleHistoryClick = (historyCode) => {
    setCode(historyCode);
    performSearch(historyCode);
  };

  const currentStepIndex = result ? STATUS_STEPS.indexOf(result.report.status) : -1;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-extrabold text-gray-900">Lacak Laporan Bencana</h1>
          <p className="text-sm text-gray-500">Masukkan kode tracking untuk melihat status laporan Anda</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 mb-6 flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BPBD-2026-XXXX"
            required
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Mencari...' : 'Cari'}
          </button>
        </form>

        {searchHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Riwayat Pencarian</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(c)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full transition"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm text-center bg-red-50 border border-red-100 rounded-lg py-3 mb-6">
            {error}
          </p>
        )}

        {result && (
          <div className={`${showResult ? 'result-bounce' : 'opacity-0'} bg-white shadow-sm border border-gray-100 rounded-xl p-5`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-gray-500">Kode Laporan</p>
                <p className="font-mono font-bold text-gray-900">{result.report.tracking_code}</p>
              </div>
              <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">
                {STATUS_LABELS[result.report.status]}
              </span>
            </div>

            <div className="text-sm text-gray-600 mb-5 space-y-1">
              <p><span className="text-gray-400">Jenis:</span> {result.report.disaster_type}</p>
              <p><span className="text-gray-400">Lokasi:</span> {result.report.address}</p>
              <p><span className="text-gray-400">Dilaporkan:</span> {new Date(result.report.created_at).toLocaleString('id-ID')}</p>
              {(result.report.photos?.length > 0 || result.report.photo_url) && <p className="text-gray-400">Foto: {(result.report.photos || [result.report.photo_url]).filter(Boolean).length}/5</p>}
            </div>
            {(result.report.photos?.length > 0 || result.report.photo_url) && (
              <div className="grid grid-cols-3 gap-2 mb-5">
                {(result.report.photos || [result.report.photo_url]).filter(Boolean).slice(0,5).map((url, idx) => (
                  <img key={idx} src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api','')}${url}`} alt={`foto ${idx}`} className="w-full h-24 object-cover rounded-lg border" />
                ))}
              </div>
            )}

            {result.report.latitude && result.report.longitude && (
              <div className="mb-5">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-sm rounded-lg py-2 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {showMap ? 'Tutup Peta' : 'Lihat Lokasi di Peta'}
                </button>
                {showMap && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      title="Peta Lokasi Bencana"
                      width="100%"
                      height="300"
                      frameBorder="0"
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${result.report.latitude},${result.report.longitude}&z=15&output=embed`}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center mb-5">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex-1 flex items-center">
                  <div
                    className={`tracking-step w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      i <= currentStepIndex ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-400'
                    } ${showSteps ? 'show' : ''}`}
                    style={{ transitionDelay: `${i * 0.12}s` }}
                  >
                    {i + 1}
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`tracking-line flex-1 h-0.5 ${i < currentStepIndex ? 'bg-brand-600' : 'bg-gray-200'} ${showSteps ? 'show' : ''}`}
                      style={{ transitionDelay: `${i * 0.12 + 0.1}s` }} />
                  )}
                </div>
              ))}
            </div>

            {result.history.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Riwayat Penanganan</p>
                <div className="space-y-2">
                  {result.history.map((log) => (
                    <div key={log.id} className="text-xs text-gray-600 border-l-2 border-brand-200 pl-3 py-1">
                      <p className="font-medium text-gray-800">{STATUS_LABELS[log.status_to] || log.status_to}</p>
                      {log.note && <p className="text-gray-500">{log.note}</p>}
                      <p className="text-gray-400">{new Date(log.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}