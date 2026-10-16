import * as XLSX from 'xlsx';
import type { Kelas, UserProfile } from '../types.ts';

export interface ParsedStudentRow {
  nis: string;
  nama: string;
  email: string;
  kelasId: string;
  kelasNama: string;
  telepon: string;
  jenisKelamin: 'L' | 'P';
  alamat?: string;
  isValid: boolean;
  validationError?: string;
}

export interface ParsedTeacherRow {
  nip: string;
  nama: string;
  email: string;
  mapel: string;
  role: 'guru' | 'admin';
  isWaliKelas: boolean;
  waliKelasRombel?: string;
  waliKelasId?: string;
  telepon: string;
  jenisKelamin: 'L' | 'P';
  isValid: boolean;
  validationError?: string;
}

/**
 * Buat template workbook untuk Murid (Siswa)
 */
export function createStudentTemplateWorkbook(): XLSX.WorkBook {
  const sampleData = [
    {
      'NIS*': '20240110',
      'Nama Lengkap*': 'Raditya Dika Pratama',
      'Kelas (Rombel)*': 'X RPL 1',
      'Email': 'raditya.dika@smk.belajar.id',
      'Jenis Kelamin (L/P)': 'L',
      'No Telepon / WA': '081234567890',
      'Alamat': 'Jl. Diponegoro No. 15, Jakarta',
    },
    {
      'NIS*': '20240111',
      'Nama Lengkap*': 'Aisyah Putri Rahmadani',
      'Kelas (Rombel)*': 'X RPL 2',
      'Email': 'aisyah.putri@smk.belajar.id',
      'Jenis Kelamin (L/P)': 'P',
      'No Telepon / WA': '081234567891',
      'Alamat': 'Jl. Pahlawan No. 20, Jakarta',
    },
    {
      'NIS*': '20240112',
      'Nama Lengkap*': 'Fajar Nugroho',
      'Kelas (Rombel)*': 'XI TKJ 1',
      'Email': 'fajar.nugroho@smk.belajar.id',
      'Jenis Kelamin (L/P)': 'L',
      'No Telepon / WA': '081234567892',
      'Alamat': 'Jl. Merdeka No. 44, Jakarta',
    },
  ];

  const petunjuk = [
    { 'Petunjuk Pengisian Template Import Murid': '1. Kolom dengan tanda (*) WAJIB diisi.' },
    { 'Petunjuk Pengisian Template Import Murid': '2. NIS harus unik (angka) dan belum terdaftar di sistem.' },
    { 'Petunjuk Pengisian Template Import Murid': '3. Nama Kelas harus sesuai dengan rombel yang sudah ada di sistem (contoh: X RPL 1, X RPL 2, XI TKJ 1).' },
    { 'Petunjuk Pengisian Template Import Murid': '4. Jika Email dikosongkan, sistem akan otomatis membuatkan email berbasis NIS: siswa.[NIS]@smk.belajar.id.' },
    { 'Petunjuk Pengisian Template Import Murid': '5. Jenis Kelamin diisi L (Laki-laki) atau P (Perempuan).' },
  ];

  const wb = XLSX.utils.book_new();
  const wsData = XLSX.utils.json_to_sheet(sampleData);
  const wsPetunjuk = XLSX.utils.json_to_sheet(petunjuk);

  wsData['!cols'] = [
    { wch: 14 }, // NIS
    { wch: 30 }, // Nama
    { wch: 18 }, // Kelas
    { wch: 32 }, // Email
    { wch: 20 }, // JK
    { wch: 18 }, // Telp
    { wch: 35 }, // Alamat
  ];

  wsPetunjuk['!cols'] = [{ wch: 90 }];

  XLSX.utils.book_append_sheet(wb, wsData, 'Data_Murid');
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk');
  return wb;
}

/**
 * Download file template Excel Murid
 */
export function downloadStudentTemplate(): void {
  const wb = createStudentTemplateWorkbook();
  XLSX.writeFile(wb, 'Template_Import_Murid_AbsensiSiswa.xlsx');
}

/**
 * Buat template workbook untuk Guru & Wali Kelas (Walas)
 */
export function createTeacherTemplateWorkbook(): XLSX.WorkBook {
  const sampleData = [
    {
      'NIP / NUPTK*': '198205142008011005',
      'Nama Lengkap & Gelar*': 'Drs. Hendro Wibowo, M.Kom.',
      'Email*': 'hendro.wibowo@smk.belajar.id',
      'Mata Pelajaran Pengampu*': 'Pemrograman Berorientasi Objek',
      'Tugas Tambahan (Guru Mapel / Walas)*': 'Walas',
      'Rombel Binaan (Jika Walas)': 'X RPL 1',
      'Jenis Kelamin (L/P)': 'L',
      'No Telepon / WA': '081345678910',
    },
    {
      'NIP / NUPTK*': '198709212014022003',
      'Nama Lengkap & Gelar*': 'Dewi Lestari, S.Pd., M.Si.',
      'Email*': 'dewi.lestari@smk.belajar.id',
      'Mata Pelajaran Pengampu*': 'Matematika Terapan',
      'Tugas Tambahan (Guru Mapel / Walas)*': 'Guru Mapel',
      'Rombel Binaan (Jika Walas)': '',
      'Jenis Kelamin (L/P)': 'P',
      'No Telepon / WA': '081345678911',
    },
    {
      'NIP / NUPTK*': '199103102019031008',
      'Nama Lengkap & Gelar*': 'Bambang Sudirman, S.T.',
      'Email*': 'bambang.sudirman@smk.belajar.id',
      'Mata Pelajaran Pengampu*': 'Administrasi Sistem Jaringan',
      'Tugas Tambahan (Guru Mapel / Walas)*': 'Walas',
      'Rombel Binaan (Jika Walas)': 'XI TKJ 1',
      'Jenis Kelamin (L/P)': 'L',
      'No Telepon / WA': '081345678912',
    },
  ];

  const petunjuk = [
    { 'Petunjuk Pengisian Template Import Guru & Walas': '1. Kolom dengan tanda (*) WAJIB diisi.' },
    { 'Petunjuk Pengisian Template Import Guru & Walas': '2. NIP / NUPTK harus unik (angka) untuk identifikasi akun guru.' },
    { 'Petunjuk Pengisian Template Import Guru & Walas': '3. Tugas Tambahan diisi "Walas" (Wali Kelas) atau "Guru Mapel".' },
    { 'Petunjuk Pengisian Template Import Guru & Walas': '4. Jika bertindak sebagai Walas, cantumkan nama rombel kelas binaan (contoh: X RPL 1).' },
    { 'Petunjuk Pengisian Template Import Guru & Walas': '5. Akun guru otomatis disiapkan untuk login ke modul Presensi & Rekap.' },
  ];

  const wb = XLSX.utils.book_new();
  const wsData = XLSX.utils.json_to_sheet(sampleData);
  const wsPetunjuk = XLSX.utils.json_to_sheet(petunjuk);

  wsData['!cols'] = [
    { wch: 22 }, // NIP
    { wch: 32 }, // Nama
    { wch: 32 }, // Email
    { wch: 32 }, // Mapel
    { wch: 35 }, // Tugas
    { wch: 26 }, // Rombel
    { wch: 20 }, // JK
    { wch: 18 }, // Telp
  ];

  wsPetunjuk['!cols'] = [{ wch: 90 }];

  XLSX.utils.book_append_sheet(wb, wsData, 'Data_Guru_Walas');
  XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk');
  return wb;
}

/**
 * Download file template Excel Guru & Walas
 */
export function downloadTeacherTemplate(): void {
  const wb = createTeacherTemplateWorkbook();
  XLSX.writeFile(wb, 'Template_Import_Guru_Walas_AbsensiSiswa.xlsx');
}

/**
 * Parse raw row objects into typed student items with robust validation
 */
export function parseStudentRows(
  rawRows: any[],
  classes: Kelas[],
  existingNisSet: Set<string>
): { valid: ParsedStudentRow[]; errors: string[] } {
  const valid: ParsedStudentRow[] = [];
  const errors: string[] = [];
  const seenNisInBatch = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1

    // Flexible column naming to support various headers
    const nis = String(
      row['NIS*'] ?? row['NIS'] ?? row['nis'] ?? row['Nomor Induk Siswa'] ?? ''
    ).trim();

    const nama = String(
      row['Nama Lengkap*'] ?? row['Nama Lengkap'] ?? row['Nama'] ?? row['nama'] ?? ''
    ).trim();

    const kelasRaw = String(
      row['Kelas (Rombel)*'] ?? row['Kelas'] ?? row['Rombel'] ?? row['kelas'] ?? ''
    ).trim();

    let email = String(
      row['Email'] ?? row['email'] ?? row['Alamat Email'] ?? ''
    ).trim();

    const jkRaw = String(
      row['Jenis Kelamin (L/P)'] ?? row['Jenis Kelamin'] ?? row['JK'] ?? ''
    ).trim().toUpperCase();
    const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';

    const telepon = String(
      row['No Telepon / WA'] ?? row['Telepon'] ?? row['No HP'] ?? row['telepon'] ?? ''
    ).trim();

    const alamat = String(row['Alamat'] ?? row['alamat'] ?? '').trim();

    // Validations
    if (!nis && !nama && !kelasRaw) {
      // Empty row, skip
      return;
    }

    if (!nis) {
      errors.push(`Baris ${rowNum}: NIS wajib diisi.`);
      return;
    }

    if (existingNisSet.has(nis)) {
      errors.push(`Baris ${rowNum}: NIS "${nis}" sudah terdaftar di sistem.`);
      return;
    }

    if (seenNisInBatch.has(nis)) {
      errors.push(`Baris ${rowNum}: NIS "${nis}" duplikat dalam file Excel ini.`);
      return;
    }

    if (!nama) {
      errors.push(`Baris ${rowNum}: Nama Siswa wajib diisi.`);
      return;
    }

    // Match class
    let matchedClass = classes.find(
      (c) => c.namaKelas.toLowerCase() === kelasRaw.toLowerCase()
    );

    if (!matchedClass && kelasRaw) {
      // Create flexible match (e.g. "XRPL1" or "X RPL 1")
      matchedClass = classes.find((c) =>
        c.namaKelas.replace(/\s+/g, '').toLowerCase() === kelasRaw.replace(/\s+/g, '').toLowerCase()
      );
    }

    if (!matchedClass) {
      // Fallback to first available class if exists
      matchedClass = classes[0];
    }

    // Default email if missing
    if (!email) {
      email = `siswa.${nis}@smk.belajar.id`;
    }

    seenNisInBatch.add(nis);

    valid.push({
      nis,
      nama,
      email,
      kelasId: matchedClass?.id || 'kelas-xrpl1',
      kelasNama: matchedClass?.namaKelas || kelasRaw || 'X RPL 1',
      telepon: telepon || '-',
      jenisKelamin,
      alamat,
      isValid: true,
    });
  });

  return { valid, errors };
}

/**
 * Parse raw row objects into typed teacher / walas items with validation
 */
export function parseTeacherRows(
  rawRows: any[],
  classes: Kelas[],
  existingNipSet: Set<string>
): { valid: ParsedTeacherRow[]; errors: string[] } {
  const valid: ParsedTeacherRow[] = [];
  const errors: string[] = [];
  const seenNipInBatch = new Set<string>();

  rawRows.forEach((row, idx) => {
    const rowNum = idx + 2;

    const nip = String(
      row['NIP / NUPTK*'] ?? row['NIP'] ?? row['NUPTK'] ?? row['nip'] ?? ''
    ).trim();

    const nama = String(
      row['Nama Lengkap & Gelar*'] ?? row['Nama Lengkap'] ?? row['Nama'] ?? row['nama'] ?? ''
    ).trim();

    let email = String(
      row['Email*'] ?? row['Email'] ?? row['email'] ?? ''
    ).trim();

    const mapel = String(
      row['Mata Pelajaran Pengampu*'] ?? row['Mata Pelajaran'] ?? row['Mapel'] ?? ''
    ).trim() || 'Guru Mata Pelajaran';

    const tugasRaw = String(
      row['Tugas Tambahan (Guru Mapel / Walas)*'] ?? row['Tugas Tambahan'] ?? row['Peran'] ?? ''
    ).trim().toLowerCase();

    const rombelRaw = String(
      row['Rombel Binaan (Jika Walas)'] ?? row['Kelas Binaan'] ?? row['Rombel'] ?? ''
    ).trim();

    const jkRaw = String(
      row['Jenis Kelamin (L/P)'] ?? row['Jenis Kelamin'] ?? row['JK'] ?? ''
    ).trim().toUpperCase();
    const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';

    const telepon = String(
      row['No Telepon / WA'] ?? row['Telepon'] ?? row['No HP'] ?? ''
    ).trim();

    if (!nip && !nama) {
      return;
    }

    if (!nip) {
      errors.push(`Baris ${rowNum}: NIP / NUPTK wajib diisi.`);
      return;
    }

    if (existingNipSet.has(nip)) {
      errors.push(`Baris ${rowNum}: NIP "${nip}" sudah terdaftar di sistem.`);
      return;
    }

    if (seenNipInBatch.has(nip)) {
      errors.push(`Baris ${rowNum}: NIP "${nip}" duplikat dalam file Excel ini.`);
      return;
    }

    if (!nama) {
      errors.push(`Baris ${rowNum}: Nama Guru wajib diisi.`);
      return;
    }

    if (!email) {
      email = `guru.${nip}@smk.belajar.id`;
    }

    const isWaliKelas = tugasRaw.includes('walas') || tugasRaw.includes('wali') || Boolean(rombelRaw);

    let matchedClass: Kelas | undefined;
    if (rombelRaw) {
      matchedClass = classes.find(
        (c) =>
          c.namaKelas.replace(/\s+/g, '').toLowerCase() ===
          rombelRaw.replace(/\s+/g, '').toLowerCase()
      );
    }

    seenNipInBatch.add(nip);

    valid.push({
      nip,
      nama,
      email,
      mapel,
      role: 'guru',
      isWaliKelas,
      waliKelasRombel: matchedClass?.namaKelas || rombelRaw || undefined,
      waliKelasId: matchedClass?.id || undefined,
      telepon: telepon || '-',
      jenisKelamin,
      isValid: true,
    });
  });

  return { valid, errors };
}
