import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendancePercentage,
  calculateStudentStats,
  calculateClassDayStats,
  getStatusLabel,
  filterRecordsByPeriod,
} from './attendance.ts';
import type { AttendanceRecord } from './attendance.ts';

test('calculateAttendancePercentage handles zero total gracefully', () => {
  const result = calculateAttendancePercentage({ hadir: 0, izin: 0, sakit: 0, alpha: 0 });
  assert.equal(result, 0);
});

test('calculateAttendancePercentage calculates correct percentage', () => {
  // 18 hadir, 1 izin, 1 sakit, 0 alpha -> 18/20 = 90%
  const result = calculateAttendancePercentage({ hadir: 18, izin: 1, sakit: 1, alpha: 0 });
  assert.equal(result, 90);
});

test('calculateStudentStats aggregates records correctly for student', () => {
  const dummyRecords: AttendanceRecord[] = [
    {
      id: 'att-1',
      siswaId: 'student-1',
      kelasId: 'class-1',
      tanggal: '2026-10-01',
      status: 'hadir',
      dicatatOleh: 'guru-1',
      timestamp: '2026-10-01T07:30:00Z',
    },
    {
      id: 'att-2',
      siswaId: 'student-1',
      kelasId: 'class-1',
      tanggal: '2026-10-02',
      status: 'hadir',
      dicatatOleh: 'guru-1',
      timestamp: '2026-10-02T07:30:00Z',
    },
    {
      id: 'att-3',
      siswaId: 'student-1',
      kelasId: 'class-1',
      tanggal: '2026-10-03',
      status: 'izin',
      keterangan: 'Acara keluarga',
      dicatatOleh: 'guru-1',
      timestamp: '2026-10-03T07:30:00Z',
    },
    {
      id: 'att-4',
      siswaId: 'student-1',
      kelasId: 'class-1',
      tanggal: '2026-10-04',
      status: 'sakit',
      dicatatOleh: 'guru-1',
      timestamp: '2026-10-04T07:30:00Z',
    },
    {
      id: 'att-5',
      siswaId: 'student-2', // other student
      kelasId: 'class-1',
      tanggal: '2026-10-01',
      status: 'hadir',
      dicatatOleh: 'guru-1',
      timestamp: '2026-10-01T07:30:00Z',
    },
  ];

  const stats = calculateStudentStats('student-1', dummyRecords);
  assert.equal(stats.totalHari, 4);
  assert.equal(stats.hadir, 2);
  assert.equal(stats.izin, 1);
  assert.equal(stats.sakit, 1);
  assert.equal(stats.alpha, 0);
  assert.equal(stats.persentaseHadir, 50); // 2 out of 4 = 50%
});

test('calculateClassDayStats computes class daily breakdown', () => {
  const recordsForDate: AttendanceRecord[] = [
    {
      id: 'a1',
      siswaId: 's1',
      kelasId: 'k1',
      tanggal: '2026-10-15',
      status: 'hadir',
      dicatatOleh: 'g1',
      timestamp: '2026-10-15T07:00:00Z',
    },
    {
      id: 'a2',
      siswaId: 's2',
      kelasId: 'k1',
      tanggal: '2026-10-15',
      status: 'hadir',
      dicatatOleh: 'g1',
      timestamp: '2026-10-15T07:00:00Z',
    },
    {
      id: 'a3',
      siswaId: 's3',
      kelasId: 'k1',
      tanggal: '2026-10-15',
      status: 'izin',
      dicatatOleh: 'g1',
      timestamp: '2026-10-15T07:00:00Z',
    },
    {
      id: 'a4',
      siswaId: 's4',
      kelasId: 'k1',
      tanggal: '2026-10-15',
      status: 'alpha',
      dicatatOleh: 'g1',
      timestamp: '2026-10-15T07:00:00Z',
    },
  ];

  const classDay = calculateClassDayStats(5, recordsForDate);
  assert.equal(classDay.totalSiswa, 5);
  assert.equal(classDay.totalHadir, 2);
  assert.equal(classDay.totalIzin, 1);
  assert.equal(classDay.totalSakit, 0);
  assert.equal(classDay.totalAlpha, 1);
  assert.equal(classDay.belumAbsen, 1);
  assert.equal(classDay.persentaseKehadiran, 40); // 2 / 5 = 40%
});

test('filterRecordsByPeriod correctly filters harian, mingguan, bulanan, semester, and tahunan', () => {
  const sampleRecords: AttendanceRecord[] = [
    {
      id: 'r1',
      siswaId: 's1',
      kelasId: 'k1',
      tanggal: '2024-08-10', // Semester Ganjil 2024/2025
      status: 'hadir',
      dicatatOleh: 'g1',
      timestamp: '2024-08-10T07:00:00Z',
    },
    {
      id: 'r2',
      siswaId: 's1',
      kelasId: 'k1',
      tanggal: '2024-10-15', // Semester Ganjil 2024/2025
      status: 'hadir',
      dicatatOleh: 'g1',
      timestamp: '2024-10-15T07:00:00Z',
    },
    {
      id: 'r3',
      siswaId: 's1',
      kelasId: 'k1',
      tanggal: '2025-02-20', // Semester Genap 2024/2025
      status: 'izin',
      dicatatOleh: 'g1',
      timestamp: '2025-02-20T07:00:00Z',
    },
    {
      id: 'r4',
      siswaId: 's1',
      kelasId: 'k1',
      tanggal: '2025-09-01', // Tahun Ajaran 2025/2026
      status: 'hadir',
      dicatatOleh: 'g1',
      timestamp: '2025-09-01T07:00:00Z',
    },
  ];

  // Test Harian
  const harian = filterRecordsByPeriod(sampleRecords, {
    periodType: 'harian',
    date: '2024-10-15',
  });
  assert.equal(harian.length, 1);
  assert.equal(harian[0].id, 'r2');

  // Test Mingguan
  const mingguan = filterRecordsByPeriod(sampleRecords, {
    periodType: 'mingguan',
    startDate: '2024-10-01',
    endDate: '2024-10-31',
  });
  assert.equal(mingguan.length, 1);
  assert.equal(mingguan[0].id, 'r2');

  // Test Bulanan
  const bulanan = filterRecordsByPeriod(sampleRecords, {
    periodType: 'bulanan',
    yearMonth: '2024-10',
  });
  assert.equal(bulanan.length, 1);

  // Test Semester Ganjil 2024/2025
  const semGanjil = filterRecordsByPeriod(sampleRecords, {
    periodType: 'semester',
    semester: 'ganjil',
    tahunAjaran: '2024/2025',
  });
  assert.equal(semGanjil.length, 2); // r1 & r2

  // Test Semester Genap 2024/2025
  const semGenap = filterRecordsByPeriod(sampleRecords, {
    periodType: 'semester',
    semester: 'genap',
    tahunAjaran: '2024/2025',
  });
  assert.equal(semGenap.length, 1); // r3

  // Test Tahunan 2024/2025 (Juli 2024 - Juni 2025)
  const tahunan = filterRecordsByPeriod(sampleRecords, {
    periodType: 'tahunan',
    tahunAjaran: '2024/2025',
  });
  assert.equal(tahunan.length, 3); // r1, r2, r3
});
