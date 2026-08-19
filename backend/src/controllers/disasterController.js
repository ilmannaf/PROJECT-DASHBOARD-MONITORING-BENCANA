const pool = require('../config/db');
const PDFDocument = require('pdfkit');

exports.createDisasterRecord = async (req, res) => {
  try {
    const { disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, kerugian, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, sumber_info_nama, sumber_info_phone } = req.body;

    if (!disaster_date || !disaster_time || !location || !kelurahan || !kecamatan || !kronologi) {
      return res.status(400).json({ message: 'Tanggal, jam, lokasi, kelurahan, kecamatan, dan kronologi wajib diisi' });
    }

    const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
    const dash = (v) => (v === '' || v === null || v === undefined ? '-' : v);
    const korbanData = [korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk];
    const hasKorbanData = korbanData.some((v) => v !== '' && v !== null && v !== undefined);
    const korban = hasKorbanData
      ? `Pengungsi (PS): ${dash(korban_ps)}; Meninggal Dunia (MD): ${dash(korban_md)}; Luka Berat (LB): ${dash(korban_lb)}; Luka Ringan (LR): ${dash(korban_lr)}.\nJumlah Terdampak: Laki-laki: ${dash(terdampak_laki)}; Perempuan: ${dash(terdampak_perempuan)}; Anak-anak: ${dash(terdampak_anak)}; Diffable: ${dash(terdampak_diffable)}; Lansia: ${dash(terdampak_lansia)}; KK/Jiwa: ${dash(terdampak_kk)}`
      : null;

    const [result] = await pool.query(
      `INSERT INTO disaster_records (disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, korban, korban_ps, korban_md, korban_lb, korban_lr, terdampak_laki, terdampak_perempuan, terdampak_anak, terdampak_diffable, terdampak_lansia, terdampak_kk, kerugian, sumber_info_nama, sumber_info_phone, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik || null, pemilik_phone || null, kronologi, korban, num(korban_ps), num(korban_md), num(korban_lb), num(korban_lr), num(terdampak_laki), num(terdampak_perempuan), num(terdampak_anak), num(terdampak_diffable), num(terdampak_lansia), num(terdampak_kk), kerugian || null, sumber_info_nama || null, sumber_info_phone || null, req.user.id]
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
        sumber_info_phone = COALESCE(?, sumber_info_phone)
       WHERE id = ?`,
      [disaster_date, disaster_time, location, kelurahan, kecamatan, pemilik, pemilik_phone, kronologi, korban, num(korban_ps), num(korban_md), num(korban_lb), num(korban_lr), num(terdampak_laki), num(terdampak_perempuan), num(terdampak_anak), num(terdampak_diffable), num(terdampak_lansia), num(terdampak_kk), kerugian, sumber_info_nama, sumber_info_phone, id]
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
