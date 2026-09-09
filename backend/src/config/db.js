const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const ensureBaseSchema = async () => {
  const conn = await pool.getConnection();
  try {
    const statements = [
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'petugas') NOT NULL DEFAULT 'petugas',
        wilayah VARCHAR(100),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_code VARCHAR(20) NOT NULL UNIQUE,
        reporter_user_id INT,
        reporter_name VARCHAR(100) NOT NULL,
        reporter_phone VARCHAR(20),
        disaster_type VARCHAR(50) NOT NULL,
        description TEXT,
        photo_url VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        address VARCHAR(255),
        status ENUM('baru', 'diverifikasi', 'ditindaklanjuti', 'selesai') DEFAULT 'baru',
        assigned_to INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS report_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        status_from VARCHAR(30),
        status_to VARCHAR(30) NOT NULL,
        note TEXT,
        updated_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS report_photos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        report_id INT NOT NULL,
        photo_url VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS posko (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        address VARCHAR(255)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category ENUM('logistik', 'peralatan', 'p3k') NOT NULL,
        item_condition ENUM('baik', 'rusak', 'perlu_maintenance') DEFAULT 'baik',
        quantity INT NOT NULL DEFAULT 0,
        unit VARCHAR(20),
        posko_id INT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (posko_id) REFERENCES posko(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plate_number VARCHAR(20) NOT NULL UNIQUE,
        type VARCHAR(50),
        status ENUM('siap', 'maintenance', 'rusak') DEFAULT 'siap',
        last_service_date DATE,
        posko_id INT,
        FOREIGN KEY (posko_id) REFERENCES posko(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        activity_date DATE NOT NULL,
        activity_time TIME DEFAULT NULL,
        location VARCHAR(150),
        documentation_url VARCHAR(255),
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS disaster_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        disaster_date DATE NOT NULL,
        disaster_time TIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        kelurahan VARCHAR(100) NOT NULL,
        kecamatan VARCHAR(100) NOT NULL,
        pemilik VARCHAR(150),
        pemilik_phone VARCHAR(20),
        kronologi TEXT NOT NULL,
        korban TEXT,
        korban_ps INT,
        korban_md INT,
        korban_lb INT,
        korban_lr INT,
        terdampak_laki INT,
        terdampak_perempuan INT,
        terdampak_anak INT,
        terdampak_diffable INT,
        terdampak_lansia INT,
        terdampak_kk INT,
        kerugian TEXT,
        sumber_info_nama VARCHAR(100),
        sumber_info_phone VARCHAR(20),
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS login_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        device_info VARCHAR(255),
        success TINYINT(1) DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS smab_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_sekolah VARCHAR(200) NOT NULL,
        kecamatan VARCHAR(100) NOT NULL,
        ancaman_bencana VARCHAR(255),
        tahun_pembentukan YEAR,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS katana_locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kelurahan VARCHAR(150) NOT NULL,
        kecamatan VARCHAR(100) NOT NULL,
        pembentukan VARCHAR(30),
        ancaman_bencana VARCHAR(255),
        sumber_dana VARCHAR(150),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS btt_penerima (
        id INT AUTO_INCREMENT PRIMARY KEY,
        btt_id INT NOT NULL DEFAULT 1,
        nama_penerima VARCHAR(150) NOT NULL,
        no_kk VARCHAR(30),
        nik VARCHAR(30),
        jenis_bencana VARCHAR(150) NOT NULL,
        tanggal_kejadian DATE NOT NULL,
        alamat TEXT NOT NULL,
        kategori_kerusakan TEXT,
        kerusakan TEXT,
        status_pendanaan ENUM('belum_cair', 'cair', 'tidak_cair') NOT NULL DEFAULT 'belum_cair',
        tanggal_pencairan DATE,
        persentase_kerusakan DECIMAL(5,2) DEFAULT 100,
        kelurahan VARCHAR(100),
        kecamatan VARCHAR(100),
        besaran_bantuan DECIMAL(15,2) NOT NULL DEFAULT 0,
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS water_distributions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        distribution_date DATE NOT NULL,
        kelurahan VARCHAR(100) NOT NULL,
        kecamatan VARCHAR(100) NOT NULL,
        location_address VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 6),
        longitude DECIMAL(11, 6),
        amount_liters INT NOT NULL DEFAULT 0,
        total_supply INT NOT NULL DEFAULT 0,
        notes TEXT,
        status ENUM('selesai', 'dalam_proses', 'dibatalkan') DEFAULT 'selesai',
        created_by INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

      `CREATE TABLE IF NOT EXISTS water_supply_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        total_supply INT NOT NULL DEFAULT 0,
        updated_by INT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    ];

    for (const sql of statements) {
      await conn.query(sql);
    }

    // Tambah kolom profil ke tabel users jika belum ada
    const addColumnIfNotExists = async (table, column, definition) => {
      const [cols] = await conn.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
      if (cols.length === 0) {
        await conn.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      }
    };

    await addColumnIfNotExists('users', 'bio', 'TEXT');
    await addColumnIfNotExists('users', 'status', "ENUM('on_duty','off_duty','resting') DEFAULT 'on_duty'");
    await addColumnIfNotExists('users', 'photo_url', 'VARCHAR(255)');
    await addColumnIfNotExists('water_distributions', 'total_supply', 'INT NOT NULL DEFAULT 0');
    await conn.query('ALTER TABLE katana_locations MODIFY COLUMN pembentukan VARCHAR(30)');
    await addColumnIfNotExists('btt_penerima', 'no_kk', 'VARCHAR(30)');
    await addColumnIfNotExists('btt_penerima', 'nik', 'VARCHAR(30)');
    await addColumnIfNotExists('btt_penerima', 'kategori_kerusakan', 'TEXT');
    await addColumnIfNotExists('btt_penerima', 'status_pendanaan', "ENUM('belum_cair','cair','tidak_cair') NOT NULL DEFAULT 'belum_cair'");
    await addColumnIfNotExists('btt_penerima', 'tanggal_pencairan', 'DATE');
    await conn.query("ALTER TABLE btt_penerima MODIFY COLUMN status_pendanaan ENUM('belum_cair','cair','tidak_cair') NOT NULL DEFAULT 'belum_cair'");
  } finally {
    conn.release();
  }
};

const readLegacyData = (fileName, exportName) => {
  const filePath = path.resolve(__dirname, '../../../frontend/src/data', fileName);
  if (!fs.existsSync(filePath)) return [];

  const source = fs.readFileSync(filePath, 'utf8')
    .replace(`export const ${exportName} =`, 'globalThis.locationData =')
    .replace(/pembentukan:\s*(\d{4}&\d{4})/g, 'pembentukan: "$1"');
  const context = {};
  vm.runInNewContext(source, context, { filename: filePath });
  return Array.isArray(context.locationData) ? context.locationData : [];
};

const ensureDefaultLocations = async () => {
  const conn = await pool.getConnection();
  try {
    const [[admin]] = await conn.query("SELECT id FROM users WHERE role = 'admin' ORDER BY id LIMIT 1");
    if (!admin) return;

    const [[smabCount]] = await conn.query('SELECT COUNT(*) AS total FROM smab_locations');
    if (smabCount.total === 0) {
      const smabData = readLegacyData('smabData.js', 'smabData');
      for (const location of smabData) {
        await conn.query(
          `INSERT INTO smab_locations
           (nama_sekolah, kecamatan, ancaman_bencana, tahun_pembentukan, latitude, longitude, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [location.nama_sekolah, location.kecamatan, location.ancaman_bencana || null, location.tahun_pembentukan || null, location.latitude, location.longitude, admin.id],
        );
      }
    }

    const [[katanaCount]] = await conn.query('SELECT COUNT(*) AS total FROM katana_locations');
    if (katanaCount.total === 0) {
      const katanaData = readLegacyData('katanaData.js', 'katanaData');
      for (const location of katanaData) {
        await conn.query(
          `INSERT INTO katana_locations
           (kelurahan, kecamatan, pembentukan, ancaman_bencana, sumber_dana, latitude, longitude, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [location.kelurahan, location.kecamatan, location.pembentukan || null, location.ancaman_bencana || null, location.sumber_dana || null, location.latitude, location.longitude, admin.id],
        );
      }
    }
  } finally {
    conn.release();
  }
};

const ensureDefaultUsers = async () => {
  const conn = await pool.getConnection();
  try {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const petugasPasswordHash = await bcrypt.hash('admin123', 10);

    await conn.query(
      `INSERT IGNORE INTO users (name, email, password, role, wilayah)
       VALUES (?, ?, ?, 'admin', ?),
              (?, ?, ?, 'petugas', ?),
              (?, ?, ?, 'admin', ?)
      `,
      [
        'Admin BPBD', 'admin@bpbdsemarang.go.id', adminPasswordHash, 'Semarang',
        'Petugas BPBD', 'petugas@bpbdsemarang.go.id', petugasPasswordHash, 'Semarang',
        'Admin BPBD Legacy', 'admin@ilmannafia.go.id', adminPasswordHash, 'Semarang',
      ],
    );
  } finally {
    conn.release();
  }
};

// Test koneksi sekali saat server start
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Database terkoneksi:', process.env.DB_NAME);
    conn.release();

    await ensureBaseSchema();
    await ensureDefaultUsers();
    await ensureDefaultLocations();
    console.log('Database bootstrap selesai');
  } catch (err) {
    console.error('Gagal konek database:', err.message);
  }
})();

module.exports = pool;