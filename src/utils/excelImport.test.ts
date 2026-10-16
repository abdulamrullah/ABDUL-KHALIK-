import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createStudentTemplateWorkbook,
  createTeacherTemplateWorkbook,
  parseStudentRows,
  parseTeacherRows,
} from './excelImport.ts';
import type { Kelas } from '../types.ts';

const mockClasses: Kelas[] = [
  {
    id: 'kelas-xrpl1',
    namaKelas: 'X RPL 1',
    tahunAjaran: '2024/2025',
    waliKelasId: 'guru-001',
    waliKelasNama: 'Budi Santoso',
    jurusan: 'RPL',
  },
  {
    id: 'kelas-xrpl2',
    namaKelas: 'X RPL 2',
    tahunAjaran: '2024/2025',
    waliKelasId: 'guru-002',
    waliKelasNama: 'Siti Rahmawati',
    jurusan: 'RPL',
  },
];

test('createStudentTemplateWorkbook creates workbook with Data_Murid and Petunjuk sheets', () => {
  const wb = createStudentTemplateWorkbook();
  assert.ok(wb.SheetNames.includes('Data_Murid'));
  assert.ok(wb.SheetNames.includes('Petunjuk'));
});

test('createTeacherTemplateWorkbook creates workbook with Data_Guru_Walas and Petunjuk sheets', () => {
  const wb = createTeacherTemplateWorkbook();
  assert.ok(wb.SheetNames.includes('Data_Guru_Walas'));
  assert.ok(wb.SheetNames.includes('Petunjuk'));
});

test('parseStudentRows validates required NIS and handles duplicate detection', () => {
  const existingNis = new Set(['20240101']);
  const rawRows = [
    {
      'NIS*': '20240101', // already exists
      'Nama Lengkap*': 'Siswa Duplikat',
      'Kelas (Rombel)*': 'X RPL 1',
    },
    {
      'NIS*': '20240999',
      'Nama Lengkap*': 'Siswa Sukses',
      'Kelas (Rombel)*': 'X RPL 1',
      'Email': 'sukses@smk.belajar.id',
    },
    {
      'NIS*': '', // missing NIS
      'Nama Lengkap*': 'Tanpa NIS',
      'Kelas (Rombel)*': 'X RPL 2',
    },
  ];

  const result = parseStudentRows(rawRows, mockClasses, existingNis);
  assert.equal(result.valid.length, 1);
  assert.equal(result.valid[0].nis, '20240999');
  assert.equal(result.valid[0].nama, 'Siswa Sukses');
  assert.equal(result.valid[0].kelasId, 'kelas-xrpl1');
  assert.equal(result.errors.length, 2);
});

test('parseTeacherRows parses Walas assignment and role properly', () => {
  const existingNip = new Set(['19850101']);
  const rawRows = [
    {
      'NIP / NUPTK*': '19900202',
      'Nama Lengkap & Gelar*': 'Bu Ratna, M.Pd.',
      'Email*': 'ratna@smk.belajar.id',
      'Mata Pelajaran Pengampu*': 'Bahasa Indonesia',
      'Tugas Tambahan (Guru Mapel / Walas)*': 'Walas',
      'Rombel Binaan (Jika Walas)': 'X RPL 2',
    },
  ];

  const result = parseTeacherRows(rawRows, mockClasses, existingNip);
  assert.equal(result.valid.length, 1);
  assert.equal(result.valid[0].isWaliKelas, true);
  assert.equal(result.valid[0].waliKelasRombel, 'X RPL 2');
  assert.equal(result.valid[0].waliKelasId, 'kelas-xrpl2');
  assert.equal(result.errors.length, 0);
});
