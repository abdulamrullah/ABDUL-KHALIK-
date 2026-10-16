export type UserRole = 'admin' | 'guru' | 'siswa';

export interface UserProfile {
  uid: string;
  nama: string;
  email: string;
  role: UserRole;
  kelasId?: string; // Untuk siswa
  kelasNama?: string;
  nis?: string; // Nomor Induk Siswa
  nip?: string; // Nomor Induk Pegawai (untuk guru)
  fotoUrl: string;
  telepon?: string;
  isWaliKelas?: boolean; // Menandakan apakah guru tersebut adalah wali kelas
  waliKelasRombel?: string; // Nama rombel binaan (e.g. "X RPL 1")
  mapel?: string; // Mata pelajaran pengampu (e.g. "Basis Data")
  jenisKelamin?: 'L' | 'P';
  alamat?: string;
  createdAt: string;
}

export interface Kelas {
  id: string;
  namaKelas: string; // e.g. "X RPL 1"
  tahunAjaran: string; // e.g. "2024/2025"
  waliKelasId: string;
  waliKelasNama: string;
  jurusan: string;
  ruang?: string;
  totalSiswa?: number;
}

export interface Absensi {
  id: string;
  siswaId: string;
  siswaNama?: string;
  siswaNis?: string;
  kelasId: string;
  kelasNama?: string;
  tanggal: string; // YYYY-MM-DD
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  keterangan?: string;
  dicatatOleh: string; // ID Guru / Admin
  dicatatOlehNama?: string;
  timestamp: string; // ISO 8601
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'absensi' | 'info' | 'peringatan';
}
