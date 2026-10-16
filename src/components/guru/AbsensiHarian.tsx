import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  HeartPulse,
  XCircle,
  Save,
  CheckCheck,
  RotateCcw,
  Search,
  Filter,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserProfile, Kelas, Absensi } from '../../types';
import { AttendanceStatus, getStatusColor, getStatusLabel } from '../../utils/attendance';

interface AbsensiHarianProps {
  currentUser: UserProfile;
  classes: Kelas[];
  students: UserProfile[];
  attendances: Absensi[];
  initialClassId?: string;
  onSaveAttendance: (records: Absensi[]) => void;
}

export const AbsensiHarian: React.FC<AbsensiHarianProps> = ({
  currentUser,
  classes,
  students,
  attendances,
  initialClassId,
  onSaveAttendance,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>(
    initialClassId || (classes[0]?.id ?? '')
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // Local state for the attendance in progress for the selected class & date
  const [attendanceDraft, setAttendanceDraft] = useState<
    Record<string, { status: AttendanceStatus; keterangan: string }>
  >({});

  // Get students in this class
  const classStudents = students.filter((s) => s.kelasId === selectedClassId);

  // Sync draft whenever class or date changes
  useEffect(() => {
    const draft: Record<string, { status: AttendanceStatus; keterangan: string }> = {};

    classStudents.forEach((student) => {
      // Find existing record
      const existing = attendances.find(
        (a) => a.siswaId === student.uid && a.tanggal === selectedDate
      );
      if (existing) {
        draft[student.uid] = {
          status: existing.status,
          keterangan: existing.keterangan || '',
        };
      } else {
        // Default to hadir if not yet recorded, or leave unrecorded
        draft[student.uid] = {
          status: 'hadir',
          keterangan: '',
        };
      }
    });

    setAttendanceDraft(draft);
  }, [selectedClassId, selectedDate, attendances]);

  // Mass mark all as "Hadir"
  const handleMarkAllHadir = () => {
    const updated = { ...attendanceDraft };
    classStudents.forEach((s) => {
      updated[s.uid] = {
        status: 'hadir',
        keterangan: '',
      };
    });
    setAttendanceDraft(updated);
  };

  // Change individual student status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  // Change individual student note
  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceDraft((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        keterangan: note,
      },
    }));
  };

  // Save all records
  const handleSave = () => {
    const currentClass = classes.find((c) => c.id === selectedClassId);
    const recordsToSave: Absensi[] = classStudents.map((student) => {
      const draft = attendanceDraft[student.uid] || { status: 'hadir', keterangan: '' };
      return {
        id: `att-${selectedDate}-${student.uid}`,
        siswaId: student.uid,
        siswaNama: student.nama,
        siswaNis: student.nis,
        kelasId: selectedClassId,
        kelasNama: currentClass?.namaKelas || 'Kelas',
        tanggal: selectedDate,
        status: draft.status,
        keterangan: draft.keterangan,
        dicatatOleh: currentUser.uid,
        dicatatOlehNama: currentUser.nama,
        timestamp: new Date().toISOString(),
      };
    });

    onSaveAttendance(recordsToSave);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  // Filtered students
  const filteredStudents = classStudents.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.includes(searchQuery))
  );

  // Current stats in draft
  const draftHadir = Object.values(attendanceDraft).filter((d) => d.status === 'hadir').length;
  const draftIzin = Object.values(attendanceDraft).filter((d) => d.status === 'izin').length;
  const draftSakit = Object.values(attendanceDraft).filter((d) => d.status === 'sakit').length;
  const draftAlpha = Object.values(attendanceDraft).filter((d) => d.status === 'alpha').length;

  return (
    <div className="space-y-5 pb-24">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCheck className="w-6 h-6 text-blue-600" />
            Presensi Harian Siswa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Catat kehadiran kelas, tandai status per siswa atau absen massal
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllHadir}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            title="Tandai semua siswa dalam kelas sebagai Hadir"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            Tandai Semua Hadir
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Presensi
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {showSavedFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Presensi kelas berhasil disimpan ke database lokal &amp; cloud!</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Tersimpan</span>
        </div>
      )}

      {/* Filters: Kelas, Tanggal, & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Pilih Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Pilih Rombel / Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.namaKelas} ({c.jurusan})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Tanggal Presensi
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Search Siswa */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Cari Siswa / NIS
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama atau NIS..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Live Draft Summary Pills */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Ringkasan Hari Ini:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
              Hadir: {draftHadir}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold">
              Izin: {draftIzin}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 font-bold">
              Sakit: {draftSakit}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold">
              Alpha: {draftAlpha}
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-medium">
            Total {classStudents.length} Siswa di Kelas
          </span>
        </div>
      </div>

      {/* Student Attendance List */}
      <div className="space-y-3">
        {filteredStudents.map((student, idx) => {
          const draft = attendanceDraft[student.uid] || { status: 'hadir', keterangan: '' };
          const status = draft.status;

          return (
            <div
              key={student.uid}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Siswa info */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-5">
                    {idx + 1}.
                  </span>
                  <img
                    src={student.fotoUrl}
                    alt={student.nama}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {student.nama}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      NIS: <span className="font-mono">{student.nis || '-'}</span>
                    </p>
                  </div>
                </div>

                {/* Status Options (Hadir, Izin, Sakit, Alpha) */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 max-w-sm w-full">
                  {/* Hadir */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.uid, 'hadir')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      status === 'hadir'
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Hadir</span>
                  </button>

                  {/* Izin */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.uid, 'izin')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      status === 'izin'
                        ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/30'
                        : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Izin</span>
                  </button>

                  {/* Sakit */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.uid, 'sakit')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      status === 'sakit'
                        ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-500/30'
                        : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100 border border-orange-200 dark:border-orange-800'
                    }`}
                  >
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Sakit</span>
                  </button>

                  {/* Alpha */}
                  <button
                    type="button"
                    onClick={() => handleStatusChange(student.uid, 'alpha')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                      status === 'alpha'
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/30'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Alpha</span>
                  </button>
                </div>
              </div>

              {/* Optional note input if Izin / Sakit / Alpha */}
              {status !== 'hadir' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
                  <input
                    type="text"
                    value={draft.keterangan}
                    onChange={(e) => handleNoteChange(student.uid, e.target.value)}
                    placeholder={`Keterangan ${getStatusLabel(status)} (contoh: Surat dokter, dispensasi lomba, dsb)...`}
                    className="w-full px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
            Tidak ada siswa ditemukan pada kelas ini atau pencarian tidak cocok.
          </div>
        )}
      </div>

      {/* Floating Save button for mobile */}
      <div className="sticky bottom-20 z-30 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-3 rounded-full bg-blue-600 text-white font-bold text-sm shadow-xl hover:bg-blue-700 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Simpan Presensi ({classStudents.length} Siswa)
        </button>
      </div>
    </div>
  );
};
