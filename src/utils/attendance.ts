export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpha';

export interface AttendanceRecord {
  id: string;
  siswaId: string;
  kelasId: string;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  keterangan?: string;
  dicatatOleh: string;
  timestamp: string;
}

export interface StudentStats {
  totalHari: number;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  persentaseHadir: number;
}

export interface ClassDayStats {
  totalSiswa: number;
  totalHadir: number;
  totalIzin: number;
  totalSakit: number;
  totalAlpha: number;
  belumAbsen: number;
  persentaseKehadiran: number;
}

export type ReportPeriodType = 'harian' | 'mingguan' | 'bulanan' | 'semester' | 'tahunan';

export interface PeriodFilterOptions {
  periodType: ReportPeriodType;
  date?: string; // YYYY-MM-DD (untuk Harian)
  startDate?: string; // YYYY-MM-DD (untuk Mingguan)
  endDate?: string; // YYYY-MM-DD (untuk Mingguan)
  yearMonth?: string; // YYYY-MM (untuk Bulanan)
  semester?: 'ganjil' | 'genap'; // ganjil (Jul-Des) | genap (Jan-Jun)
  tahunAjaran?: string; // e.g. "2024/2025" atau "2026/2027"
}

/**
 * Filter data absensi berdasarkan periode laporan:
 * - Harian: 1 hari spesifik
 * - Mingguan: rentang 7 hari / hari kerja
 * - Bulanan: 1 bulan kalender penuh
 * - Semester: Semester Ganjil (Juli-Desember) atau Genap (Januari-Juni)
 * - Tahunan: 1 Tahun Ajaran penuh (Juli tahun N s.d. Juni tahun N+1)
 */
export function filterRecordsByPeriod(
  records: AttendanceRecord[],
  options: PeriodFilterOptions
): AttendanceRecord[] {
  const { periodType } = options;

  switch (periodType) {
    case 'harian': {
      const target = options.date || new Date().toISOString().split('T')[0];
      return records.filter((r) => r.tanggal === target);
    }

    case 'mingguan': {
      const start = options.startDate;
      const end = options.endDate;
      if (!start || !end) return records;
      return records.filter((r) => r.tanggal >= start && r.tanggal <= end);
    }

    case 'bulanan': {
      const ym = options.yearMonth || new Date().toISOString().substring(0, 7);
      return records.filter((r) => r.tanggal.startsWith(ym));
    }

    case 'semester': {
      const sem = options.semester || 'ganjil';
      const ta = options.tahunAjaran || '2024/2025';
      const [startYearStr, endYearStr] = ta.split('/');
      const startYear = parseInt(startYearStr, 10) || 2024;
      const endYear = parseInt(endYearStr, 10) || startYear + 1;

      return records.filter((r) => {
        const parts = r.tanggal.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);

        if (sem === 'ganjil') {
          // Juli s.d. Desember pada tahun ajaran awal
          return year === startYear && month >= 7 && month <= 12;
        } else {
          // Januari s.d. Juni pada tahun ajaran akhir
          return year === endYear && month >= 1 && month <= 6;
        }
      });
    }

    case 'tahunan': {
      const ta = options.tahunAjaran || '2024/2025';
      const [startYearStr, endYearStr] = ta.split('/');
      const startYear = parseInt(startYearStr, 10) || 2024;
      const endYear = parseInt(endYearStr, 10) || startYear + 1;

      return records.filter((r) => {
        const parts = r.tanggal.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);

        // Juli tahun awal s.d. Juni tahun akhir
        const isFirstHalf = year === startYear && month >= 7 && month <= 12;
        const isSecondHalf = year === endYear && month >= 1 && month <= 6;
        return isFirstHalf || isSecondHalf;
      });
    }

    default:
      return records;
  }
}

/**
 * Menghitung persentase kehadiran siswa
 * Rumus: (Hadir / (Hadir + Izin + Sakit + Alpha)) * 100
 */
export function calculateAttendancePercentage(stats: {
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}): number {
  const total = stats.hadir + stats.izin + stats.sakit + stats.alpha;
  if (total === 0) return 0;
  return Math.round((stats.hadir / total) * 100);
}

/**
 * Menghitung statistik kehadiran untuk seorang siswa
 */
export function calculateStudentStats(
  studentId: string,
  records: AttendanceRecord[]
): StudentStats {
  const studentRecords = records.filter((r) => r.siswaId === studentId);
  const hadir = studentRecords.filter((r) => r.status === 'hadir').length;
  const izin = studentRecords.filter((r) => r.status === 'izin').length;
  const sakit = studentRecords.filter((r) => r.status === 'sakit').length;
  const alpha = studentRecords.filter((r) => r.status === 'alpha').length;
  const totalHari = hadir + izin + sakit + alpha;

  const persentaseHadir = calculateAttendancePercentage({
    hadir,
    izin,
    sakit,
    alpha,
  });

  return {
    totalHari,
    hadir,
    izin,
    sakit,
    alpha,
    persentaseHadir,
  };
}

/**
 * Menghitung rekap harian untuk kelas pada tanggal tertentu
 */
export function calculateClassDayStats(
  totalStudentsInClass: number,
  classRecordsForDate: AttendanceRecord[]
): ClassDayStats {
  const hadir = classRecordsForDate.filter((r) => r.status === 'hadir').length;
  const izin = classRecordsForDate.filter((r) => r.status === 'izin').length;
  const sakit = classRecordsForDate.filter((r) => r.status === 'sakit').length;
  const alpha = classRecordsForDate.filter((r) => r.status === 'alpha').length;
  const sudahAbsen = hadir + izin + sakit + alpha;
  const belumAbsen = Math.max(0, totalStudentsInClass - sudahAbsen);

  const persentaseKehadiran =
    totalStudentsInClass > 0
      ? Math.round((hadir / totalStudentsInClass) * 100)
      : 0;

  return {
    totalSiswa: totalStudentsInClass,
    totalHadir: hadir,
    totalIzin: izin,
    totalSakit: sakit,
    totalAlpha: alpha,
    belumAbsen,
    persentaseKehadiran,
  };
}

/**
 * Memformat status menjadi teks bahasa Indonesia yang rapi
 */
export function getStatusLabel(status: AttendanceStatus): string {
  switch (status) {
    case 'hadir':
      return 'Hadir';
    case 'izin':
      return 'Izin';
    case 'sakit':
      return 'Sakit';
    case 'alpha':
      return 'Alpha';
    default:
      return status;
  }
}

/**
 * Warna standar Material 3 sesuai spesifikasi
 * Hijau = Hadir (#22C55E / #16A34A)
 * Kuning = Izin (#EAB308 / #CA8A04)
 * Oranye = Sakit (#F97316 / #EA580C)
 * Merah = Alpha (#EF4444 / #DC2626)
 */
export function getStatusColor(status: AttendanceStatus): {
  bg: string;
  text: string;
  border: string;
  hex: string;
} {
  switch (status) {
    case 'hadir':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-800',
        hex: '#16A34A',
      };
    case 'izin':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-800',
        hex: '#D97706',
      };
    case 'sakit':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-300 dark:border-orange-800',
        hex: '#EA580C',
      };
    case 'alpha':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-300 dark:border-rose-800',
        hex: '#DC2626',
      };
  }
}
