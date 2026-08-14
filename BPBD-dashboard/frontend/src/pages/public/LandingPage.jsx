import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-sm">
              BPBD
            </div>
            <div>
              <h1 className="font-bold text-gray-900">BPBD Kota Semarang</h1>
              <p className="text-xs text-gray-500">Sistem Monitoring Kebencanaan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/lacak')}
              className="text-sm font-semibold text-gray-700 hover:text-brand-600 transition"
            >
              Lacak Laporan
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm font-semibold bg-brand-50 hover:bg-brand-100 text-brand-600 border border-brand-200 px-4 py-2 rounded-lg transition"
            >
              Login Public
            </button>
            <button
              onClick={() => navigate('/admin/login')}
              className="text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              Login Admin
            </button>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-brand-50 via-orange-50 to-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-semibold">
                ⚡ Tanggap Darurat 24/7
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Sistem Pelaporan dan Monitoring{' '}
                <span className="text-brand-600">Bencana</span> Terpadu
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Laporkan kejadian bencana secara cepat dan akurat. Pantau status penanganan real-time 
                melalui dashboard monitoring terpadu BPBD Kota Semarang.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/lapor')}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  🚨 Laporkan Bencana
                </button>
                <button
                  onClick={() => navigate('/lacak')}
                  className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border-2 border-gray-200 hover:border-brand-300 transition-all"
                >
                  🔍 Lacak Status Laporan
                </button>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">Login untuk akses lebih lanjut:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-200 transition-all text-sm"
                  >
                    👤 Login Public / Pelapor
                  </button>
                  <button
                    onClick={() => navigate('/admin/login')}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg transition-all text-sm"
                  >
                    🔐 Login Admin / Petugas
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">24/7</p>
                  <p className="text-sm text-gray-500">Siaga Darurat</p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">112</p>
                  <p className="text-sm text-gray-500">Call Center</p>
                </div>
                <div className="w-px h-12 bg-gray-300"></div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Real-time</p>
                  <p className="text-sm text-gray-500">Tracking</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                  alt="Dashboard Monitoring"
                  className="rounded-2xl shadow-2xl border-8 border-white"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Laporan Terverifikasi</p>
                      <p className="text-sm text-gray-500">Response time &lt; 15 menit</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Fitur Utama</h2>
            <p className="text-gray-600">Sistem monitoring kebencanaan yang mudah dan cepat</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📱"
              title="Lapor Mudah"
              description="Laporkan kejadian bencana dengan foto, lokasi GPS, dan deskripsi lengkap hanya dalam hitungan detik."
            />
            <FeatureCard
              icon="📊"
              title="Dashboard Real-time"
              description="Pantau status penanganan laporan secara real-time dengan tracking code unik untuk setiap laporan."
            />
            <FeatureCard
              icon="🚨"
              title="Respon Cepat"
              description="Tim BPBD siaga 24/7 untuk merespon setiap laporan dengan prioritas tinggi pada kasus darurat."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1581092583537-20d51b2a3f85?w=800&h=600&fit=crop"
                alt="Emergency Response"
                className="rounded-2xl shadow-xl"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                Tanggap Darurat Terintegrasi
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Sistem monitoring BPBD Kota Semarang mengintegrasikan pelaporan masyarakat dengan 
                manajemen sumber daya darurat seperti logistik, kendaraan, dan posko pengungsian.
              </p>
              <ul className="space-y-3">
                <CheckItem text="Tracking lokasi dengan GPS presisi" />
                <CheckItem text="Upload foto dokumentasi kejadian" />
                <CheckItem text="History penanganan transparan" />
                <CheckItem text="Notifikasi update status real-time" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Ada Kejadian Bencana? Segera Laporkan!
          </h2>
          <p className="text-lg text-brand-100">
            Setiap detik berharga dalam situasi darurat. Tim BPBD siap membantu Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/lapor')}
              className="px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Buat Laporan Sekarang
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl transition-all"
            >
              Lihat Dashboard
            </button>
          </div>
          <p className="text-sm text-brand-200 pt-4">
            Atau hubungi call center darurat: <span className="font-bold text-white">112 / 0812-3456-7890</span>
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm">
            © 2026 BPBD Kota Semarang. Sistem Monitoring Kebencanaan Terpadu.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <li className="flex items-start gap-3">
      <svg className="w-6 h-6 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-gray-700">{text}</span>
    </li>
  );
}
