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
  const [showContent, setShowContent] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const [showHistoryItems, setShowHistoryItems] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 80);
    const history = JSON.parse(localStorage.getItem('trackHistory') || '[]');
    setSearchHistory(history);

    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setCode(codeFromUrl);
      performSearch(codeFromUrl);
    }
    return () => clearTimeout(t);
  }, []);

  const performSearch = async (searchCode) => {
    setError('');
    setResult(null);
    setShowResult(false);
    setShowSteps(false);
    setShowHistoryItems(false);
    setLoading(true);
    try {
      const data = await trackReport(searchCode.trim());
      setResult(data);
      requestAnimationFrame(() => {
        setShowResult(true);
        setTimeout(() => setShowSteps(true), 250);
        setTimeout(() => setShowHistoryItems(true), 450);
      });

      const history = JSON.parse(localStorage.getItem('trackHistory') || '[]');
      const newHistory = [searchCode.trim(), ...history.filter(c => c !== searchCode.trim())].slice(0, 5);
      localStorage.setItem('trackHistory', JSON.stringify(newHistory));
      setSearchHistory(newHistory);
    } catch (err) {
      setError(err.response?.data?.message || 'Laporan tidak ditemukan');
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
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
      <div className="max-w-md mx-auto">
        <div className={`text-center mb-5 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
          <h1 className="text-lg font-extrabold text-gray-900">Lacak Laporan Bencana</h1>
          <p className="text-xs text-gray-500 mt-0.5">Masukkan kode tracking untuk melihat status</p>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSearch}
          className={`bg-white shadow-sm border border-gray-200 rounded-lg p-3 mb-5 flex gap-2 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${shakeForm ? 'shake-form' : ''}`}
          style={{ transitionDelay: '0.08s' }}
        >
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="BPBD-2026-XXXX"
            required
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-3 py-2 text-sm font-semibold transition flex items-center gap-1.5 disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Mencari...</span>
              </>
            ) : 'Cari'}
          </button>
        </form>

        {searchHistory.length > 0 && (
          <div className={`mb-4 transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`} style={{ transitionDelay: '0.16s' }}>
            <p className="text-[11px] text-gray-400 mb-1.5">Riwayat</p>
            <div className="flex flex-wrap gap-1.5">
              {searchHistory.map((c, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(c)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] px-2.5 py-1 rounded-md transition hover:scale-105 active:scale-95"
                  style={{ transitionDelay: `${0.16 + i * 0.04}s` }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 mb-5 animate-fade-in">
            {error}
          </div>
        )}

        {result && (
          <div className={`${showResult ? 'result-slide-up show' : 'result-slide-up'} bg-white shadow-sm border border-gray-200 rounded-xl p-4`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Kode</p>
                <p className="font-mono font-bold text-gray-900 text-sm">{result.report.tracking_code}</p>
              </div>
              <span className="bg-brand-50 text-brand-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {STATUS_LABELS[result.report.status]}
              </span>
            </div>

            <div className="text-xs text-gray-600 mb-4 space-y-0.5">
              <p><span className="text-gray-400">Jenis:</span> {result.report.disaster_type}</p>
              <p><span className="text-gray-400">Lokasi:</span> {result.report.address}</p>
              <p><span className="text-gray-400">Dilaporkan:</span> {new Date(result.report.created_at).toLocaleString('id-ID')}</p>
            </div>

            {(result.report.photos?.length > 0 || result.report.photo_url) && (
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {(result.report.photos || [result.report.photo_url]).filter(Boolean).slice(0,3).map((url, idx) => (
                  <img
                    key={idx}
                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api','')}${url}`}
                    alt={`foto ${idx}`}
                    className={`w-full h-20 object-cover rounded-lg border photo-enter ${showResult ? 'show' : ''}`}
                    style={{ transitionDelay: `${0.1 + idx * 0.08}s` }}
                  />
                ))}
              </div>
            )}

            {result.report.latitude && result.report.longitude && (
              <div className="mb-4">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-medium text-xs rounded-lg py-1.5 transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {showMap ? 'Tutup Peta' : 'Lihat di Peta'}
                </button>
                {showMap && (
                  <div className="mt-2 rounded-lg overflow-hidden border animate-fade-in">
                    <iframe
                      title="Peta Lokasi Bencana"
                      width="100%"
                      height="200"
                      frameBorder="0"
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${result.report.latitude},${result.report.longitude}&z=15&output=embed`}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-start justify-between gap-1.5">
                {STATUS_STEPS.map((step, i) => {
                  const isActive = i <= currentStepIndex;
                  const isLineActive = i <= currentStepIndex;

                  return (
                    <div key={step} className="flex-1 flex flex-col items-center text-center">
                      <div className="flex w-full items-center justify-center">
                        {i > 0 && (
                          <div
                            className={`h-0.5 flex-1 rounded-full ${isLineActive ? 'bg-brand-600' : 'bg-gray-200'}`}
                            style={{ transitionDelay: `${i * 0.12 + 0.1}s` }}
                          />
                        )}

                        <div
                          className={`tracking-step relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all duration-300 ${
                            isActive
                              ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-100'
                              : 'border-gray-200 bg-gray-100 text-gray-400'
                          } ${showSteps ? 'show' : ''}`}
                          style={{ transitionDelay: `${i * 0.12}s` }}
                        >
                          {i + 1}
                        </div>

                        {i < STATUS_STEPS.length - 1 && (
                          <div
                            className={`h-0.5 flex-1 rounded-full ${i < currentStepIndex ? 'bg-brand-600' : 'bg-gray-200'}`}
                            style={{ transitionDelay: `${i * 0.12 + 0.1}s` }}
                          />
                        )}
                      </div>

                      <p
                        className={`mt-2 text-[7.5px] leading-tight font-medium ${isActive ? 'text-brand-700' : 'text-gray-400'}`}
                      >
                        {STATUS_LABELS[step]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {result.history.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Riwayat Penanganan</p>
                <div className="space-y-1.5">
                  {result.history.map((log, idx) => (
                    <div
                      key={log.id}
                      className={`history-item text-[11px] text-gray-600 border-l-2 border-brand-200 pl-2.5 py-0.5 ${showHistoryItems ? 'show' : ''}`}
                      style={{ transitionDelay: `${idx * 0.1}s` }}
                    >
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
