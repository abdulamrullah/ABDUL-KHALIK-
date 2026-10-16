import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Filter,
  Calendar,
  BarChart3,
  TrendingUp,
  Search,
  CheckCircle2,
  Clock,
  HeartPulse,
  XCircle,
  CalendarDays,
  CalendarRange,
  GraduationCap,
  Award,
  AlertTriangle,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import { UserProfile, Kelas, Absensi } from '../../types';
import {
  calculateStudentStats,
  filterRecordsByPeriod,
  getStatusColor,
  getStatusLabel,
  ReportPeriodType,
} from '../../utils/attendance';
import { exportAttendanceToExcel, exportAttendanceToPdf, ExportPeriodType } from '../../utils/exportHelpers';

interface LaporanStatistikProps {
  classes: Kelas[];
  students: UserProfile[];
  attendances: Absensi[];
}

export const LaporanStatistik: React.FC<LaporanStatistikProps> = ({
  classes,
  students,
  attendances,
}) => {
  // Period Mode State: 'harian' | 'mingguan' | 'bulanan' | 'semester' | 'tahunan'
  const [periodType, setPeriodType] = useState<ReportPeriodType>('harian');

  // Filter States
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingType, setExportingType] = useState<'excel' | 'pdf' | null>(null);

  // Period specific filter controls
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(todayStr);
  const [dailyStatusFilter, setDailyStatusFilter] = useState<string>('all');

  // Weekly filters: calculate Monday of current week
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  // Monthly filters
  const [selectedMonth, setSelectedMonth] = useState<string>(() => todayStr.substring(0, 7));

  // Semester filters
  const [selectedSemester, setSelectedSemester] = useState<'ganjil' | 'genap'>('ganjil');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState<string>('2024/2025');

  // Current selected class & students
  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const classStudents = useMemo(() => {
    return students.filter((s) => s.kelasId === selectedClassId);
  }, [students, selectedClassId]);

  // Compute 6 school days for weekly report (Mon - Sat)
  const weekDays = useMemo(() => {
    const dates: { dateStr: string; label: string; shortDate: string }[] = [];
    const base = new Date(selectedWeekStart);
    const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = 0; i < 6; i++) {
      const cur = new Date(base);
      cur.setDate(base.getDate() + i);
      const str = cur.toISOString().split('T')[0];
      const short = cur.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      dates.push({
        dateStr: str,
        label: dayNames[i],
        shortDate: short,
      });
    }
    return dates;
  }, [selectedWeekStart]);

  const weekEndDate = weekDays[weekDays.length - 1]?.dateStr || selectedWeekStart;

  // Filter attendances based on active period
  const filteredAttendances = useMemo(() => {
    const classRecords = attendances.filter((a) => a.kelasId === selectedClassId);

    return filterRecordsByPeriod(classRecords, {
      periodType,
      date: selectedDailyDate,
      startDate: selectedWeekStart,
      endDate: weekEndDate,
      yearMonth: selectedMonth,
      semester: selectedSemester,
      tahunAjaran: selectedTahunAjaran,
    });
  }, [
    attendances,
    selectedClassId,
    periodType,
    selectedDailyDate,
    selectedWeekStart,
    weekEndDate,
    selectedMonth,
    selectedSemester,
    selectedTahunAjaran,
  ]);

  // Dynamic period label for header & export
  const periodLabel = useMemo(() => {
    switch (periodType) {
      case 'harian':
        return new Date(selectedDailyDate).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
      case 'mingguan':
        return `${weekDays[0]?.shortDate || ''} - ${weekDays[weekDays.length - 1]?.shortDate || ''} (${selectedTahunAjaran})`;
      case 'bulanan':
        return new Date(`${selectedMonth}-01`).toLocaleDateString('id-ID', {
          month: 'long',
          year: 'numeric',
        });
      case 'semester':
        return `${selectedSemester === 'ganjil' ? 'Semester 1 (Ganjil)' : 'Semester 2 (Genap)'} T.A. ${selectedTahunAjaran}`;
      case 'tahunan':
        return `Tahun Ajaran Penuh ${selectedTahunAjaran}`;
    }
  }, [periodType, selectedDailyDate, weekDays, selectedTahunAjaran, selectedMonth, selectedSemester]);

  // Student report calculations for aggregate modes
  const studentReports = useMemo(() => {
    return classStudents.map((s) => {
      const stats = calculateStudentStats(s.uid, filteredAttendances);
      return {
        student: s,
        ...stats,
      };
    });
  }, [classStudents, filteredAttendances]);

  // KPI Calculations
  const kpiStats = useMemo(() => {
    const totalSiswa = classStudents.length;

    if (periodType === 'harian') {
      const todayRecords = filteredAttendances;
      const hadir = todayRecords.filter((a) => a.status === 'hadir').length;
      const izin = todayRecords.filter((a) => a.status === 'izin').length;
      const sakit = todayRecords.filter((a) => a.status === 'sakit').length;
      const alpha = todayRecords.filter((a) => a.status === 'alpha').length;
      const belumAbsen = Math.max(0, totalSiswa - (hadir + izin + sakit + alpha));
      const pct = totalSiswa > 0 ? Math.round((hadir / totalSiswa) * 100) : 0;

      return {
        avgRate: pct,
        totalHadir: hadir,
        totalIzin: izin,
        totalSakit: sakit,
        totalAlpha: alpha,
        belumAbsen,
        totalDays: 1,
      };
    } else {
      const avgRate =
        studentReports.length > 0
          ? Math.round(studentReports.reduce((acc, c) => acc + c.persentaseHadir, 0) / studentReports.length)
          : 0;
      const totalHadir = studentReports.reduce((a, b) => a + b.hadir, 0);
      const totalIzin = studentReports.reduce((a, b) => a + b.izin, 0);
      const totalSakit = studentReports.reduce((a, b) => a + b.sakit, 0);
      const totalAlpha = studentReports.reduce((a, b) => a + b.alpha, 0);
      const totalDays = studentReports[0]?.totalHari || 0;

      return {
        avgRate,
        totalHadir,
        totalIzin,
        totalSakit,
        totalAlpha,
        belumAbsen: 0,
        totalDays,
      };
    }
  }, [periodType, classStudents.length, filteredAttendances, studentReports]);

  // Semester / Tahunan Special Metrics
  const lowAttendanceStudents = useMemo(() => {
    return studentReports.filter((s) => s.persentaseHadir < 80);
  }, [studentReports]);

  const topStudents = useMemo(() => {
    return studentReports.filter((s) => s.persentaseHadir === 100);
  }, [studentReports]);

  // Search filter applied to students
  const filteredStudentReports = useMemo(() => {
    return studentReports.filter(
      (item) =>
        item.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.student.nis && item.student.nis.includes(searchQuery))
    );
  }, [studentReports, searchQuery]);

  // Daily records list
  const dailyStudentRoster = useMemo(() => {
    return classStudents
      .map((s) => {
        const record = filteredAttendances.find((a) => a.siswaId === s.uid);
        return {
          student: s,
          record,
        };
      })
      .filter((item) => {
        const matchesSearch =
          item.student.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.student.nis && item.student.nis.includes(searchQuery));

        if (!matchesSearch) return false;
        if (dailyStatusFilter === 'all') return true;
        if (dailyStatusFilter === 'belum') return !item.record;
        return item.record?.status === dailyStatusFilter;
      });
  }, [classStudents, filteredAttendances, searchQuery, dailyStatusFilter]);

  // Export Handlers
  const handleExportExcel = () => {
    setExportingType('excel');
    try {
      exportAttendanceToExcel(
        classStudents,
        filteredAttendances,
        currentClass?.namaKelas || 'Kelas',
        periodLabel,
        periodType as ExportPeriodType,
        {
          dateList: weekDays.map((w) => w.dateStr),
          targetDate: selectedDailyDate,
        }
      );
    } finally {
      setTimeout(() => setExportingType(null), 1000);
    }
  };

  const handleExportPdf = () => {
    setExportingType('pdf');
    try {
      exportAttendanceToPdf(
        classStudents,
        filteredAttendances,
        currentClass?.namaKelas || 'Kelas',
        periodLabel,
        currentClass?.waliKelasNama || 'Budi Santoso, S.Kom., M.T.',
        periodType as ExportPeriodType,
        {
          dateList: weekDays.map((w) => w.dateStr),
          targetDate: selectedDailyDate,
        }
      );
    } finally {
      setTimeout(() => setExportingType(null), 1000);
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Header & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Laporan Presensi Siswa Multipel Periode
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            Laporan &amp; Rekapitulasi Presensi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau dan analisis presensi harian, mingguan, bulanan, semester, hingga tahunan secara terpadu.
          </p>
        </div>

        {/* Dual Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            disabled={exportingType !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exportingType === 'excel' ? 'Mengunduh...' : 'Export Excel (.xlsx)'}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exportingType !== null}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            {exportingType === 'pdf' ? 'Mengunduh...' : 'Export PDF (.pdf)'}
          </button>
        </div>
      </div>

      {/* Period Selection Modern Tabs */}
      <div className="bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl flex flex-wrap gap-1.5 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setPeriodType('harian')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            periodType === 'harian'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Harian</span>
        </button>

        <button
          onClick={() => setPeriodType('mingguan')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            periodType === 'mingguan'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>Mingguan</span>
        </button>

        <button
          onClick={() => setPeriodType('bulanan')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            periodType === 'bulanan'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Bulanan</span>
        </button>

        <button
          onClick={() => setPeriodType('semester')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            periodType === 'semester'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Semester</span>
        </button>

        <button
          onClick={() => setPeriodType('tahunan')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            periodType === 'tahunan'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.01]'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Tahunan</span>
        </button>
      </div>

      {/* Filter Control Bar (Dynamic based on selected period) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.namaKelas} - {c.jurusan}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Period Control */}
          {periodType === 'harian' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Tanggal Presensi
              </label>
              <input
                type="date"
                value={selectedDailyDate}
                onChange={(e) => setSelectedDailyDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {periodType === 'mingguan' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Mulai Pekan (Senin)
              </label>
              <input
                type="date"
                value={selectedWeekStart}
                onChange={(e) => setSelectedWeekStart(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {periodType === 'bulanan' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Pilih Bulan
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {periodType === 'semester' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value as 'ganjil' | 'genap')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ganjil">Semester 1 (Ganjil: Jul - Des)</option>
                  <option value="genap">Semester 2 (Genap: Jan - Jun)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Tahun Ajaran
                </label>
                <select
                  value={selectedTahunAjaran}
                  onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>
            </>
          )}

          {periodType === 'tahunan' && (
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                Tahun Ajaran Penuh
              </label>
              <select
                value={selectedTahunAjaran}
                onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024/2025">T.A. 2024/2025</option>
                <option value="2025/2026">T.A. 2025/2026</option>
                <option value="2026/2027">T.A. 2026/2027</option>
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className={periodType === 'semester' ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Cari Siswa
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama atau NIS..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick presets for Harian / Mingguan */}
        {periodType === 'harian' && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-400">Pilihan Cepat:</span>
            <button
              onClick={() => setSelectedDailyDate(todayStr)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDailyDate === todayStr
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => {
                const y = new Date();
                y.setDate(y.getDate() - 1);
                setSelectedDailyDate(y.toISOString().split('T')[0]);
              }}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all cursor-pointer"
            >
              Kemarin
            </button>
            <div className="ml-auto flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Filter Status:</span>
              <select
                value={dailyStatusFilter}
                onChange={(e) => setDailyStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
              >
                <option value="all">Semua Siswa</option>
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
                <option value="belum">Belum Dicatat</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Rata-rata Kehadiran */}
        <div className="p-4 sm:p-5 rounded-3xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-300">
            <span className="text-xs font-bold uppercase tracking-wider">
              {periodType === 'harian' ? 'Kehadiran Hari Ini' : 'Tingkat Kehadiran'}
            </span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-300">
              {kpiStats.avgRate}%
            </span>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            Kelas {currentClass?.namaKelas} ({classStudents.length} siswa)
          </span>
        </div>

        {/* Total Hadir (Hijau) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-xs font-bold uppercase tracking-wider">Hadir</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
              {kpiStats.totalHadir}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">presensi</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Tercatat hadir tepat waktu
          </span>
        </div>

        {/* Total Izin (Kuning) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-xs font-bold uppercase tracking-wider">Izin</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-300">
              {kpiStats.totalIzin}
            </span>
            <span className="text-xs text-amber-600 font-semibold">siswa</span>
          </div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Surat izin orang tua
          </span>
        </div>

        {/* Total Sakit (Oranye) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 shadow-xs">
          <div className="flex items-center justify-between text-orange-700 dark:text-orange-300">
            <span className="text-xs font-bold uppercase tracking-wider">Sakit</span>
            <HeartPulse className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-orange-700 dark:text-orange-300">
              {kpiStats.totalSakit}
            </span>
            <span className="text-xs text-orange-600 font-semibold">siswa</span>
          </div>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">
            Lampiran surat dokter
          </span>
        </div>

        {/* Total Alpha (Merah) */}
        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-3xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
            <span className="text-xs font-bold uppercase tracking-wider">Alpha</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-300">
              {kpiStats.totalAlpha}
            </span>
            <span className="text-xs text-rose-600 font-semibold">siswa</span>
          </div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            Tanpa keterangan absensi
          </span>
        </div>
      </div>

      {/* Special Warnings / Highlights for Semester & Tahunan */}
      {(periodType === 'semester' || periodType === 'tahunan') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Siswa Waspada (< 80%) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Peringatan Kehadiran Siswa (&lt; 80%)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {lowAttendanceStudents.length > 0
                  ? `Terdapat ${lowAttendanceStudents.length} siswa dengan kehadiran di bawah batas ketuntasan (80%). Perlu tindak lanjut BK/Wali Kelas.`
                  : 'Semua siswa di kelas ini memenuhi target kehadiran minimal sekolah.'}
              </p>
              {lowAttendanceStudents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lowAttendanceStudents.map((item) => (
                    <span
                      key={item.student.uid}
                      className="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[10px] font-bold"
                    >
                      {item.student.nama} ({item.persentaseHadir}%)
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Siswa Berprestasi / Disiplin Penuh (100%) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Presensi Sempurna (100% Hadir)
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                {topStudents.length > 0
                  ? `${topStudents.length} siswa memiliki rekor kehadiran sempurna tanpa absen selama periode ${periodType}.`
                  : 'Belum ada siswa dengan rekor kehadiran 100% pada periode ini.'}
              </p>
              {topStudents.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {topStudents.map((item) => (
                    <span
                      key={item.student.uid}
                      className="px-2 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold"
                    >
                      {item.student.nama} &bull; NIS: {item.student.nis}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: TABEL LAPORAN HARIAN */}
      {periodType === 'harian' && (
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Roster Kehadiran Harian
              </h3>
              <p className="text-xs text-slate-500">
                {currentClass?.namaKelas} &bull; {periodLabel} &bull; Wali Kelas:{' '}
                {currentClass?.waliKelasNama}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {dailyStudentRoster.length} Siswa Ditampilkan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">No</th>
                  <th className="px-4 py-3.5">NIS</th>
                  <th className="px-4 py-3.5">Nama Lengkap Siswa</th>
                  <th className="px-4 py-3.5 text-center">Status Kehadiran</th>
                  <th className="px-4 py-3.5">Waktu Masuk</th>
                  <th className="px-4 py-3.5">Keterangan</th>
                  <th className="px-4 py-3.5">Dicatat Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dailyStudentRoster.map((item, index) => {
                  const rec = item.record;
                  const color = rec ? getStatusColor(rec.status) : null;
                  return (
                    <tr
                      key={item.student.uid}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 font-medium">
                        {item.student.nis || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.student.fotoUrl}
                            alt={item.student.nama}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.student.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {rec ? (
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase ${color?.bg} ${color?.text} border ${color?.border}`}
                          >
                            {getStatusLabel(rec.status)}
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Belum Dicatat
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs font-mono">
                        {rec
                          ? new Date(rec.timestamp).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            }) + ' WIB'
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs italic">
                        {rec?.keterangan || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs font-medium">
                        {rec?.dicatatOlehNama || '-'}
                      </td>
                    </tr>
                  );
                })}
                {dailyStudentRoster.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: TABEL LAPORAN MINGGUAN (MATRIX SENIN - SABTU) */}
      {periodType === 'mingguan' && (
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Matriks Kehadiran Mingguan (Senin - Sabtu)
              </h3>
              <p className="text-xs text-slate-500">
                {currentClass?.namaKelas} &bull; Periode Pekan: {periodLabel}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> H: Hadir
              </span>
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> I: Izin
              </span>
              <span className="flex items-center gap-1 font-bold text-orange-600">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> S: Sakit
              </span>
              <span className="flex items-center gap-1 font-bold text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> A: Alpha
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">No</th>
                  <th className="px-3 py-3">NIS</th>
                  <th className="px-3 py-3 min-w-[180px]">Nama Siswa</th>
                  {weekDays.map((d) => (
                    <th key={d.dateStr} className="px-2 py-3 text-center">
                      <div>{d.label}</div>
                      <div className="text-[10px] font-normal text-slate-400">{d.shortDate}</div>
                    </th>
                  ))}
                  <th className="px-2 py-3 text-center text-emerald-700">H</th>
                  <th className="px-2 py-3 text-center text-amber-700">I</th>
                  <th className="px-2 py-3 text-center text-orange-700">S</th>
                  <th className="px-2 py-3 text-center text-rose-700">A</th>
                  <th className="px-3 py-3 text-center">% Pekan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {classStudents
                  .filter((s) => s.nama.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((siswa, idx) => {
                    const studentRecs = filteredAttendances.filter((a) => a.siswaId === siswa.uid);
                    let hCount = 0,
                      iCount = 0,
                      sCount = 0,
                      aCount = 0;

                    return (
                      <tr
                        key={siswa.uid}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors"
                      >
                        <td className="px-3 py-2.5 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-500">{siswa.nis || '-'}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white truncate">
                          {siswa.nama}
                        </td>

                        {weekDays.map((d) => {
                          const match = studentRecs.find((r) => r.tanggal === d.dateStr);
                          if (match) {
                            if (match.status === 'hadir') hCount++;
                            else if (match.status === 'izin') iCount++;
                            else if (match.status === 'sakit') sCount++;
                            else aCount++;

                            const color = getStatusColor(match.status);
                            return (
                              <td key={d.dateStr} className="px-2 py-2.5 text-center">
                                <span
                                  className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-[11px] ${color.bg} ${color.text} border ${color.border}`}
                                >
                                  {match.status === 'hadir'
                                    ? 'H'
                                    : match.status === 'izin'
                                    ? 'I'
                                    : match.status === 'sakit'
                                    ? 'S'
                                    : 'A'}
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td
                              key={d.dateStr}
                              className="px-2 py-2.5 text-center text-slate-300 dark:text-slate-600 font-mono"
                            >
                              -
                            </td>
                          );
                        })}

                        <td className="px-2 py-2.5 text-center font-bold text-emerald-600">{hCount}</td>
                        <td className="px-2 py-2.5 text-center font-bold text-amber-600">{iCount}</td>
                        <td className="px-2 py-2.5 text-center font-bold text-orange-600">{sCount}</td>
                        <td className="px-2 py-2.5 text-center font-bold text-rose-600">{aCount}</td>

                        <td className="px-3 py-2.5 text-center">
                          {(() => {
                            const tot = hCount + iCount + sCount + aCount;
                            const pct = tot > 0 ? Math.round((hCount / tot) * 100) : 0;
                            return (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                                  pct >= 85
                                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                                }`}
                              >
                                {pct}%
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: TABEL REKAP BULANAN / SEMESTER / TAHUNAN */}
      {(periodType === 'bulanan' || periodType === 'semester' || periodType === 'tahunan') && (
        <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {periodType === 'bulanan'
                  ? 'Rekapitulasi Presensi Bulanan'
                  : periodType === 'semester'
                  ? 'Rekapitulasi Evaluasi Semester'
                  : 'Rekapitulasi Evaluasi Tahunan & Kenaikan Kelas'}
              </h3>
              <p className="text-xs text-slate-500">
                {currentClass?.namaKelas} &bull; Periode: {periodLabel}
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {filteredStudentReports.length} Siswa Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">No</th>
                  <th className="px-4 py-3.5">NIS</th>
                  <th className="px-4 py-3.5">Nama Siswa</th>
                  <th className="px-4 py-3.5 text-center text-emerald-700 dark:text-emerald-400">
                    Hadir (H)
                  </th>
                  <th className="px-4 py-3.5 text-center text-amber-700 dark:text-amber-400">
                    Izin (I)
                  </th>
                  <th className="px-4 py-3.5 text-center text-orange-700 dark:text-orange-400">
                    Sakit (S)
                  </th>
                  <th className="px-4 py-3.5 text-center text-rose-700 dark:text-rose-400">
                    Alpha (A)
                  </th>
                  <th className="px-4 py-3.5 text-center">Total Hari</th>
                  <th className="px-4 py-3.5 text-center">% Kehadiran</th>
                  {(periodType === 'semester' || periodType === 'tahunan') && (
                    <th className="px-4 py-3.5 text-center">Status Kelayakan</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudentReports.map((item, index) => {
                  const isGood = item.persentaseHadir >= 85;
                  const isWarning = item.persentaseHadir >= 75 && item.persentaseHadir < 85;

                  return (
                    <tr
                      key={item.student.uid}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-700/40 transition-colors"
                    >
                      <td className="px-4 py-3 text-center font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 font-medium">
                        {item.student.nis || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.student.fotoUrl}
                            alt={item.student.nama}
                            className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.student.nama}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-600">
                        {item.hadir}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-amber-600">
                        {item.izin}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-orange-600">
                        {item.sakit}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-rose-600">
                        {item.alpha}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300 font-medium">
                        {item.totalHari}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold ${
                            isGood
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : isWarning
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {item.persentaseHadir}%
                        </span>
                      </td>

                      {(periodType === 'semester' || periodType === 'tahunan') && (
                        <td className="px-4 py-3 text-center">
                          {isGood ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Memenuhi Syarat
                            </span>
                          ) : isWarning ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <Clock className="w-3.5 h-3.5" />
                              Perlu Perhatian
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Peringatan Disiplin
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
                {filteredStudentReports.length === 0 && (
                  <tr>
                    <td
                      colSpan={periodType === 'semester' || periodType === 'tahunan' ? 10 : 9}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Tidak ada data siswa atau presensi untuk filter ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
