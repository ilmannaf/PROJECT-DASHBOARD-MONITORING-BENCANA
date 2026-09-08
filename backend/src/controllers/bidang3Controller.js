const pool = require('../config/db');

// ========================================
// AIR BERSIH
// ========================================

exports.createAirBersihProposal = async (req, res) => {
  try {
    const { disaster_record_id, kelurahan, kecamatan, usulan_description } = req.body;

    if (!disaster_record_id || !kelurahan) {
      return res.status(400).json({ message: 'Disaster record ID dan kelurahan wajib diisi' });
    }

    // Validasi: cek apakah disaster record ada
    const [disaster] = await pool.query('SELECT id FROM disaster_records WHERE id = ?', [disaster_record_id]);
    if (disaster.length === 0) {
      return res.status(404).json({ message: 'Data bencana tidak ditemukan' });
    }

    const [result] = await pool.query(
      `INSERT INTO air_bersih_proposals (disaster_record_id, kelurahan, kecamatan, usulan_description, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [disaster_record_id, kelurahan, kecamatan || null, usulan_description || null, req.user.id]
    );

    // Log status awal
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_to, note, updated_by)
       VALUES ('air_bersih', ?, 'pending', 'Usulan dibuat', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Usulan air bersih berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAirBersihProposals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT abp.*, dr.location, dr.disaster_date, u.name AS created_by_name
      FROM air_bersih_proposals abp
      LEFT JOIN disaster_records dr ON abp.disaster_record_id = dr.id
      LEFT JOIN users u ON abp.created_by = u.id
      ORDER BY abp.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getAirBersihProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT abp.*, dr.location, dr.disaster_date, dr.kelurahan AS disaster_kelurahan, u.name AS created_by_name
      FROM air_bersih_proposals abp
      LEFT JOIN disaster_records dr ON abp.disaster_record_id = dr.id
      LEFT JOIN users u ON abp.created_by = u.id
      WHERE abp.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Get status history
    const [history] = await pool.query(
      `SELECT sh.*, u.name AS updated_by_name FROM status_history sh
       LEFT JOIN users u ON sh.updated_by = u.id
       WHERE sh.proposal_type = 'air_bersih' AND sh.proposal_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    res.json({ ...rows[0], status_history: history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateAirBersihStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, bukti_dukung_url } = req.body;

    const validStatuses = ['pending', 'diproses', 'selesai'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [existing] = await pool.query('SELECT * FROM air_bersih_proposals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await pool.query(
      `UPDATE air_bersih_proposals SET status = ?, bukti_dukung_url = COALESCE(?, bukti_dukung_url) WHERE id = ?`,
      [status, bukti_dukung_url || null, id]
    );

    // Log status change
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, bukti_dukung_url, updated_by)
       VALUES ('air_bersih', ?, ?, ?, ?, ?, ?)`,
      [id, statusFrom, status, note || null, bukti_dukung_url || null, req.user.id]
    );

    res.json({ message: 'Status air bersih berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteAirBersihProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM air_bersih_proposals WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Usulan air bersih berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ========================================
// BANSOS
// ========================================

exports.createBansosProposal = async (req, res) => {
  try {
    const { disaster_record_id, kelurahan, kecamatan, nama_penerima, nik_penerima, alamat_penerima, phone_penerima, usulan_description } = req.body;

    if (!disaster_record_id || !kelurahan || !nama_penerima) {
      return res.status(400).json({ message: 'Disaster record ID, kelurahan, dan nama penerima wajib diisi' });
    }

    // Validasi: cek apakah disaster record ada
    const [disaster] = await pool.query('SELECT id FROM disaster_records WHERE id = ?', [disaster_record_id]);
    if (disaster.length === 0) {
      return res.status(400).json({ message: 'Data bencana tidak ditemukan. Silakan laporkan bencana terlebih dahulu.' });
    }

    // Handle file upload surat pengajuan
    const surat_pengajuan_url = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO bansos_proposals (disaster_record_id, kelurahan, kecamatan, nama_penerima, nik_penerima, alamat_penerima, phone_penerima, usulan_description, surat_pengajuan_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [disaster_record_id, kelurahan, kecamatan || null, nama_penerima, nik_penerima || null, alamat_penerima || null, phone_penerima || null, usulan_description || null, surat_pengajuan_url, req.user.id]
    );

    // Log status awal
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_to, note, updated_by)
       VALUES ('bansos', ?, 'pending', 'Usulan dibuat', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Usulan bansos berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getBansosProposals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT bp.*, dr.location, dr.disaster_date, u.name AS created_by_name
      FROM bansos_proposals bp
      LEFT JOIN disaster_records dr ON bp.disaster_record_id = dr.id
      LEFT JOIN users u ON bp.created_by = u.id
      ORDER BY bp.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getBansosProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT bp.*, dr.location, dr.disaster_date, dr.kelurahan AS disaster_kelurahan, u.name AS created_by_name
      FROM bansos_proposals bp
      LEFT JOIN disaster_records dr ON bp.disaster_record_id = dr.id
      LEFT JOIN users u ON bp.created_by = u.id
      WHERE bp.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Get status history
    const [history] = await pool.query(
      `SELECT sh.*, u.name AS updated_by_name FROM status_history sh
       LEFT JOIN users u ON sh.updated_by = u.id
       WHERE sh.proposal_type = 'bansos' AND sh.proposal_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    // Get survey data
    const [surveys] = await pool.query(
      `SELECT s.*, u.name AS personil_name FROM surveys s
       LEFT JOIN users u ON s.personil_id = u.id
       WHERE s.proposal_type = 'bansos' AND s.proposal_id = ?
       ORDER BY s.created_at DESC`,
      [id]
    );

    res.json({ ...rows[0], status_history: history, surveys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateBansosStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, admin_notes, bukti_dukung_url } = req.body;

    const validStatuses = ['pending', 'diverifikasi', 'survey_dijadwalkan', 'sedang_survey', 'lolos_survey', 'tidak_lolos', 'proses_pencairan', 'selesai'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [existing] = await pool.query('SELECT * FROM bansos_proposals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await pool.query(
      `UPDATE bansos_proposals SET status = ?, admin_notes = COALESCE(?, admin_notes), bukti_dukung_url = COALESCE(?, bukti_dukung_url) WHERE id = ?`,
      [status, admin_notes || null, bukti_dukung_url || null, id]
    );

    // Log status change
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, bukti_dukung_url, updated_by)
       VALUES ('bansos', ?, ?, ?, ?, ?, ?)`,
      [id, statusFrom, status, note || null, bukti_dukung_url || null, req.user.id]
    );

    res.json({ message: 'Status bansos berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteBansosProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM bansos_proposals WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Usulan bansos berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ========================================
// INFRASTRUKTUR
// ========================================

exports.createInfrastrukturProposal = async (req, res) => {
  try {
    const { disaster_record_id, kelurahan, kecamatan, usulan_description, aset_milik_opd_lain, opd_nama } = req.body;

    if (!disaster_record_id || !kelurahan) {
      return res.status(400).json({ message: 'Disaster record ID dan kelurahan wajib diisi' });
    }

    // Validasi: cek apakah disaster record ada
    const [disaster] = await pool.query('SELECT id FROM disaster_records WHERE id = ?', [disaster_record_id]);
    if (disaster.length === 0) {
      return res.status(404).json({ message: 'Data bencana tidak ditemukan' });
    }

    const [result] = await pool.query(
      `INSERT INTO infrastruktur_proposals (disaster_record_id, kelurahan, kecamatan, usulan_description, aset_milik_opd_lain, opd_nama, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [disaster_record_id, kelurahan, kecamatan || null, usulan_description || null, aset_milik_opd_lain === 'true' || aset_milik_opd_lain === true ? 1 : 0, opd_nama || null, req.user.id]
    );

    // Log status awal
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_to, note, updated_by)
       VALUES ('infrastruktur', ?, 'pending', 'Usulan dibuat', ?)`,
      [result.insertId, req.user.id]
    );

    res.status(201).json({ message: 'Usulan infrastruktur berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getInfrastrukturProposals = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ip.*, dr.location, dr.disaster_date, u.name AS created_by_name
      FROM infrastruktur_proposals ip
      LEFT JOIN disaster_records dr ON ip.disaster_record_id = dr.id
      LEFT JOIN users u ON ip.created_by = u.id
      ORDER BY ip.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getInfrastrukturProposalById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT ip.*, dr.location, dr.disaster_date, dr.kelurahan AS disaster_kelurahan, u.name AS created_by_name
      FROM infrastruktur_proposals ip
      LEFT JOIN disaster_records dr ON ip.disaster_record_id = dr.id
      LEFT JOIN users u ON ip.created_by = u.id
      WHERE ip.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    // Get status history
    const [history] = await pool.query(
      `SELECT sh.*, u.name AS updated_by_name FROM status_history sh
       LEFT JOIN users u ON sh.updated_by = u.id
       WHERE sh.proposal_type = 'infrastruktur' AND sh.proposal_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    // Get survey data
    const [surveys] = await pool.query(
      `SELECT s.*, u.name AS personil_name FROM surveys s
       LEFT JOIN users u ON s.personil_id = u.id
       WHERE s.proposal_type = 'infrastruktur' AND s.proposal_id = ?
       ORDER BY s.created_at DESC`,
      [id]
    );

    res.json({ ...rows[0], status_history: history, surveys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateInfrastrukturStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, admin_notes, bukti_dukung_url } = req.body;

    const validStatuses = ['pending', 'diverifikasi', 'survey_dijadwalkan', 'sedang_survey', 'lolos_survey', 'tidak_lolos', 'dalam_pengerjaan', 'selesai'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const [existing] = await pool.query('SELECT * FROM infrastruktur_proposals WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    const statusFrom = existing[0].status;

    await pool.query(
      `UPDATE infrastruktur_proposals SET status = ?, admin_notes = COALESCE(?, admin_notes), bukti_dukung_url = COALESCE(?, bukti_dukung_url) WHERE id = ?`,
      [status, admin_notes || null, bukti_dukung_url || null, id]
    );

    // Log status change
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_from, status_to, note, bukti_dukung_url, updated_by)
       VALUES ('infrastruktur', ?, ?, ?, ?, ?, ?)`,
      [id, statusFrom, status, note || null, bukti_dukung_url || null, req.user.id]
    );

    res.json({ message: 'Status infrastruktur berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteInfrastrukturProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM infrastruktur_proposals WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }

    res.json({ message: 'Usulan infrastruktur berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ========================================
// SURVEY
// ========================================

exports.createSurvey = async (req, res) => {
  try {
    const { proposal_type, proposal_id, survey_date, keterangan } = req.body;

    if (!proposal_type || !proposal_id) {
      return res.status(400).json({ message: 'Tipe proposal dan ID proposal wajib diisi' });
    }

    if (!['bansos', 'infrastruktur'].includes(proposal_type)) {
      return res.status(400).json({ message: 'Tipe proposal harus bansos atau infrastruktur' });
    }

    // Handle file uploads
    const surat_tugas_url = req.files?.surat_tugas ? `/uploads/${req.files.surat_tugas[0].filename}` : null;
    const form_survey_url = req.files?.form_survey ? `/uploads/${req.files.form_survey[0].filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO surveys (proposal_type, proposal_id, personil_id, surat_tugas_url, form_survey_url, survey_date, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [proposal_type, proposal_id, req.user.id, surat_tugas_url, form_survey_url, survey_date || null, keterangan || null]
    );

    // Update status proposal menjadi survey_dijadwalkan
    if (proposal_type === 'bansos') {
      await pool.query('UPDATE bansos_proposals SET status = ? WHERE id = ?', ['survey_dijadwalkan', proposal_id]);
    } else {
      await pool.query('UPDATE infrastruktur_proposals SET status = ? WHERE id = ?', ['survey_dijadwalkan', proposal_id]);
    }

    res.status(201).json({ message: 'Survey berhasil dibuat', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const { id } = req.params;
    const { hasil_survey, keterangan, survey_date } = req.body;

    const [existing] = await pool.query('SELECT * FROM surveys WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data survey tidak ditemukan' });
    }

    // Handle foto dokumentasi upload
    const foto_dokumentasi_url = req.file ? `/uploads/${req.file.filename}` : null;

    await pool.query(
      `UPDATE surveys SET
        hasil_survey = COALESCE(?, hasil_survey),
        keterangan = COALESCE(?, keterangan),
        survey_date = COALESCE(?, survey_date),
        foto_dokumentasi_url = COALESCE(?, foto_dokumentasi_url),
        status = 'selesai'
       WHERE id = ?`,
      [hasil_survey || null, keterangan || null, survey_date || null, foto_dokumentasi_url, id]
    );

    // Update status proposal berdasarkan hasil survey
    const survey = existing[0];
    if (survey.proposal_type === 'bansos') {
      const newStatus = hasil_survey === 'lolos' ? 'lolos_survey' : 'tidak_lolos';
      await pool.query('UPDATE bansos_proposals SET status = ? WHERE id = ?', [newStatus, survey.proposal_id]);
    } else {
      const newStatus = hasil_survey === 'lolos' ? 'lolos_survey' : 'tidak_lolos';
      await pool.query('UPDATE infrastruktur_proposals SET status = ? WHERE id = ?', [newStatus, survey.proposal_id]);
    }

    // Log status change
    await pool.query(
      `INSERT INTO status_history (proposal_type, proposal_id, status_to, note, updated_by)
       VALUES (?, ?, ?, ?, ?)`,
      [survey.proposal_type, survey.proposal_id, hasil_survey === 'lolos' ? 'lolos_survey' : 'tidak_lolos', `Survey: ${hasil_survey}. ${keterangan || ''}`, req.user.id]
    );

    res.json({ message: 'Survey berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getSurveys = async (req, res) => {
  try {
    const { proposal_type, proposal_id } = req.query;
    let query = `
      SELECT s.*, u.name AS personil_name
      FROM surveys s
      LEFT JOIN users u ON s.personil_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (proposal_type) {
      query += ' AND s.proposal_type = ?';
      params.push(proposal_type);
    }
    if (proposal_id) {
      query += ' AND s.proposal_id = ?';
      params.push(proposal_id);
    }

    query += ' ORDER BY s.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

// ========================================
// STATISTIK BIDANG 3
// ========================================

exports.getBidang3Stats = async (req, res) => {
  try {
    const [airBersih] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'diproses') as diproses,
        SUM(status = 'selesai') as selesai
      FROM air_bersih_proposals
    `);

    const [bansos] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'diverifikasi') as diverifikasi,
        SUM(status = 'survey_dijadwalkan') as survey_dijadwalkan,
        SUM(status = 'lolos_survey') as lolos,
        SUM(status = 'tidak_lolos') as tidak_lolos,
        SUM(status = 'proses_pencairan') as proses_pencairan,
        SUM(status = 'selesai') as selesai
      FROM bansos_proposals
    `);

    const [infrastruktur] = await pool.query(`
      SELECT
        COUNT(*) as total,
        SUM(status = 'pending') as pending,
        SUM(status = 'diverifikasi') as diverifikasi,
        SUM(status = 'survey_dijadwalkan') as survey_dijadwalkan,
        SUM(status = 'lolos_survey') as lolos,
        SUM(status = 'tidak_lolos') as tidak_lolos,
        SUM(status = 'dalam_pengerjaan') as dalam_pengerjaan,
        SUM(status = 'selesai') as selesai
      FROM infrastruktur_proposals
    `);

    res.json({
      air_bersih: airBersih[0],
      bansos: bansos[0],
      infrastruktur: infrastruktur[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
