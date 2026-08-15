# 🚨 Sistem Monitoring Kebencanaan BPBD Kota Semarang

Aplikasi web untuk pelaporan dan monitoring bencana yang menghubungkan masyarakat dengan BPBD Kota Semarang secara real-time.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-19.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📖 Deskripsi

Sistem Monitoring Kebencanaan BPBD adalah platform terpadu untuk:
- 🚨 Pelaporan bencana oleh masyarakat dengan foto dan lokasi GPS
- 📊 Dashboard monitoring untuk admin dan petugas BPBD
- 🗺️ Tracking status laporan dengan peta interaktif
- 📦 Manajemen inventaris, kendaraan, posko, dan kegiatan

---

## ✨ Fitur Utama

### 🌐 Untuk Masyarakat (Public)
- **Landing Page Modern** - Hero section dengan informasi layanan
- **Lapor Bencana** - Form pelaporan dengan GPS dan upload foto
- **Lacak Status** - Tracking laporan real-time dengan kode unik + Google Maps
- **Dashboard Pelapor** - Login untuk melihat riwayat laporan pribadi

### 🔐 Untuk Admin/Petugas BPBD
- **Dashboard Admin** - Statistik lengkap dengan charts (Pie & Bar)
- **Kelola Laporan** - Update status, filter, dan assignment petugas
- **Pendataan Bencana** - Record data bencana per wilayah dengan jumlah korban
- **Inventaris** - Manajemen logistik dan peralatan darurat
- **Kendaraan** - Fleet management dengan tracking status service
- **Posko** - Kelola titik posko pengungsian dengan kapasitas
- **Kegiatan** - Laporan kegiatan lapangan dengan dokumentasi foto

### 🎨 UI/UX Features
- ✅ Modern design dengan gradients dan animations
- ✅ Responsive untuk mobile, tablet, dan desktop
- ✅ Toggle show/hide password di semua form
- ✅ Split-screen login admin dengan gambar sidebar
- ✅ Inter font untuk readability optimal
- ✅ Sticky headers dan smooth scrolling

---

## 🛠️ Tech Stack

### Backend
- **Node.js + Express 5** - REST API server
- **MySQL** - Relational database
- **JWT + Bcrypt** - Authentication & security
- **Socket.IO** - Real-time notifications
- **Multer** - File upload handling

### Frontend
- **React 19.2 + Vite 8.2** - Modern UI framework
- **Tailwind CSS v4** - Utility-first styling
- **React Router DOM 7** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Google Maps API** - Location tracking

---

## 📁 Struktur Project

```
PROJECT-DASHBOARD-MONITORING-BENCANA/
├── BPBD-dashboard/
│   ├── backend/              # Node.js REST API
│   │   ├── src/
│   │   │   ├── controllers/  # Business logic
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── middleware/   # Auth & validation
│   │   │   └── app.js        # Express app
│   │   ├── database/
│   │   │   ├── schema.sql    # DB structure
│   │   │   └── seed.sql      # Sample data
│   │   ├── uploads/          # Uploaded files
│   │   └── package.json
│   │
│   ├── frontend/             # React dashboard
│   │   ├── src/
│   │   │   ├── pages/        # Page components
│   │   │   │   ├── admin/    # Admin pages
│   │   │   │   └── public/   # Public pages
│   │   │   ├── layouts/      # Layout components
│   │   │   ├── services/     # API services
│   │   │   ├── components/   # Reusable components
│   │   │   ├── App.jsx       # Main app
│   │   │   └── main.jsx      # Entry point
│   │   └── package.json
│   │
│   ├── mobile/               # React Native (planned)
│   ├── README.md             # Detailed docs
│   └── SETUP.md              # Setup guide
│
├── .gitignore
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MySQL >= 8.0
- npm atau yarn

### 1️⃣ Clone Repository
```bash
git clone https://github.com/ilmannaf/PROJECT-DASHBOARD-MONITORING-BENCANA.git
cd PROJECT-DASHBOARD-MONITORING-BENCANA
```

### 2️⃣ Setup Database
```bash
mysql -u root -p
CREATE DATABASE sistem_kebencanaan;
USE sistem_kebencanaan;
SOURCE BPBD-dashboard/backend/database/schema.sql;
SOURCE BPBD-dashboard/backend/database/seed.sql;
SOURCE BPBD-dashboard/backend/database/add_disaster_records.sql;
```

### 3️⃣ Setup Backend
```bash
cd BPBD-dashboard/backend
npm install

# Buat file .env
cat > .env << EOF
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sistem_kebencanaan
JWT_SECRET=your_jwt_secret_key_here
EOF

npm run dev
```
Backend running di: `http://localhost:5000`

### 4️⃣ Setup Frontend
```bash
cd BPBD-dashboard/frontend
npm install

# Buat file .env
echo "VITE_API_URL=http://localhost:5000/api" > .env

npm run dev
```
Frontend running di: `http://localhost:5173`

### 5️⃣ Akses Aplikasi
- **Landing Page**: http://localhost:5173/
- **Login Admin**: http://localhost:5173/admin/login
- **Login Pelapor**: http://localhost:5173/dashboard
- **Lapor Bencana**: http://localhost:5173/lapor
- **Lacak Status**: http://localhost:5173/lacak

---

## 🔑 Default Login

### Admin & Petugas
| Email | Password | Role |
|-------|----------|------|
| admin@bpbdsemarang.go.id | admin123 | admin |
| petugas1@bpbdsemarang.go.id | admin123 | petugas |
| petugas2@bpbdsemarang.go.id | admin123 | petugas |

### Public User
Register di: http://localhost:5173/dashboard (tab Registrasi)

---

## 📊 Database Schema

**8 Tables:**
1. **users** - Admin & petugas BPBD (JWT auth)
2. **reports** - Laporan bencana dari masyarakat
3. **report_logs** - History perubahan status laporan
4. **disaster_records** - Pendataan bencana per wilayah
5. **posko** - Lokasi posko pengungsian
6. **inventory_items** - Logistik & peralatan darurat
7. **vehicles** - Kendaraan operasional BPBD
8. **activities** - Laporan kegiatan lapangan

---

## 🗺️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register public user
- `POST /api/auth/login` - Login (admin/petugas/public)

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report detail
- `POST /api/reports` - Submit new report
- `PUT /api/reports/:id` - Update report status
- `GET /api/reports/track/:code` - Track by code

### Disaster Records
- `GET /api/disaster-records` - Get all records
- `POST /api/disaster-records` - Create record
- `PUT /api/disaster-records/:id` - Update record
- `DELETE /api/disaster-records/:id` - Delete record

### Inventory
- `GET /api/inventory` - Get all items
- `POST /api/inventory` - Add item
- `PUT /api/inventory/:id` - Update item
- `DELETE /api/inventory/:id` - Delete item

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Posko
- `GET /api/posko` - Get all posko
- `POST /api/posko` - Add posko
- `PUT /api/posko/:id` - Update posko
- `DELETE /api/posko/:id` - Delete posko

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Add activity
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

**Full API documentation**: [backend/README.md](BPBD-dashboard/backend/README.md)

---

## 📸 Screenshots

### Landing Page
Hero section modern dengan CTA buttons untuk lapor dan lacak bencana

### Admin Dashboard
Dashboard dengan statistik cards, pie chart distribusi status, dan bar chart jenis bencana

### Lapor Bencana
Form pelaporan dengan GPS auto-detect dan upload foto kejadian

### Lacak Status
Tracking laporan dengan timeline status dan Google Maps marker lokasi kejadian

### Kelola Laporan
Table management dengan filter status dan modal detail laporan lengkap

---

## 🎯 Roadmap

- [x] Landing page dengan hero section
- [x] Admin dashboard dengan charts
- [x] Laporan bencana publik
- [x] Tracking status dengan Google Maps
- [x] Role-based authorization (admin/petugas/public)
- [x] Upload foto dan GPS location
- [x] Pendataan bencana per wilayah
- [x] Modern UI dengan Inter font
- [ ] Socket.IO live updates di frontend
- [ ] Email/SMS notifications
- [ ] Export reports to PDF/Excel
- [ ] Mobile app (React Native)
- [ ] PWA support

---

## 📞 Emergency Contact

**BPBD Kota Semarang**
- Call Center: **112**
- WhatsApp: 0812-3456-7890
- Website: https://bpbd.semarangkota.go.id

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ilman Nafian**
- GitHub: [@ilmannaf](https://github.com/ilmannaf)
- Project: [PROJECT-DASHBOARD-MONITORING-BENCANA](https://github.com/ilmannaf/PROJECT-DASHBOARD-MONITORING-BENCANA)

---

## 🙏 Acknowledgments

- BPBD Kota Semarang
- React & Vite teams
- Tailwind CSS team
- All contributors and testers

---

**Developed with ❤️ for Disaster Management System**

*Last updated: August 2026*
