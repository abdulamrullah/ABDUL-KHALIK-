import React from 'react';
import {
  CheckCircle2,
  Clock,
  HeartPulse,
  XCircle,
  CreditCard,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  School,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, Absensi } from '../../types';
import { calculateStudentStats, getStatusColor, getStatusLabel } from '../../utils/attendance';

interface DashboardSiswaProps {
  currentUser: UserProfile;
  attendances: Absensi[];
  onNavigateTab: (tab: string) => void;
  onOpenCardModal: () => void;
}

export const DashboardSiswa: React.FC<DashboardSiswaProps> = ({
  currentUser,
  attendances,
  onNavigateTab,
  onOpenCardModal,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const myAttendances = attendances.filter((a) => a.siswaId === currentUser.uid);
  const todayRecord = myAttendances.find((a) => a.tanggal === todayStr);

  const stats = calculateStudentStats(currentUser.uid, attendances);

  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/20">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.fotoUrl}
              alt={currentUser.nama}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-3 ring-white/60 shadow-md"
            />
            <div>
              <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 mb-1 border border-white/20">
                Siswa Aktif &bull; {currentUser.kelasNama || 'X RPL 1'}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {currentUser.nama}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 font-mono">
                NIS: {currentUser.nis || '-'}
              </p>
            </div>
          </div>

          {/* Quick ID Card Button */}
          <button
            onClick={onOpenCardModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-50 transition-all shadow-md cursor-pointer flex-shrink-0"
          >
            <CreditCard className="w-4 h-4 text-blue-600" />
            Kartu Pelajar Digital
          </button>
        </div>

        {/* Background shapes */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
      </div>

      {/* Today's Status Hero Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status Presensi Hari Ini
            </span>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {formattedToday}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {todayRecord ? 'Tercatat' : 'Menunggu'}
          </span>
        </div>

        {todayRecord ? (
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              todayRecord.status === 'hadir'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-100'
                : todayRecord.status === 'izin'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-100'
                : todayRecord.status === 'sakit'
                ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 text-orange-900 dark:text-orange-100'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-xs uppercase font-extrabold tracking-wider opacity-75">
                  Telah Dicatat
                </span>
                <h3 className="text-lg font-black capitalize">
                  {getStatusLabel(todayRecord.status)}
                </h3>
                {todayRecord.keterangan && (
                  <p className="text-xs opacity-90 mt-0.5">
                    Catatan: {todayRecord.keterangan}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right text-xs">
              <p className="font-semibold">{todayRecord.dicatatOlehNama || 'Wali Kelas'}</p>
              <p className="text-[11px] opacity-75">
                {new Date(todayRecord.timestamp).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                WIB
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Belum Ada Catatan Presensi Hari Ini</h4>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                  Presensi harian dicatat langsung oleh Guru atau Wali Kelas saat kegiatan belajar mengajar dimulai.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenCardModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 cursor-pointer shadow-xs"
            >
              Lihat Kartu Pelajar
            </button>
          </div>
        )}
      </div>

      {/* Ringkasan Kehadiran Bulan Ini */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Persentase */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col justify-between">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
            Persentase Hadir
          </span>
          <div className="my-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 dark:text-blue-300">
              {stats.persentaseHadir}%
            </span>
          </div>
          <span className="text-[11px] font-semibold text-blue-600">
            {stats.persentaseHadir >= 85 ? 'Memenuhi syarat PTS' : 'Perlu ditingkatkan'}
          </span>
        </div>

        {/* Hadir */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase">
            Hadir
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
              {stats.hadir}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600">Hari masuk sekolah</span>
        </div>

        {/* Izin */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase">
            Izin
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-700 dark:text-amber-300">
              {stats.izin}
            </span>
          </div>
          <span className="text-[11px] text-amber-600">Izin resmi</span>
        </div>

        {/* Sakit */}
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
          <span className="text-xs font-bold text-orange-700 dark:text-orange-300 uppercase">
            Sakit
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-700 dark:text-orange-300">
              {stats.sakit}
            </span>
          </div>
          <span className="text-[11px] text-orange-600">Surat dokter</span>
        </div>

        {/* Alpha */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase">
            Alpha
          </span>
          <div className="mt-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-300">
              {stats.alpha}
            </span>
          </div>
          <span className="text-[11px] text-rose-600">Tanpa keterangan</span>
        </div>
      </div>

      {/* Recent Personal History Stream */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Riwayat Presensi Terbaru
          </h3>
          <button
            onClick={() => onNavigateTab('riwayat')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {myAttendances.slice(0, 5).map((att) => {
            const color = getStatusColor(att.status);
            const dateObj = new Date(att.tanggal);
            const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
            const formattedDate = dateObj.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {dayName}, {formattedDate}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Dicatat oleh: {att.dicatatOlehNama || 'Wali Kelas'}
                    {att.keterangan && ` • "${att.keterangan}"`}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}
                >
                  {getStatusLabel(att.status)}
                </span>
              </div>
            );
          })}

          {myAttendances.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">
              Belum ada data presensi tercatat untuk akun ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
