import { UserProfile, Kelas, Absensi } from '../types';

export const INITIAL_TEACHERS: UserProfile[] = [
  {
    uid: 'guru-001',
    nama: 'Budi Santoso, S.Kom., M.T.',
    email: 'guru@smk.belajar.id',
    role: 'admin',
    nip: '198507202010011003',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    telepon: '081234567890',
    isWaliKelas: true,
    waliKelasRombel: 'X RPL 1',
    mapel: 'Pemrograman Web & Perangkat Bergerak',
    jenisKelamin: 'L',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    uid: 'guru-002',
    nama: 'Siti Rahmawati, S.Pd.',
    email: 'siti.rahma@smk.belajar.id',
    role: 'guru',
    nip: '199003152014022001',
    fotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    telepon: '081398765432',
    isWaliKelas: true,
    waliKelasRombel: 'X RPL 2',
    mapel: 'Basis Data & Pemodelan Perangkat Lunak',
    jenisKelamin: 'P',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    uid: 'guru-003',
    nama: 'Drs. Hendro Wibowo, M.Kom.',
    email: 'hendro.wibowo@smk.belajar.id',
    role: 'guru',
    nip: '198205142008011005',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    telepon: '081298761234',
    isWaliKelas: false,
    mapel: 'Dasar-Dasar Kejuruan RPL & Jaringan',
    jenisKelamin: 'L',
    createdAt: '2024-01-10T08:00:00Z',
  },
];

export const INITIAL_CLASSES: Kelas[] = [
  {
    id: 'kelas-xrpl1',
    namaKelas: 'X RPL 1',
    tahunAjaran: '2024/2025',
    waliKelasId: 'guru-001',
    waliKelasNama: 'Budi Santoso, S.Kom., M.T.',
    jurusan: 'Rekayasa Perangkat Lunak',
    ruang: 'Lab RPL A',
  },
  {
    id: 'kelas-xrpl2',
    namaKelas: 'X RPL 2',
    tahunAjaran: '2024/2025',
    waliKelasId: 'guru-002',
    waliKelasNama: 'Siti Rahmawati, S.Pd.',
    jurusan: 'Rekayasa Perangkat Lunak',
    ruang: 'Lab RPL B',
  },
  {
    id: 'kelas-xitkj1',
    namaKelas: 'XI TKJ 1',
    tahunAjaran: '2024/2025',
    waliKelasId: 'guru-001',
    waliKelasNama: 'Budi Santoso, S.Kom., M.T.',
    jurusan: 'Teknik Komputer & Jaringan',
    ruang: 'Lab Jaringan 1',
  },
];

export const INITIAL_STUDENTS: UserProfile[] = [
  {
    uid: 'siswa-001',
    nama: 'Ahmad Fauzan Pratama',
    email: 'siswa1@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl1',
    kelasNama: 'X RPL 1',
    nis: '20240101',
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112233',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-002',
    nama: 'Nabila Azzahra Putri',
    email: 'nabila@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl1',
    kelasNama: 'X RPL 1',
    nis: '20240102',
    fotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112234',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-003',
    nama: 'Dimas Aditya Saputra',
    email: 'dimas@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl1',
    kelasNama: 'X RPL 1',
    nis: '20240103',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112235',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-004',
    nama: 'Cantika Dewi Lestari',
    email: 'cantika@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl1',
    kelasNama: 'X RPL 1',
    nis: '20240104',
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112236',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-005',
    nama: 'Muhammad Rizky Kurniawan',
    email: 'rizky@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl1',
    kelasNama: 'X RPL 1',
    nis: '20240105',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112237',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-006',
    nama: 'Salma Nur Azizah',
    email: 'salma@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl1',
    kelasNama: 'X RPL 1',
    nis: '20240106',
    fotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112238',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-007',
    nama: 'Bagas Wahyu Hidayat',
    email: 'bagas@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl2',
    kelasNama: 'X RPL 2',
    nis: '20240201',
    fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112239',
    createdAt: '2024-07-15T08:00:00Z',
  },
  {
    uid: 'siswa-008',
    nama: 'Tiara Indah Permata',
    email: 'tiara@smk.belajar.id',
    role: 'siswa',
    kelasId: 'kelas-xrpl2',
    kelasNama: 'X RPL 2',
    nis: '20240202',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    telepon: '082100112240',
    createdAt: '2024-07-15T08:00:00Z',
  },
];

// Helper to generate realistic seed attendance across multiple weeks, months, and semesters
export function generateSeedAttendances(): Absensi[] {
  const records: Absensi[] = [];
  const today = new Date();

  // Create attendance records for the past 60 days to cover Harian, Mingguan, Bulanan, and Semester
  for (let d = 50; d >= 0; d--) {
    const targetDate = new Date();
    targetDate.setDate(today.getDate() - d);

    // Skip Sunday (0). Keep Monday-Saturday as standard Indonesian school days
    const dayOfWeek = targetDate.getDay();
    if (dayOfWeek === 0) continue;

    const dateStr = targetDate.toISOString().split('T')[0];

    INITIAL_STUDENTS.forEach((student, index) => {
      // Deterministic realistic variation
      let status: 'hadir' | 'izin' | 'sakit' | 'alpha' = 'hadir';
      let keterangan = '';

      if ((index * 7 + d) % 19 === 0) {
        status = 'sakit';
        keterangan = 'Demam dan flu (surat dokter)';
      } else if ((index * 5 + d) % 23 === 0) {
        status = 'izin';
        keterangan = 'Acara keluarga / surat izin orang tua';
      } else if ((index * 13 + d) % 37 === 0) {
        status = 'alpha';
        keterangan = 'Tanpa keterangan resmi';
      }

      records.push({
        id: `att-${dateStr}-${student.uid}`,
        siswaId: student.uid,
        siswaNama: student.nama,
        siswaNis: student.nis,
        kelasId: student.kelasId || 'kelas-xrpl1',
        kelasNama: student.kelasNama || 'X RPL 1',
        tanggal: dateStr,
        status,
        keterangan,
        dicatatOleh: 'guru-001',
        dicatatOlehNama: 'Budi Santoso, S.Kom., M.T.',
        timestamp: `${dateStr}T07:${15 + (index % 15)}:00Z`,
      });
    });
  }

  return records;
}
