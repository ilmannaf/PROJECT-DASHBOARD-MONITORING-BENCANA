const pool = require('../config/db');
const ExcelJS = require('exceljs');

exports.createBttPenerima = async (req, res) => {
  try {
    const { btt_id, nama_penerima, no_kk, nik, jenis_bencana, tanggal_kejadian, kategori_kerusakan, kerusakan, status_pendanaan, tanggal_pencairan, persentase_kerusakan, alamat, kelurahan, kecamatan, besaran_bantuan } = req.body;

    if (!btt_id || !nama_penerima || !jenis_bencana || !tanggal_kejadian || !alamat || !besaran_bantuan) {
      return res.status(400).json({ message: 'Nama, tanggal kejadian, jenis bencana, alamat, dan besaran bantuan wajib diisi' });
    }
    if (!['belum_cair', 'cair', 'tidak_cair'].includes(status_pendanaan || 'belum_cair')) {
      return res.status(400).json({ message: 'Status pendanaan tidak valid' });
    }

    const [result] = await pool.query(
      `INSERT INTO btt_penerima (btt_id, nama_penerima, no_kk, nik, jenis_bencana, tanggal_kejadian, kategori_kerusakan, kerusakan, status_pendanaan, tanggal_pencairan, persentase_kerusakan, alamat, kelurahan, kecamatan, besaran_bantuan, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [btt_id, nama_penerima, no_kk || null, nik || null, jenis_bencana, tanggal_kejadian, kategori_kerusakan || null, kerusakan || null, status_pendanaan || 'belum_cair', tanggal_pencairan || null, persentase_kerusakan || 100, alamat, kelurahan || null, kecamatan || null, besaran_bantuan, req.user.id]
    );

    res.status(201).json({ message: 'Data penerima berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getBttPenerimaByBttId = async (req, res) => {
  try {
    const { btt_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM btt_penerima WHERE btt_id = ? ORDER BY id ASC', [btt_id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.getBttPenerimaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM btt_penerima WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.updateBttPenerima = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_penerima, no_kk, nik, jenis_bencana, tanggal_kejadian, kategori_kerusakan, kerusakan, status_pendanaan, tanggal_pencairan, persentase_kerusakan, alamat, kelurahan, kecamatan, besaran_bantuan } = req.body;

    await pool.query(
      `UPDATE btt_penerima SET nama_penerima=?, no_kk=?, nik=?, jenis_bencana=?, tanggal_kejadian=?, kategori_kerusakan=?, kerusakan=?, status_pendanaan=?, tanggal_pencairan=?, persentase_kerusakan=?, alamat=?, kelurahan=?, kecamatan=?, besaran_bantuan=? WHERE id=?`,
      [nama_penerima, no_kk || null, nik || null, jenis_bencana, tanggal_kejadian, kategori_kerusakan || null, kerusakan || null, status_pendanaan || 'belum_cair', tanggal_pencairan || null, persentase_kerusakan || 100, alamat, kelurahan || null, kecamatan || null, besaran_bantuan, id]
    );

    res.json({ message: 'Data penerima berhasil diperbarui' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.deleteBttPenerima = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM btt_penerima WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Data tidak ditemukan' });
    res.json({ message: 'Data penerima berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

exports.exportBttPenerima = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM btt_penerima ORDER BY id ASC');
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BPBD Kota Semarang';
    const worksheet = workbook.addWorksheet('Penerima BTT', { views: [{ state: 'frozen', ySplit: 2 }] });

    worksheet.mergeCells('A1:K1');
    worksheet.getCell('A1').value = 'DATA REKAPAN PENERIMAAN BANTUAN BENCANA BPBD KOTA SEMARANG 2026';
    worksheet.getCell('A1').font = { name: 'Times New Roman', bold: true, size: 14, color: { argb: 'FF000000' } };
    worksheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EAD3' } };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    worksheet.columns = [
      { header: 'No', key: 'no', width: 6 },
      { header: 'Hari/Tanggal Kejadian', key: 'tanggal_kejadian', width: 22 },
      { header: 'Nama Kepala Keluarga', key: 'nama_penerima', width: 28 },
      { header: 'No. KK', key: 'no_kk', width: 22 },
      { header: 'NIK', key: 'nik', width: 22 },
      { header: 'Jenis Bencana', key: 'jenis_bencana', width: 24 },
      { header: 'Alamat (RT/RW)', key: 'alamat', width: 42 },
      { header: 'Kategori Kerusakan', key: 'kategori_kerusakan', width: 36 },
      { header: 'Status Pendanaan', key: 'status_pendanaan', width: 20 },
      { header: 'Hari/Tanggal Pencairan', key: 'tanggal_pencairan', width: 22 },
      { header: 'Besar Bantuan', key: 'besaran_bantuan', width: 18 },
    ];
    const headerRow = worksheet.getRow(2);
    headerRow.font = { name: 'Times New Roman', bold: true, size: 10, color: { argb: 'FF000000' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    headerRow.height = 34;
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };
    });

    rows.forEach((row, index) => {
      const excelRow = worksheet.addRow({
        no: index + 1,
        tanggal_kejadian: row.tanggal_kejadian ? new Date(row.tanggal_kejadian) : '',
        nama_penerima: row.nama_penerima,
        no_kk: row.no_kk || '',
        nik: row.nik || '',
        jenis_bencana: row.jenis_bencana,
        alamat: row.alamat,
        kategori_kerusakan: row.kategori_kerusakan || row.kerusakan || '',
        status_pendanaan: row.status_pendanaan === 'cair' ? 'Cair' : row.status_pendanaan === 'tidak_cair' ? 'Tidak Cair' : 'Dalam Proses',
        tanggal_pencairan: row.tanggal_pencairan ? new Date(row.tanggal_pencairan) : '',
        besaran_bantuan: Number(row.besaran_bantuan) || 0,
      });

      excelRow.height = 25;
      excelRow.font = { name: 'Times New Roman', size: 9, color: { argb: 'FF000000' } };
      excelRow.alignment = { vertical: 'middle', wrapText: true };
      excelRow.getCell('tanggal_kejadian').numFmt = 'dd/mm/yyyy';
      excelRow.getCell('tanggal_pencairan').numFmt = 'dd/mm/yyyy';
      excelRow.getCell('besaran_bantuan').numFmt = 'Rp #,##0';
      excelRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } },
        };
      });
      excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } };
      ['no', 'tanggal_kejadian', 'no_kk', 'nik', 'status_pendanaan', 'tanggal_pencairan', 'besaran_bantuan'].forEach((key) => {
        excelRow.getCell(key).alignment = { vertical: 'middle', horizontal: key === 'besaran_bantuan' ? 'right' : 'center', wrapText: true };
      });
      const statusCell = excelRow.getCell('status_pendanaan');
      statusCell.font = { bold: true, color: { argb: row.status_pendanaan === 'cair' ? 'FF15803D' : row.status_pendanaan === 'tidak_cair' ? 'FFB91C1C' : 'FFB45309' } };
    });
    worksheet.getColumn('besaran_bantuan').numFmt = 'Rp #,##0';
    worksheet.autoFilter = { from: 'A2', to: 'K2' };
    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
      horizontalDpi: 300,
      verticalDpi: 300,
      margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    };
    worksheet.printArea = `A1:K${worksheet.rowCount}`;
    worksheet.printTitlesRow = '1:2';
    worksheet.headerFooter.oddFooter = '&LBPBD Kota Semarang&RHalaman &P dari &N';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="rekapan-penerima-bantuan-btt.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengekspor data BTT' });
  }
};
