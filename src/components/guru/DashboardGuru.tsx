import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  HeartPulse,
  XCircle,
  ArrowRight,
  ClipboardList,
  FileSpreadsheet,
  TrendingUp,
  School,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Kelas, Absensi } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/attendance';

interface DashboardGuruProps {
  currentUser: UserProfile;
  students: UserProfile[];
  classes: Kelas[];
  attendances: Absensi[];
  onNavigateTab: (tab: string, extra?: any) => void;
}

export const DashboardGuru: React.FC<DashboardGuruProps> = ({
  currentUser,
  students,
  classes,
  attendances,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendances = attendances.filter((a) => a.tanggal === todayStr);

  const totalSiswa = students.length;
  const hadirCount = todayAttendances.filter((a) => a.status === 'hadir').length;
  const izinCount = todayAttendances.filter((a) => a.status === 'izin').length;
  const sakitCount = todayAttendances.filter((a) => a.status === 'sakit').length;
  const alphaCount = todayAttendances.filter((a) => a.status === 'alpha').length;
  const belumAbsenCount = Math.max(0, totalSiswa - (hadirCount + izinCount + sakitCount + alphaCount));

  const attendanceRate = totalSiswa > 0 ? Math.round((hadirCount / totalSiswa) * 100) : 0;

  // Format today's date in Indonesian
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/15">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Sistem Absensi Siswa Realtime
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {currentUser.nama.split(',')[0]}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-blue-100 font-medium">
            {formattedToday} &bull; SMK Negeri Indonesia Hebat
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('absen')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              Presensi Hari Ini
            </button>
            <button
              onClick={() => onNavigateTab('laporan')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/30 backdrop-blur-md text-white font-bold text-xs sm:text-sm hover:bg-blue-500/40 border border-white/25 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Laporan &amp; Rekap
            </button>
          </div>
        </div>

        {/* Background Decorative Rings */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-16 top-4 w-32 h-32 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Siswa */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Total Siswa</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalSiswa}
            </span>
            <span className="text-xs text-slate-500">siswa</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <School className="w-3 h-3 text-blue-500" />
            {classes.length} Rombel Kelas
          </div>
        </div>

        {/* Hadir (Hijau) */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
            <span className="text-xs font-bold uppercase">Hadir</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {hadirCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              ({attendanceRate}%)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400">
            {belumAbsenCount > 0 ? `${belumAbsenCount} belum dicatat` : 'Semua siswa tercatat'}
          </div>
        </div>

        {/* Izin (Kuning) */}
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
            <span className="text-xs font-bold uppercase">Izin</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-300">
              {izinCount}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
            Ada keterangan tertulis
          </div>
        </div>

        {/* Sakit (Oranye) */}
        <div className="p-4 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 shadow-xs">
          <div className="flex items-center justify-between text-orange-700 dark:text-orange-300">
            <span className="text-xs font-bold uppercase">Sakit</span>
            <HeartPulse className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-700 dark:text-orange-300">
              {sakitCount}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-orange-600 dark:text-orange-400">
            Lampiran surat dokter
          </div>
        </div>

        {/* Alpha (Merah) */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-300">
            <span className="text-xs font-bold uppercase">Alpha</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-300">
              {alphaCount}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400">
            Tanpa keterangan absensi
          </div>
        </div>
      </div>

      {/* Progress per Kelas & Quick Action Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kelas Breakdown */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Progres Presensi per Kelas
              </h2>
              <p className="text-xs text-slate-500">
                Tingkat kehadiran siswa pada {formattedToday}
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('kelola')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Kelola Kelas
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {classes.map((cls) => {
              const classStudents = students.filter((s) => s.kelasId === cls.id);
              const classStudentIds = new Set(classStudents.map((s) => s.uid));
              const classTodayRecords = todayAttendances.filter((a) => classStudentIds.has(a.siswaId));

              const hadir = classTodayRecords.filter((a) => a.status === 'hadir').length;
              const izin = classTodayRecords.filter((a) => a.status === 'izin').length;
              const sakit = classTodayRecords.filter((a) => a.status === 'sakit').length;
              const alpha = classTodayRecords.filter((a) => a.status === 'alpha').length;
              const recorded = hadir + izin + sakit + alpha;

              const percent = classStudents.length > 0 ? Math.round((hadir / classStudents.length) * 100) : 0;

              return (
                <div
                  key={cls.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-700/80 hover:border-blue-200 transition-all bg-slate-50/50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-white mr-2">
                        {cls.namaKelas}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({cls.jurusan})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {recorded} / {classStudents.length} siswa
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                        {percent}% Hadir
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                    <div
                      style={{ width: `${classStudents.length ? (hadir / classStudents.length) * 100 : 0}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                      title={`Hadir: ${hadir}`}
                    />
                    <div
                      style={{ width: `${classStudents.length ? (izin / classStudents.length) * 100 : 0}%` }}
                      className="bg-amber-400 transition-all duration-300"
                      title={`Izin: ${izin}`}
                    />
                    <div
                      style={{ width: `${classStudents.length ? (sakit / classStudents.length) * 100 : 0}%` }}
                      className="bg-orange-500 transition-all duration-300"
                      title={`Sakit: ${sakit}`}
                    />
                    <div
                      style={{ width: `${classStudents.length ? (alpha / classStudents.length) * 100 : 0}%` }}
                      className="bg-rose-500 transition-all duration-300"
                      title={`Alpha: ${alpha}`}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">Wali Kelas: {cls.waliKelasNama}</span>
                    <button
                      onClick={() => onNavigateTab('absen', { selectedClassId: cls.id })}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                    >
                      Buka Presensi &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Menu & Tools */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Menu Cepat Guru
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('absen')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      Presensi Harian
                    </div>
                    <div className="text-[11px] text-slate-500">Absen massal &amp; status</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => onNavigateTab('kelola')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors">
                      Master Data &amp; Import Excel
                    </div>
                    <div className="text-[11px] text-slate-500">Murid, guru &amp; walas</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
              </button>

              <button
                onClick={() => onNavigateTab('laporan')}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-purple-600 transition-colors">
                      Export Laporan
                    </div>
                    <div className="text-[11px] text-slate-500">Unduh PDF &amp; Excel</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
              </button>
            </div>
          </div>

          {/* Activity Stream Preview */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Catatan Kehadiran Terbaru
            </h3>
            <div className="space-y-2.5">
              {todayAttendances.slice(0, 4).map((att) => {
                const color = getStatusColor(att.status);
                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-700/60 last:border-0"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {att.siswaNama}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {att.kelasNama} &bull; NIS: {att.siswaNis || '-'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${color.bg} ${color.text} border ${color.border}`}
                    >
                      {getStatusLabel(att.status)}
                    </span>
                  </div>
                );
              })}
              {todayAttendances.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">
                  Belum ada presensi yang dicatat hari ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
