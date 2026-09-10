const pool = require('../config/db');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

exports.getDistributions = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wd.*, u.name AS created_by_name
      FROM water_distributions wd
      LEFT JOIN users u ON wd.created_by = u.id
      ORDER BY wd.distribution_date DESC, wd.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getDistributionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT wd.*, u.name AS created_by_name
      FROM water_distributions wd
      LEFT JOIN users u ON wd.created_by = u.id
      WHERE wd.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Data distribusi tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.exportDistributionsExcel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wd.distribution_date, wd.kelurahan, wd.kecamatan, wd.location_address, wd.amount_liters, wd.status, wd.tank_truck_count, wd.documentation_photo
      FROM water_distributions wd
      ORDER BY distribution_date DESC, id DESC
    `);

    const statusLabels = {
      selesai: 'Selesai',
      dalam_proses: 'Dalam Proses',
      dibatalkan: 'Dibatalkan',
    };
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BPBD Kota Semarang';
    const worksheet = workbook.addWorksheet('Distribusi Air Bersih', {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Kelurahan', key: 'kelurahan', width: 22 },
      { header: 'Kecamatan', key: 'kecamatan', width: 22 },
      { header: 'Lokasi', key: 'lokasi', width: 38 },
      { header: 'Liter', key: 'liter', width: 14 },
      { header: 'Jumlah Truk Tangki', key: 'jumlah_truk_tangki', width: 22 },
      { header: 'Foto Dokumentasi', key: 'foto_dokumentasi', width: 22 },
      { header: 'Status', key: 'status', width: 18 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFB8CCE4' } },
        bottom: { style: 'thin', color: { argb: 'FFB8CCE4' } },
        left: { style: 'thin', color: { argb: 'FFB8CCE4' } },
        right: { style: 'thin', color: { argb: 'FFB8CCE4' } },
      };
    });

    rows.forEach((row) => {
      const excelRow = worksheet.addRow({
        tanggal: row.distribution_date ? new Date(row.distribution_date) : '',
        kelurahan: row.kelurahan || '',
        kecamatan: row.kecamatan || '',
        lokasi: row.location_address || '',
        liter: Number(row.amount_liters) || 0,
        jumlah_truk_tangki: Number(row.tank_truck_count) || 0,
        foto_dokumentasi: row.documentation_photo ? 'Terlampir' : '-',
        status: statusLabels[row.status] || row.status || '',
      });

      excelRow.height = 22;
      excelRow.alignment = { vertical: 'middle', wrapText: true };
      excelRow.getCell('tanggal').numFmt = 'dd/mm/yyyy';
      excelRow.getCell('liter').numFmt = '#,##0';
      excelRow.getCell('jumlah_truk_tangki').numFmt = '#,##0';
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9E2F3' } },
          bottom: { style: 'thin', color: { argb: 'FFD9E2F3' } },
          left: { style: 'thin', color: { argb: 'FFD9E2F3' } },
          right: { style: 'thin', color: { argb: 'FFD9E2F3' } },
        };
      });
      if (excelRow.number % 2 === 0) {
        excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F8FC' } };
      }
      excelRow.getCell('tanggal').alignment = { vertical: 'middle', horizontal: 'center' };
      excelRow.getCell('liter').alignment = { vertical: 'middle', horizontal: 'right' };
      excelRow.getCell('jumlah_truk_tangki').alignment = { vertical: 'middle', horizontal: 'center' };
      excelRow.getCell('foto_dokumentasi').alignment = { vertical: 'middle', horizontal: 'center' };
      excelRow.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };

      if (row.documentation_photo) {
        const photoPath = path.join(__dirname, '../../uploads', path.basename(row.documentation_photo));
        if (fs.existsSync(photoPath)) {
          const imageId = workbook.addImage({ filename: photoPath, extension: 'jpeg' });
          worksheet.addImage(imageId, {
            tl: { col: 6, row: excelRow.number - 1 },
            ext: { width: 125, height: 70 },
          });
          excelRow.height = 58;
        }
      }
    });

    worksheet.autoFilter = { from: 'A1', to: 'H1' };
    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    };
    worksheet.headerFooter.oddFooter = '&LBPBD Kota Semarang&RHalaman &P dari &N';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=distribusi-air-bersih.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal export Excel' });
  }
};

exports.createDistribution = async (req, res) => {
  try {
    const { distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, tank_truck_count, total_supply, notes } = req.body;

    if (!distribution_date || !kelurahan || !kecamatan || !location_address) {
      return res.status(400).json({ message: 'Tanggal, kelurahan, kecamatan, dan alamat wajib diisi' });
    }

    if (!Number.isInteger(Number(tank_truck_count)) || Number(tank_truck_count) < 1) {
      return res.status(400).json({ message: 'Jumlah truk tangki minimal 1' });
    }

    const documentationPhoto = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO water_distributions (distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, tank_truck_count, documentation_photo, total_supply, notes, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [distribution_date, kelurahan, kecamatan, location_address, latitude || null, longitude || null, amount_liters || 0, Number(tank_truck_count), documentationPhoto, total_supply || 0, notes || null, 'selesai', req.user.id]
    );

    res.status(201).json({ message: 'Data pendistribusian air bersih berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, tank_truck_count, total_supply, notes } = req.body;

    const [existing] = await pool.query('SELECT * FROM water_distributions WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Data distribusi tidak ditemukan' });
    }

    if (tank_truck_count !== undefined && (!Number.isInteger(Number(tank_truck_count)) || Number(tank_truck_count) < 1)) {
      return res.status(400).json({ message: 'Jumlah truk tangki minimal 1' });
    }

    await pool.query(
      `UPDATE water_distributions SET
        distribution_date = COALESCE(?, distribution_date),
        kelurahan = COALESCE(?, kelurahan),
        kecamatan = COALESCE(?, kecamatan),
        location_address = COALESCE(?, location_address),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        amount_liters = COALESCE(?, amount_liters),
        tank_truck_count = COALESCE(?, tank_truck_count),
        documentation_photo = COALESCE(?, documentation_photo),
        total_supply = COALESCE(?, total_supply),
        notes = COALESCE(?, notes)
       WHERE id = ?`,
      [distribution_date, kelurahan, kecamatan, location_address, latitude, longitude, amount_liters, tank_truck_count, req.file ? `/uploads/${req.file.filename}` : null, total_supply, notes, id]
    );

    res.json({ message: 'Data pendistribusian air bersih berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteDistribution = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM water_distributions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Data distribusi tidak ditemukan' });
    }

    res.json({ message: 'Data pendistribusian air bersih berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM water_distributions');
    const [inProcessRows] = await pool.query("SELECT COUNT(*) AS total FROM water_distributions WHERE status = 'dalam_proses'");
    const [doneRows] = await pool.query("SELECT COUNT(*) AS total FROM water_distributions WHERE status = 'selesai'");
    const [canceledRows] = await pool.query("SELECT COUNT(*) AS total FROM water_distributions WHERE status = 'dibatalkan'");
    const [totalLitersRows] = await pool.query('SELECT COALESCE(CAST(SUM(amount_liters) AS UNSIGNED), 0) AS total FROM water_distributions WHERE status != \'dibatalkan\'');
    const [supplySettings] = await pool.query('SELECT total_supply FROM water_supply_settings ORDER BY id DESC LIMIT 1');
    const [uniqueTanks] = await pool.query('SELECT COUNT(DISTINCT location_address) AS total FROM water_distributions WHERE status != \'dibatalkan\'');
    const [uniqueKelurahan] = await pool.query('SELECT COUNT(DISTINCT kelurahan) AS total FROM water_distributions WHERE status != \'dibatalkan\'');
    const [uniqueKecamatan] = await pool.query('SELECT COUNT(DISTINCT kecamatan) AS total FROM water_distributions WHERE status != \'dibatalkan\'');

    const totalSupply = supplySettings.length > 0 ? supplySettings[0].total_supply : 0;
    const totalDistributed = totalLitersRows[0].total;
    const tersedia = totalSupply - totalDistributed;

    res.json({
      totalData: totalRows[0].total,
      inProcess: inProcessRows[0].total,
      selesai: doneRows[0].total,
      dibatalkan: canceledRows[0].total,
      totalLiters: totalDistributed,
      totalSupply: totalSupply,
      tersedia: tersedia > 0 ? tersedia : 0,
      totalTanks: uniqueTanks[0].total,
      totalKelurahan: uniqueKelurahan[0].total,
      totalKecamatan: uniqueKecamatan[0].total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};
