import React, { useState } from 'react';
import {
  CalendarDays,
  Filter,
  CheckCircle2,
  Clock,
  HeartPulse,
  XCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Absensi } from '../../types';
import { getStatusColor, getStatusLabel } from '../../utils/attendance';

interface RiwayatSiswaProps {
  currentUser: UserProfile;
  attendances: Absensi[];
}

export const RiwayatSiswa: React.FC<RiwayatSiswaProps> = ({
  currentUser,
  attendances,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [statusFilter, setStatusFilter] = useState('all');

  const myAttendances = attendances
    .filter((a) => a.siswaId === currentUser.uid)
    .filter((a) => a.tanggal.startsWith(selectedMonth))
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  const totalFiltered = myAttendances.length;
  const hadirCount = myAttendances.filter((a) => a.status === 'hadir').length;
  const izinCount = myAttendances.filter((a) => a.status === 'izin').length;
  const sakitCount = myAttendances.filter((a) => a.status === 'sakit').length;
  const alphaCount = myAttendances.filter((a) => a.status === 'alpha').length;

  return (
    <div className="space-y-6 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          Riwayat Kehadiran Pribadi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Catatan presensi harian siswa yang tercatat di database sekolah
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Pilih Periode Bulan
          </label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
            Filter Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="hadir">Hadir Saja</option>
            <option value="izin">Izin Saja</option>
            <option value="sakit">Sakit Saja</option>
            <option value="alpha">Alpha Saja</option>
          </select>
        </div>
      </div>

      {/* Quick Summary Chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
          Hadir: {hadirCount} hari
        </span>
        <span className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
          Izin: {izinCount} hari
        </span>
        <span className="px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-800">
          Sakit: {sakitCount} hari
        </span>
        <span className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
          Alpha: {alphaCount} hari
        </span>
      </div>

      {/* Attendance Timeline list */}
      <div className="space-y-3">
        {myAttendances.map((att) => {
          const color = getStatusColor(att.status);
          const dateObj = new Date(att.tanggal);
          const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
          const formattedDate = dateObj.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          return (
            <div
              key={att.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl ${color.bg} ${color.text} flex-shrink-0 mt-0.5`}>
                  {att.status === 'hadir' && <CheckCircle2 className="w-5 h-5" />}
                  {att.status === 'izin' && <Clock className="w-5 h-5" />}
                  {att.status === 'sakit' && <HeartPulse className="w-5 h-5" />}
                  {att.status === 'alpha' && <XCircle className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {dayName}, {formattedDate}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Dicatat oleh: <span className="font-medium text-slate-700 dark:text-slate-300">{att.dicatatOlehNama || 'Wali Kelas'}</span> &bull; Kelas: {att.kelasNama}
                  </p>
                  {att.keterangan && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-md border border-slate-100 dark:border-slate-800">
                      Keterangan: &ldquo;{att.keterangan}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}
                >
                  {getStatusLabel(att.status)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(att.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  WIB
                </span>
              </div>
            </div>
          );
        })}

        {myAttendances.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400">
            Tidak ada data presensi yang ditemukan untuk filter periode ini.
          </div>
        )}
      </div>
    </div>
  );
};
