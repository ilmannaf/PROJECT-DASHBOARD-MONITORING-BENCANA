const pool = require('../config/db');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

exports.createDisasterRecord = async (req, res) => {
  try {
    const { disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, kerugian, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, sumber_info_nama, sumber_info_phone } = req.body;

    if (!disaster_date || !disaster_time || !location || !kelurahan || !kecamatan || !kronologi) {
      return res.status(400).json({ message: 'Tanggal, jam, lokasi, kelurahan, kecamatan, dan kronologi wajib diisi' });
    }

    // Handle photo uploads
    const photos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const photosJson = JSON.stringify(photos);

    const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    const dash = (v) => (v === '' || v === null || v === undefined ? '-' : v);
    const korbanData = [korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk];
    const hasKorbanData = korbanData.some((v) => v !== '' && v !== null && v !== undefined);
    const korban = hasKorbanData
      ? `Pengungsi (PS): ${dash(korban_ps)}; Meninggal Dunia (MD): ${dash(korban_md)}; Luka Berat (LB): ${dash(korban_lb)}; Luka Ringan (LR): ${dash(korban_lr)}.\nJumlah Terdampak: Laki-laki: ${dash(terdampak_laki)}; Perempuan: ${dash(terdampak_perempuan)}; Anak-anak: ${dash(terdampak_anak)}; Diffable: ${dash(terdampak_diffable)}; Lansia: ${dash(terdampak_lansia)}; KK/Jiwa: ${dash(terdampak_kk)}`
      : null;

    const [result] = await pool.query(
      `INSERT INTO disaster_records (disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, korban, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, kerugian, sumber_info_nama, sumber_info_phone, photos, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik || null, pemilik_phone || null, kronologi, korban, num(korban_ps), num(korban_md), num(korban_lb), num(korban_lr), num(terdampak_laki), num(terdampak_perempuan), num(terdampak_anak), num(terdampak_diffable), num(terdampak_lansia), num(terdampak_kk), kerugian || null, sumber_info_nama || null, sumber_info_phone || null, photosJson, req.user.id]
    );

    res.status(201).json({ message: 'Pendataan bencana berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getDisasterRecords = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT dr.*, u.name AS created_by_name
      FROM disaster_records dr
      LEFT JOIN users u ON dr.created_by = u.id
      ORDER BY dr.disaster_date DESC, dr.disaster_time DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getDisasterRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT dr.*, u.name AS created_by_name
      FROM disaster_records dr
      LEFT JOIN users u ON dr.created_by = u.id
      WHERE dr.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateDisasterRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, kerugian, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, sumber_info_nama, sumber_info_phone } = req.body;

    const [existing] = await pool.query('SELECT * FROM disaster_records WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Handle photo uploads - merge with existing photos
    let existingPhotos = [];
    try {
      existingPhotos = JSON.parse(existing[0].photos || '[]');
    } catch {}
    
    // Check if there are photos to remove (sent as JSON string)
    let photosToRemove = [];
    if (req.body.photos_to_remove) {
      try {
        photosToRemove = JSON.parse(req.body.photos_to_remove);
      } catch {}
    }
    
    // Filter out removed photos
    existingPhotos = existingPhotos.filter(p => !photosToRemove.includes(p));
    
    // Add new uploaded photos
    const newPhotos = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
    const allPhotos = [...existingPhotos, ...newPhotos].slice(0, 5); // max 5
    const photosJson = JSON.stringify(allPhotos);

    const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    const dash = (v) => (v === '' || v === null || v === undefined ? '-' : v);
    const korbanData = [korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk];
    const hasKorbanData = korbanData.some((v) => v !== '' && v !== null && v !== undefined);
    const korban = hasKorbanData
      ? `Pengungsi (PS): ${dash(korban_ps)}; Meninggal Dunia (MD): ${dash(korban_md)}; Luka Berat (LB): ${dash(korban_lb)}; Luka Ringan (LR): ${dash(korban_lr)}.\nJumlah Terdampak: Laki-laki: ${dash(terdampak_laki)}; Perempuan: ${dash(terdampak_perempuan)}; Anak-anak: ${dash(terdampak_anak)}; Diffable: ${dash(terdampak_diffable)}; Lansia: ${dash(terdampak_lansia)}; KK/Jiwa: ${dash(terdampak_kk)}`
      : null;

    await pool.query(
      `UPDATE disaster_records SET
        disaster_date = COALESCE(?, disaster_date),
        disaster_time = COALESCE(?, disaster_time),
        location = COALESCE(?, location),
        kelurahan = COALESCE(?, kelurahan),
        kecamatan = COALESCE(?, kecamatan),
        pemilik = COALESCE(?, pemilik),
        pemilik_phone = COALESCE(?, pemilik_phone),
        kronologi = COALESCE(?, kronologi),
        korban = COALESCE(?, korban),
        korban_ps = COALESCE(?, korban_ps),
        korban_md = COALESCE(?, korban_md),
        korban_lb = COALESCE(?, korban_lb),
        korban_lr = COALESCE(?, korban_lr),
        terdampak_laki = COALESCE(?, terdampak_laki),
        terdampak_perempuan = COALESCE(?, terdampak_perempuan),
        terdampak_anak = COALESCE(?, terdampak_anak),
        terdampak_diffable = COALESCE(?, terdampak_diffable),
        terdampak_lansia = COALESCE(?, terdampak_lansia),
        terdampak_kk = COALESCE(?, terdampak_kk),
        kerugian = COALESCE(?, kerugian),
        sumber_info_nama = COALESCE(?, sumber_info_nama),
        sumber_info_phone = COALESCE(?, sumber_info_phone),
        photos = ?
       WHERE id = ?`,
      [disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, korban, num(korban_ps), num(korban_md), num(korban_lb), num(korban_lr), num(terdampak_laki), num(terdampak_perempuan), num(terdampak_anak), num(terdampak_diffable), num(terdampak_lansia), num(terdampak_kk), kerugian, sumber_info_nama, sumber_info_phone, photosJson, id]
    );

    res.json({ message: 'Data pendataan bencana berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteDisasterRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM disaster_records WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Data pendataan bencana berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

function formatTanggal(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function sectionLabel(doc, text) {
  doc.moveDown(0.9)
    .fillColor('#c2410c')
    .font('Helvetica-Bold')
    .fontSize(10.5)
    .text(text)
    .moveDown(0.35);
}

exports.exportDisasterRecordPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT dr.*, u.name AS created_by_name
      FROM disaster_records dr
      LEFT JOIN users u ON dr.created_by = u.id
      WHERE dr.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const r = rows[0];
    const doc = new PDFDocument({ size: 'A4', margins: { top: 48, bottom: 48, left: 48, right: 48 } });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="pendataan-bencana-${r.id}.pdf"`);
      res.send(pdf);
    });

    // Kop dokumen
    doc.fillColor('#111827');
    doc.font('Helvetica-Bold').fontSize(15).text('PEMERINTAH KOTA SEMARANG', { align: 'center' });
    doc.font('Helvetica').fontSize(13).text('BADAN PENANGGULANGAN BENCANA DAERAH', { align: 'center' });
    doc.fontSize(9).fillColor('#6b7280').text('Jl. Pemuda No. 1, Semarang - Telp (024) 112', { align: 'center' });
    doc.moveDown(0.4);

    doc.moveTo(48, doc.y).lineTo(552, doc.y).lineWidth(2).strokeColor('#ea580c').stroke();

    doc.moveDown(1);
    doc.fillColor('#111827').font('Helvetica-Bold').fontSize(17).text('FORMULIR PENDATAAN BENCANA', { align: 'center' });
    doc.font('Helvetica').fontSize(9.5).fillColor('#6b7280')
      .text(`Dibuat oleh: ${r.created_by_name || '-'}  |  Waktu input: ${r.created_at ? r.created_at.toLocaleString('id-ID') : '-'}`, { align: 'center' });
    doc.moveDown(1.2);

    // Ringkasan kejadian
    const row = (label, value, indent = 0) => {
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#374151').text(`${label}`, 48 + indent, doc.y, { continued: true });
      doc.font('Helvetica').text(`:  ${value || '-'}`, 190 + indent, doc.y);
      doc.moveDown(0.45);
    };

    sectionLabel(doc, 'A. INFORMASI KEJADIAN');
    row('Jenis Kejadian', 'Kebakaran');
    row('Tanggal', formatTanggal(r.disaster_date));
    row('Jam Kejadian', `${String(r.disaster_time).slice(0, 5)} WIB`);
    row('Lokasi', r.location);
    row('Kelurahan', r.kelurahan);
    row('Kecamatan', r.kecamatan);
    row('Kota / Provinsi', 'Kota Semarang, Jawa Tengah');
    row('Pemilik / Korban', r.pemilik);

    sectionLabel(doc, 'B. KRONOLOGI KEJADIAN');
    doc.font('Helvetica').fontSize(10).fillColor('#111827').text(r.kronologi || '-', { align: 'justify', lineGap: 4 });

    sectionLabel(doc, 'C. KORBAN & KERUGIAN');
    row('Data Korban', '');
    doc.moveUp(0.45);
    doc.font('Helvetica').fontSize(10).fillColor('#111827').text(r.korban || '-', { lineGap: 3 });
    doc.moveDown(0.5);
    row('Kerugian Materi', '');
    doc.moveUp(0.45);
    doc.font('Helvetica').fontSize(10).fillColor('#111827').text(r.kerugian || '-', { lineGap: 3 });

    sectionLabel(doc, 'D. SUMBER INFORMASI');
    row('Nama', r.sumber_info_nama);
    row('No. HP / WA', r.sumber_info_phone);
    row('Email', '-');

    doc.moveDown(1.6);
    doc.moveTo(48, doc.y).lineTo(552, doc.y).lineWidth(0.8).strokeColor('#d1d5db').stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(8).fillColor('#9ca3af').text('Dokumen ini dibuat otomatis dari Sistem Dashboard Monitoring Kebencanaan BPBD Kota Semarang.', { align: 'center' });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// EXPORT EXCEL - Pendataan Bencana
exports.exportDisasterRecordsExcel = async (req, res) => {
  try {
    let query = 'SELECT * FROM disaster_records WHERE 1=1';
    const params = [];

    if (req.query.kecamatan) {
      query += ' AND kecamatan = ?';
      params.push(req.query.kecamatan);
    }
    if (req.query.date_from) {
      query += ' AND disaster_date >= ?';
      params.push(req.query.date_from);
    }
    if (req.query.date_to) {
      query += ' AND disaster_date <= ?';
      params.push(req.query.date_to);
    }

    query += ' ORDER BY disaster_date DESC, disaster_time DESC';
    const [rows] = await pool.query(query, params);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'BPBD Kota Semarang';
    const ws = wb.addWorksheet('Pendataan Bencana', { views: [{ state: 'frozen', ySplit: 1 }] });

    ws.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Tanggal', key: 'disaster_date', width: 14 },
      { header: 'Jam', key: 'disaster_time', width: 10 },
      { header: 'Lokasi', key: 'location', width: 30 },
      { header: 'Kelurahan', key: 'kelurahan', width: 18 },
      { header: 'Kecamatan', key: 'kecamatan', width: 18 },
      { header: 'Kronologi', key: 'kronologi', width: 40 },
      { header: 'Korban Pengungsi', key: 'korban_ps', width: 16 },
      { header: 'Korban Meninggal', key: 'korban_md', width: 16 },
      { header: 'Korban Luka Berat', key: 'korban_lb', width: 16 },
      { header: 'Korban Luka Ringan', key: 'korban_lr', width: 16 },
      { header: 'Terdampak Laki-laki', key: 'terdampak_laki', width: 18 },
      { header: 'Terdampak Perempuan', key: 'terdampak_perempuan', width: 18 },
      { header: 'Terdampak Anak', key: 'terdampak_anak', width: 15 },
      { header: 'Kerugian', key: 'kerugian', width: 25 },
      { header: 'Pemilik', key: 'pemilik', width: 20 },
      { header: 'Sumber Info', key: 'sumber_info_nama', width: 20 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFe65100' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    rows.forEach((r, i) => {
      ws.addRow({
        no: i + 1,
        disaster_date: r.disaster_date ? new Date(r.disaster_date).toLocaleDateString('id-ID') : '',
        disaster_time: r.disaster_time || '',
        location: r.location || '',
        kelurahan: r.kelurahan || '',
        kecamatan: r.kecamatan || '',
        kronologi: r.kronologi || '',
        korban_ps: r.korban_ps || 0,
        korban_md: r.korban_md || 0,
        korban_lb: r.korban_lb || 0,
        korban_lr: r.korban_lr || 0,
        terdampak_laki: r.terdampak_laki || 0,
        terdampak_perempuan: r.terdampak_perempuan || 0,
        terdampak_anak: r.terdampak_anak || 0,
        kerugian: r.kerugian || '',
        pemilik: r.pemilik || '',
        sumber_info_nama: r.sumber_info_nama || '',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pendataan-bencana.xlsx');
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal export Excel' });
  }
};
