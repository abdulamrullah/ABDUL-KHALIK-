import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { UserProfile, Absensi } from '../types';
import { calculateStudentStats, getStatusLabel } from './attendance';

export type ExportPeriodType = 'harian' | 'mingguan' | 'bulanan' | 'semester' | 'tahunan';

interface DailyAttendanceDetail {
  no: number;
  nis: string;
  nama: string;
  kelas: string;
  status: string;
  jam: string;
  keterangan: string;
  dicatatOleh: string;
}

interface WeeklyMatrixRow {
  no: number;
  nis: string;
  nama: string;
  senin: string;
  selasa: string;
  rabu: string;
  kamis: string;
  jumat: string;
  sabtu: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  persentase: string;
}

/**
 * Export data kehadiran kelas ke format Microsoft Excel (.xlsx) dengan struktur sesuai periode
 */
export function exportAttendanceToExcel(
  students: UserProfile[],
  attendances: Absensi[],
  kelasNama: string,
  periodeLabel: string,
  periodeJenis: ExportPeriodType = 'bulanan',
  extraOptions?: {
    dateList?: string[]; // untuk mingguan
    targetDate?: string; // untuk harian
  }
): void {
  const workbook = XLSX.utils.book_new();

  if (periodeJenis === 'harian') {
    // Mode Laporan Harian
    const targetDate = extraOptions?.targetDate || new Date().toISOString().split('T')[0];
    const dataRows = students.map((siswa, index) => {
      const rec = attendances.find((a) => a.siswaId === siswa.uid && a.tanggal === targetDate);
      const jam = rec ? new Date(rec.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-';
      return {
        No: index + 1,
        NIS: siswa.nis || '-',
        'Nama Siswa': siswa.nama,
        Kelas: kelasNama,
        Tanggal: targetDate,
        Status: rec ? getStatusLabel(rec.status) : 'Belum Dicatat',
        'Jam Masuk': jam,
        Keterangan: rec?.keterangan || '-',
        'Dicatat Oleh': rec?.dicatatOlehNama || 'Wali Kelas',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 14 },
      { wch: 14 }, { wch: 12 }, { wch: 30 }, { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, `Harian_${targetDate}`);
  } else if (periodeJenis === 'mingguan') {
    // Mode Laporan Mingguan Matrix (Senin s.d. Sabtu)
    const dates = extraOptions?.dateList || [];
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const dataRows = students.map((siswa, index) => {
      const studentRecs = attendances.filter((a) => a.siswaId === siswa.uid);
      const row: Record<string, string | number> = {
        No: index + 1,
        NIS: siswa.nis || '-',
        'Nama Siswa': siswa.nama,
        Kelas: kelasNama,
      };

      let h = 0, i = 0, s = 0, a = 0;
      dates.forEach((dStr, idx) => {
        const dName = dayNames[idx] || `Hari ${idx + 1}`;
        const match = studentRecs.find((r) => r.tanggal === dStr);
        if (match) {
          row[dName] = match.status === 'hadir' ? 'H' : match.status === 'izin' ? 'I' : match.status === 'sakit' ? 'S' : 'A';
          if (match.status === 'hadir') h++;
          else if (match.status === 'izin') i++;
          else if (match.status === 'sakit') s++;
          else a++;
        } else {
          row[dName] = '-';
        }
      });

      const total = h + i + s + a;
      const pct = total > 0 ? `${Math.round((h / total) * 100)}%` : '0%';

      row['Hadir (H)'] = h;
      row['Izin (I)'] = i;
      row['Sakit (S)'] = s;
      row['Alpha (A)'] = a;
      row['% Kehadiran'] = pct;

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    XLSX.utils.book_append_sheet(workbook, worksheet, `Mingguan`);
  } else {
    // Mode Bulanan / Semester / Tahunan
    const dataRows = students.map((siswa, index) => {
      const stats = calculateStudentStats(siswa.uid, attendances);
      const kelayakan =
        stats.persentaseHadir >= 85
          ? 'Memenuhi Syarat'
          : stats.persentaseHadir >= 75
          ? 'Perlu Perhatian'
          : 'Peringatan / Tidak Memenuhi';

      return {
        No: index + 1,
        NIS: siswa.nis || '-',
        'Nama Siswa': siswa.nama,
        Kelas: kelasNama,
        Periode: periodeLabel,
        'Hadir (H)': stats.hadir,
        'Izin (I)': stats.izin,
        'Sakit (S)': stats.sakit,
        'Alpha (A)': stats.alpha,
        'Total Hari': stats.totalHari,
        'Persentase Kehadiran': `${stats.persentaseHadir}%`,
        'Status Evaluasi': kelayakan,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    worksheet['!cols'] = [
      { wch: 5 }, { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 22 },
      { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
      { wch: 20 }, { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap_${periodeJenis}`);
  }

  const safePeriod = periodeLabel.replace(/[\/\s:]+/g, '_');
  const safeName = `Laporan_Absensi_${periodeJenis.toUpperCase()}_${kelasNama.replace(/\s+/g, '_')}_${safePeriod}.xlsx`;
  XLSX.writeFile(workbook, safeName);
}

/**
 * Export data kehadiran ke dokumen PDF profesional siap cetak dengan Kop Surat Resmi
 */
export function exportAttendanceToPdf(
  students: UserProfile[],
  attendances: Absensi[],
  kelasNama: string,
  periodeLabel: string,
  waliKelas: string = 'Budi Santoso, S.Kom., M.T.',
  periodeJenis: ExportPeriodType = 'bulanan',
  extraOptions?: {
    dateList?: string[];
    targetDate?: string;
  }
): void {
  const doc = new jsPDF({
    orientation: periodeJenis === 'mingguan' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isLandscape = periodeJenis === 'mingguan';
  const pageWidth = isLandscape ? 297 : 210;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const centerX = pageWidth / 2;

  // Header Sekolah Resmi (Kop Surat)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(26, 115, 232); // #1A73E8
  doc.text('SMK NEGERI INDONESIA HEBAT', centerX, 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Jl. Pendidikan No. 45, Kompleks Edukasi, Kota Cerdas | Telp: (021) 7891234', centerX, 21, { align: 'center' });
  doc.text('Email: info@smkindonesia.sch.id | Website: https://smkindonesia.sch.id', centerX, 25.5, { align: 'center' });

  // Garis Pembatas Kop Surat Ganda
  doc.setDrawColor(26, 115, 232);
  doc.setLineWidth(0.8);
  doc.line(marginX, 29, pageWidth - marginX, 29);
  doc.setLineWidth(0.2);
  doc.line(marginX, 30.5, pageWidth - marginX, 30.5);

  // Judul Laporan Spesifik Periode
  const periodTitles: Record<ExportPeriodType, string> = {
    harian: 'LAPORAN PRESENSI HARIAN SISWA',
    mingguan: 'LAPORAN REKAPITULASI PRESENSI MINGGUAN SISWA',
    bulanan: 'LAPORAN REKAPITULASI PRESENSI BULANAN SISWA',
    semester: 'LAPORAN EVALUASI PRESENSI SEMESTER SISWA',
    tahunan: 'LAPORAN EVALUASI & KELAYAKAN PRESENSI TAHUNAN',
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text(periodTitles[periodeJenis] || 'LAPORAN PRESENSI SISWA', centerX, 38, { align: 'center' });

  // Metadata Laporan
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kelas: ${kelasNama}`, marginX, 45);
  doc.text(`Periode: ${periodeLabel} (${periodeJenis.toUpperCase()})`, marginX, 50);
  doc.text(`Wali Kelas: ${waliKelas}`, pageWidth - 75, 45);
  doc.text(
    `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })}`,
    pageWidth - 75,
    50
  );

  let startY = 56;

  if (periodeJenis === 'harian') {
    // TABEL LAPORAN HARIAN
    const targetDate = extraOptions?.targetDate || new Date().toISOString().split('T')[0];

    // Table Header
    doc.setFillColor(26, 115, 232);
    doc.rect(marginX, startY, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('No', marginX + 2, startY + 5);
    doc.text('NIS', marginX + 11, startY + 5);
    doc.text('Nama Siswa', marginX + 32, startY + 5);
    doc.text('Status', marginX + 95, startY + 5);
    doc.text('Waktu', marginX + 118, startY + 5);
    doc.text('Keterangan / Catatan', marginX + 138, startY + 5);

    startY += 7.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    students.forEach((siswa, idx) => {
      const rec = attendances.find((a) => a.siswaId === siswa.uid && a.tanggal === targetDate);
      const isEven = idx % 2 === 0;

      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, startY, contentWidth, 6.5, 'F');
      }

      doc.setTextColor(40, 40, 40);
      doc.text(String(idx + 1), marginX + 2, startY + 4.5);
      doc.text(siswa.nis || '-', marginX + 11, startY + 4.5);

      const displayName = siswa.nama.length > 28 ? siswa.nama.substring(0, 26) + '...' : siswa.nama;
      doc.text(displayName, marginX + 32, startY + 4.5);

      // Status dengan warna
      const st = rec?.status;
      if (st === 'hadir') {
        doc.setTextColor(22, 101, 52); // Hadir
        doc.text('HADIR', marginX + 95, startY + 4.5);
      } else if (st === 'izin') {
        doc.setTextColor(180, 83, 9); // Izin
        doc.text('IZIN', marginX + 95, startY + 4.5);
      } else if (st === 'sakit') {
        doc.setTextColor(194, 65, 12); // Sakit
        doc.text('SAKIT', marginX + 95, startY + 4.5);
      } else if (st === 'alpha') {
        doc.setTextColor(185, 28, 28); // Alpha
        doc.text('ALPHA', marginX + 95, startY + 4.5);
      } else {
        doc.setTextColor(120, 120, 120);
        doc.text('BELUM ABSEN', marginX + 95, startY + 4.5);
      }

      doc.setTextColor(60, 60, 60);
      const timeStr = rec
        ? new Date(rec.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        : '-';
      doc.text(timeStr, marginX + 118, startY + 4.5);

      const ket = rec?.keterangan || '-';
      const displayKet = ket.length > 25 ? ket.substring(0, 23) + '..' : ket;
      doc.text(displayKet, marginX + 138, startY + 4.5);

      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, startY + 6.5, marginX + contentWidth, startY + 6.5);
      startY += 6.5;

      if (startY > 255) {
        doc.addPage();
        startY = 20;
      }
    });
  } else if (periodeJenis === 'mingguan') {
    // TABEL LAPORAN MINGGUAN (Landscape)
    const dates = extraOptions?.dateList || [];
    const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    doc.setFillColor(26, 115, 232);
    doc.rect(marginX, startY, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('No', marginX + 2, startY + 5);
    doc.text('NIS', marginX + 10, startY + 5);
    doc.text('Nama Siswa', marginX + 28, startY + 5);

    // Header Hari
    let dayX = marginX + 90;
    dayLabels.forEach((dName) => {
      doc.text(dName, dayX, startY + 5);
      dayX += 14;
    });

    doc.text('H', dayX + 4, startY + 5);
    doc.text('I', dayX + 14, startY + 5);
    doc.text('S', dayX + 24, startY + 5);
    doc.text('A', dayX + 34, startY + 5);
    doc.text('% Kehadiran', dayX + 48, startY + 5);

    startY += 7.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    students.forEach((siswa, idx) => {
      const studentRecs = attendances.filter((a) => a.siswaId === siswa.uid);
      const isEven = idx % 2 === 0;

      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, startY, contentWidth, 6.5, 'F');
      }

      doc.setTextColor(40, 40, 40);
      doc.text(String(idx + 1), marginX + 2, startY + 4.5);
      doc.text(siswa.nis || '-', marginX + 10, startY + 4.5);

      const displayName = siswa.nama.length > 25 ? siswa.nama.substring(0, 23) + '..' : siswa.nama;
      doc.text(displayName, marginX + 28, startY + 4.5);

      let h = 0, i = 0, s = 0, a = 0;
      let curX = marginX + 90;
      dates.forEach((dStr) => {
        const match = studentRecs.find((r) => r.tanggal === dStr);
        if (match) {
          const char = match.status === 'hadir' ? 'H' : match.status === 'izin' ? 'I' : match.status === 'sakit' ? 'S' : 'A';
          if (match.status === 'hadir') {
            doc.setTextColor(22, 101, 52);
            h++;
          } else if (match.status === 'izin') {
            doc.setTextColor(180, 83, 9);
            i++;
          } else if (match.status === 'sakit') {
            doc.setTextColor(194, 65, 12);
            s++;
          } else {
            doc.setTextColor(185, 28, 28);
            a++;
          }
          doc.text(char, curX + 2, startY + 4.5);
        } else {
          doc.setTextColor(150, 150, 150);
          doc.text('-', curX + 2, startY + 4.5);
        }
        curX += 14;
      });

      doc.setTextColor(22, 101, 52);
      doc.text(String(h), curX + 4, startY + 4.5);
      doc.setTextColor(180, 83, 9);
      doc.text(String(i), curX + 14, startY + 4.5);
      doc.setTextColor(194, 65, 12);
      doc.text(String(s), curX + 24, startY + 4.5);
      doc.setTextColor(185, 28, 28);
      doc.text(String(a), curX + 34, startY + 4.5);

      const total = h + i + s + a;
      const pct = total > 0 ? Math.round((h / total) * 100) : 0;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 115, 232);
      doc.text(`${pct}%`, curX + 50, startY + 4.5);
      doc.setFont('helvetica', 'normal');

      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, startY + 6.5, marginX + contentWidth, startY + 6.5);
      startY += 6.5;

      if (startY > 175) {
        doc.addPage();
        startY = 20;
      }
    });
  } else {
    // TABEL LAPORAN BULANAN / SEMESTER / TAHUNAN
    doc.setFillColor(26, 115, 232);
    doc.rect(marginX, startY, contentWidth, 7.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('No', marginX + 2, startY + 5);
    doc.text('NIS', marginX + 11, startY + 5);
    doc.text('Nama Siswa', marginX + 32, startY + 5);
    doc.text('H', marginX + 96, startY + 5);
    doc.text('I', marginX + 109, startY + 5);
    doc.text('S', marginX + 122, startY + 5);
    doc.text('A', marginX + 135, startY + 5);
    doc.text('Total', marginX + 148, startY + 5);
    doc.text('% Kehadiran', marginX + 162, startY + 5);

    startY += 7.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    students.forEach((siswa, idx) => {
      const stats = calculateStudentStats(siswa.uid, attendances);
      const isEven = idx % 2 === 0;

      if (isEven) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, startY, contentWidth, 6.5, 'F');
      }

      doc.setTextColor(40, 40, 40);
      doc.text(String(idx + 1), marginX + 2, startY + 4.5);
      doc.text(siswa.nis || '-', marginX + 11, startY + 4.5);

      const displayName = siswa.nama.length > 28 ? siswa.nama.substring(0, 26) + '...' : siswa.nama;
      doc.text(displayName, marginX + 32, startY + 4.5);

      doc.setTextColor(22, 101, 52); // H
      doc.text(String(stats.hadir), marginX + 96, startY + 4.5);

      doc.setTextColor(180, 83, 9); // I
      doc.text(String(stats.izin), marginX + 109, startY + 4.5);

      doc.setTextColor(194, 65, 12); // S
      doc.text(String(stats.sakit), marginX + 122, startY + 4.5);

      doc.setTextColor(185, 28, 28); // A
      doc.text(String(stats.alpha), marginX + 135, startY + 4.5);

      doc.setTextColor(60, 60, 60);
      doc.text(String(stats.totalHari), marginX + 148, startY + 4.5);

      // Persentase
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(stats.persentaseHadir >= 85 ? 22 : 185, stats.persentaseHadir >= 85 ? 101 : 28, stats.persentaseHadir >= 85 ? 52 : 28);
      doc.text(`${stats.persentaseHadir}%`, marginX + 164, startY + 4.5);
      doc.setFont('helvetica', 'normal');

      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, startY + 6.5, marginX + contentWidth, startY + 6.5);
      startY += 6.5;

      if (startY > 255) {
        doc.addPage();
        startY = 20;
      }
    });
  }

  // Tanda Tangan Resmi
  const signY = isLandscape ? Math.min(startY + 12, 170) : Math.min(startY + 15, 245);
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(8.5);

  const leftSignX = marginX + 15;
  const rightSignX = pageWidth - marginX - 55;

  doc.text('Mengetahui,', leftSignX, signY);
  doc.text('Kepala Sekolah', leftSignX, signY + 4.5);
  doc.text('Wali Kelas', rightSignX, signY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Drs. H. Mulyono, M.Pd.', leftSignX, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text('NIP. 197005121998021001', leftSignX, signY + 27);

  doc.setFont('helvetica', 'bold');
  doc.text(waliKelas, rightSignX, signY + 23);
  doc.setFont('helvetica', 'normal');
  doc.text('NIP. 198507202010011003', rightSignX, signY + 27);

  const safePeriod = periodeLabel.replace(/[\/\s:]+/g, '_');
  const safeName = `Laporan_Absensi_${periodeJenis.toUpperCase()}_${kelasNama.replace(/\s+/g, '_')}_${safePeriod}.pdf`;
  doc.save(safeName);
}
