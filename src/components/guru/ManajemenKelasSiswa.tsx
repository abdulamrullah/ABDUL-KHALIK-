import React, { useState } from 'react';
import {
  Users,
  School,
  Plus,
  Pencil,
  Trash2,
  Search,
  CreditCard,
  Check,
  X,
  Sparkles,
  FileSpreadsheet,
  Download,
  Upload,
  UserCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  Filter,
} from 'lucide-react';
import { UserProfile, Kelas } from '../../types';
import { KartuPelajarModal } from '../siswa/KartuPelajarModal';
import { ExcelImportModal } from './ExcelImportModal';
import { downloadStudentTemplate, downloadTeacherTemplate } from '../../utils/excelImport';

interface ManajemenKelasSiswaProps {
  currentUser: UserProfile;
  classes: Kelas[];
  students: UserProfile[];
  teachers: UserProfile[];
  onAddClass: (newClass: Omit<Kelas, 'id'>) => void;
  onUpdateClass: (id: string, updates: Partial<Kelas>) => void;
  onDeleteClass: (id: string) => void;
  onAddStudent: (newStudent: Omit<UserProfile, 'uid' | 'createdAt'>) => void;
  onAddStudentsBatch: (students: Omit<UserProfile, 'uid' | 'createdAt'>[]) => void;
  onUpdateStudent: (uid: string, updates: Partial<UserProfile>) => void;
  onDeleteStudent: (uid: string) => void;
  onAddTeacher: (newTeacher: Omit<UserProfile, 'uid' | 'createdAt'>) => void;
  onAddTeachersBatch: (teachers: Omit<UserProfile, 'uid' | 'createdAt'>[]) => void;
  onUpdateTeacher: (uid: string, updates: Partial<UserProfile>) => void;
  onDeleteTeacher: (uid: string) => void;
}

export const ManajemenKelasSiswa: React.FC<ManajemenKelasSiswaProps> = ({
  currentUser,
  classes,
  students,
  teachers,
  onAddClass,
  onUpdateClass,
  onDeleteClass,
  onAddStudent,
  onAddStudentsBatch,
  onUpdateStudent,
  onDeleteStudent,
  onAddTeacher,
  onAddTeachersBatch,
  onUpdateTeacher,
  onDeleteTeacher,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'siswa' | 'guru' | 'kelas'>('siswa');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState<'all' | 'walas' | 'mapel'>('all');

  // Modals state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Kelas | null>(null);

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);

  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);

  const [cardModalStudent, setCardModalStudent] = useState<UserProfile | null>(null);
  const [excelImportModalOpen, setExcelImportModalOpen] = useState(false);
  const [excelImportDefaultType, setExcelImportDefaultType] = useState<'siswa' | 'guru'>('siswa');

  // Success Feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Class Form inputs
  const [classNameInput, setClassNameInput] = useState('');
  const [classTahunInput, setClassTahunInput] = useState('2024/2025');
  const [classJurusanInput, setClassJurusanInput] = useState('Rekayasa Perangkat Lunak');
  const [classWaliInput, setClassWaliInput] = useState(teachers[0]?.uid || '');
  const [classRuangInput, setClassRuangInput] = useState('');

  // Student Form inputs
  const [studentNama, setStudentNama] = useState('');
  const [studentNis, setStudentNis] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentKelasId, setStudentKelasId] = useState(classes[0]?.id || '');
  const [studentPhone, setStudentPhone] = useState('');

  // Teacher Form inputs
  const [teacherNama, setTeacherNama] = useState('');
  const [teacherNip, setTeacherNip] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherMapel, setTeacherMapel] = useState('');
  const [teacherPhone, setTeacherPhone] = useState('');
  const [teacherIsWalas, setTeacherIsWalas] = useState(false);
  const [teacherWaliRombel, setTeacherWaliRombel] = useState(classes[0]?.namaKelas || '');

  // Compute stats
  const totalWalas = teachers.filter((t) => t.isWaliKelas).length;

  // Open Edit Class
  const openEditClass = (cls: Kelas) => {
    setEditingClass(cls);
    setClassNameInput(cls.namaKelas);
    setClassTahunInput(cls.tahunAjaran);
    setClassJurusanInput(cls.jurusan);
    setClassWaliInput(cls.waliKelasId);
    setClassRuangInput(cls.ruang || '');
    setShowAddClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    const waliObj = teachers.find((t) => t.uid === classWaliInput);
    if (editingClass) {
      onUpdateClass(editingClass.id, {
        namaKelas: classNameInput,
        tahunAjaran: classTahunInput,
        jurusan: classJurusanInput,
        waliKelasId: classWaliInput,
        waliKelasNama: waliObj?.nama || 'Wali Kelas',
        ruang: classRuangInput,
      });
      showToast(`Kelas ${classNameInput} berhasil diperbarui.`);
    } else {
      onAddClass({
        namaKelas: classNameInput,
        tahunAjaran: classTahunInput,
        jurusan: classJurusanInput,
        waliKelasId: classWaliInput,
        waliKelasNama: waliObj?.nama || 'Wali Kelas',
        ruang: classRuangInput,
      });
      showToast(`Kelas ${classNameInput} berhasil ditambahkan.`);
    }
    setShowAddClassModal(false);
    setEditingClass(null);
  };

  // Open Edit Student
  const openEditStudent = (s: UserProfile) => {
    setEditingStudent(s);
    setStudentNama(s.nama);
    setStudentNis(s.nis || '');
    setStudentEmail(s.email);
    setStudentKelasId(s.kelasId || classes[0]?.id || '');
    setStudentPhone(s.telepon || '');
    setShowAddStudentModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find((c) => c.id === studentKelasId);
    if (editingStudent) {
      onUpdateStudent(editingStudent.uid, {
        nama: studentNama,
        nis: studentNis,
        email: studentEmail,
        kelasId: studentKelasId,
        kelasNama: targetClass?.namaKelas || 'Kelas',
        telepon: studentPhone,
      });
      showToast(`Data murid ${studentNama} berhasil diperbarui.`);
    } else {
      onAddStudent({
        nama: studentNama,
        email: studentEmail || `siswa.${studentNis}@smk.belajar.id`,
        role: 'siswa',
        nis: studentNis,
        kelasId: studentKelasId,
        kelasNama: targetClass?.namaKelas || 'Kelas',
        telepon: studentPhone,
        fotoUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      });
      showToast(`Akun murid ${studentNama} berhasil dibuat.`);
    }
    setShowAddStudentModal(false);
    setEditingStudent(null);
  };

  // Open Edit Teacher
  const openEditTeacher = (t: UserProfile) => {
    setEditingTeacher(t);
    setTeacherNama(t.nama);
    setTeacherNip(t.nip || '');
    setTeacherEmail(t.email);
    setTeacherMapel(t.mapel || '');
    setTeacherPhone(t.telepon || '');
    setTeacherIsWalas(Boolean(t.isWaliKelas));
    setTeacherWaliRombel(t.waliKelasRombel || classes[0]?.namaKelas || '');
    setShowAddTeacherModal(true);
  };

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      onUpdateTeacher(editingTeacher.uid, {
        nama: teacherNama,
        nip: teacherNip,
        email: teacherEmail,
        mapel: teacherMapel,
        telepon: teacherPhone,
        isWaliKelas: teacherIsWalas,
        waliKelasRombel: teacherIsWalas ? teacherWaliRombel : undefined,
      });
      showToast(`Data guru ${teacherNama} berhasil diperbarui.`);
    } else {
      onAddTeacher({
        nama: teacherNama,
        email: teacherEmail || `guru.${teacherNip}@smk.belajar.id`,
        role: 'guru',
        nip: teacherNip,
        mapel: teacherMapel || 'Guru Mata Pelajaran',
        telepon: teacherPhone,
        isWaliKelas: teacherIsWalas,
        waliKelasRombel: teacherIsWalas ? teacherWaliRombel : undefined,
        fotoUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80`,
      });
      showToast(`Akun guru ${teacherNama} berhasil ditambahkan.`);
    }
    setShowAddTeacherModal(false);
    setEditingTeacher(null);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchClass = selectedClassFilter === 'all' || s.kelasId === selectedClassFilter;
    const matchSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nis && s.nis.includes(searchQuery));
    return matchClass && matchSearch;
  });

  // Filter teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchSearch =
      t.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.nip && t.nip.includes(searchQuery)) ||
      (t.mapel && t.mapel.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchType =
      teacherFilter === 'all'
        ? true
        : teacherFilter === 'walas'
        ? t.isWaliKelas
        : !t.isWaliKelas;

    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-600">Berhasil</span>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Murid</span>
            <GraduationCap className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {students.length}
          </p>
          <span className="text-[11px] text-slate-400">Aktif terdaftar di rombel</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Total Guru</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {teachers.length}
          </p>
          <span className="text-[11px] text-slate-400">Pendidik &amp; Staf</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Wali Kelas (Walas)</span>
            <Briefcase className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {totalWalas}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">Memegang rombel binaan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Rombel Kelas</span>
            <School className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
            {classes.length}
          </p>
          <span className="text-[11px] text-slate-400">Tahun Ajaran 2024/2025</span>
        </div>
      </div>

      {/* Main Sub-tabs & Action Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Sub-tabs */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => {
              setActiveSubTab('siswa');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'siswa'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Data Murid ({students.length})
          </button>

          <button
            onClick={() => {
              setActiveSubTab('guru');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'guru'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Data Guru &amp; Walas ({teachers.length})
          </button>

          <button
            onClick={() => {
              setActiveSubTab('kelas');
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'kelas'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <School className="w-4 h-4" />
            Rombel Kelas ({classes.length})
          </button>
        </div>

        {/* Action Buttons: Import Excel, Unduh Template, Tambah Manual */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Import Excel Button */}
          <button
            onClick={() => {
              setExcelImportDefaultType(activeSubTab === 'guru' ? 'guru' : 'siswa');
              setExcelImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>

          {/* Unduh Template Excel */}
          <button
            onClick={() => {
              if (activeSubTab === 'guru') {
                downloadTeacherTemplate();
              } else {
                downloadStudentTemplate();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            title="Download Template Excel Resmi"
          >
            <Download className="w-3.5 h-3.5" />
            Template {activeSubTab === 'guru' ? 'Guru' : 'Murid'}
          </button>

          {/* Tambah Manual Button */}
          {activeSubTab === 'siswa' && (
            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentNama('');
                setStudentNis(`${20240100 + students.length + 1}`);
                setStudentEmail('');
                setStudentPhone('');
                setShowAddStudentModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Murid
            </button>
          )}

          {activeSubTab === 'guru' && (
            <button
              onClick={() => {
                setEditingTeacher(null);
                setTeacherNama('');
                setTeacherNip(`${19900000 + teachers.length + 1}`);
                setTeacherEmail('');
                setTeacherMapel('');
                setTeacherPhone('');
                setTeacherIsWalas(false);
                setShowAddTeacherModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Guru
            </button>
          )}

          {activeSubTab === 'kelas' && (
            <button
              onClick={() => {
                setEditingClass(null);
                setClassNameInput('');
                setClassTahunInput('2024/2025');
                setClassJurusanInput('Rekayasa Perangkat Lunak');
                setClassRuangInput('');
                setShowAddClassModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Rombel
            </button>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: DATA MURID */}
      {activeSubTab === 'siswa' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NIS siswa..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Kelas ({students.length} Siswa)</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Kelas {c.namaKelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStudents.map((siswa) => (
              <div
                key={siswa.uid}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={siswa.fotoUrl}
                        alt={siswa.nama}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                          {siswa.nama}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          NIS: {siswa.nis || '-'}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                          {siswa.kelasNama || 'Belum Terdaftar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-500 space-y-1">
                    <p className="truncate">Email: {siswa.email}</p>
                    <p>Telp: {siswa.telepon || '-'}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <button
                    onClick={() => setCardModalStudent(siswa)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Kartu Pelajar Digital
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditStudent(siswa)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      title="Edit Siswa"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus ${siswa.nama}?`)) {
                          onDeleteStudent(siswa.uid);
                          showToast(`Murid ${siswa.nama} berhasil dihapus.`);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              Tidak ada data murid yang sesuai kriteria pencarian.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: DATA GURU & WALAS */}
      {activeSubTab === 'guru' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama guru, NIP, atau mata pelajaran..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-64">
              <select
                value={teacherFilter}
                onChange={(e) => setTeacherFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Pendidik ({teachers.length})</option>
                <option value="walas">Wali Kelas Saja ({totalWalas})</option>
                <option value="mapel">Guru Mapel Saja ({teachers.length - totalWalas})</option>
              </select>
            </div>
          </div>

          {/* Teacher Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredTeachers.map((guru) => (
              <div
                key={guru.uid}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={guru.fotoUrl}
                      alt={guru.nama}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs"
                    />
                    <div className="text-right">
                      {guru.isWaliKelas ? (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Wali Kelas {guru.waliKelasRombel || ''}
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          Guru Mapel
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                      {guru.nama}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      NIP: {guru.nip || '-'}
                    </p>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      <span className="text-slate-400">Mapel: </span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {guru.mapel || 'Guru Pengampu'}
                      </span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 truncate">
                      <span className="text-slate-400">Email: </span>
                      {guru.email}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400">Telp: </span>
                      {guru.telepon || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {guru.role === 'admin' ? 'Hak Akses: Admin' : 'Hak Akses: Guru'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditTeacher(guru)}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                      title="Edit Guru"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus ${guru.nama}?`)) {
                          onDeleteTeacher(guru.uid);
                          showToast(`Data guru ${guru.nama} berhasil dihapus.`);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                      title="Hapus Guru"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTeachers.length === 0 && (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
              Tidak ada data guru yang cocok.
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: ROMBEL KELAS */}
      {activeSubTab === 'kelas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => {
            const classStudents = students.filter((s) => s.kelasId === cls.id);
            return (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                      {cls.tahunAjaran}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Ruang: {cls.ruang || 'Lab'}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {cls.namaKelas}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    {cls.jurusan}
                  </p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">
                      Wali Kelas: <span className="font-normal text-slate-800 dark:text-white">{cls.waliKelasNama}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">
                      Jumlah Siswa: <span className="font-bold text-blue-600 dark:text-blue-400">{classStudents.length} siswa</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditClass(cls)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Yakin ingin menghapus kelas ${cls.namaKelas}?`)) {
                        onDeleteClass(cls.id);
                        showToast(`Rombel kelas ${cls.namaKelas} berhasil dihapus.`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah/Edit Kelas */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Rombel Kelas' : 'Tambah Rombel Kelas Baru'}
              </h3>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas (contoh: X RPL 3)
                </label>
                <input
                  type="text"
                  required
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="X RPL 3..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jurusan / Kompetensi Keahlian
                </label>
                <input
                  type="text"
                  required
                  value={classJurusanInput}
                  onChange={(e) => setClassJurusanInput(e.target.value)}
                  placeholder="Rekayasa Perangkat Lunak..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    required
                    value={classTahunInput}
                    onChange={(e) => setClassTahunInput(e.target.value)}
                    placeholder="2024/2025"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ruang Kelas / Lab
                  </label>
                  <input
                    type="text"
                    value={classRuangInput}
                    onChange={(e) => setClassRuangInput(e.target.value)}
                    placeholder="Lab RPL A"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Wali Kelas
                </label>
                <select
                  value={classWaliInput}
                  onChange={(e) => setClassWaliInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                >
                  {teachers.map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.nama} {t.isWaliKelas ? '(Walas)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                  Simpan Rombel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Siswa */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingStudent ? 'Edit Data Murid' : 'Tambah Murid Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Data murid akan terdaftar di database dan dibuatkan Kartu Pelajar Digital
                </p>
              </div>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap Murid
                </label>
                <input
                  type="text"
                  required
                  value={studentNama}
                  onChange={(e) => setStudentNama(e.target.value)}
                  placeholder="Contoh: Raditya Maulana..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    required
                    value={studentNis}
                    onChange={(e) => setStudentNis(e.target.value)}
                    placeholder="20240109"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assign ke Rombel Kelas
                  </label>
                  <select
                    value={studentKelasId}
                    onChange={(e) => setStudentKelasId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Murid
                  </label>
                  <input
                    type="email"
                    required
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="siswa@smk.belajar.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                  Simpan Murid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Guru & Walas */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingTeacher ? 'Edit Data Pendidik' : 'Tambah Guru & Wali Kelas Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Daftarkan pendidik dan tetapkan sebagai Wali Kelas (Walas)
                </p>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap &amp; Gelar
                </label>
                <input
                  type="text"
                  required
                  value={teacherNama}
                  onChange={(e) => setTeacherNama(e.target.value)}
                  placeholder="Contoh: Drs. Hendro Wibowo, M.Kom."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    NIP / NUPTK
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherNip}
                    onChange={(e) => setTeacherNip(e.target.value)}
                    placeholder="198205142008011005"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran Pengampu
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherMapel}
                    onChange={(e) => setTeacherMapel(e.target.value)}
                    placeholder="Pemrograman Web..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Akun
                  </label>
                  <input
                    type="email"
                    required
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="guru@smk.belajar.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    No Telepon / WA
                  </label>
                  <input
                    type="text"
                    value={teacherPhone}
                    onChange={(e) => setTeacherPhone(e.target.value)}
                    placeholder="081345678910"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Wali Kelas Designation Box */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Tugas Tambahan: Wali Kelas (Walas)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={teacherIsWalas}
                    onChange={(e) => setTeacherIsWalas(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {teacherIsWalas && (
                  <div className="pt-2 border-t border-amber-200 dark:border-amber-800">
                    <label className="block text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Pilih Kelas Binaan:
                    </label>
                    <select
                      value={teacherWaliRombel}
                      onChange={(e) => setTeacherWaliRombel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-amber-300 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    >
                      {classes.map((c) => (
                        <option key={c.id} value={c.namaKelas}>
                          {c.namaKelas} ({c.jurusan})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                >
                  Simpan Pendidik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kartu Pelajar Digital */}
      {cardModalStudent && (
        <KartuPelajarModal
          student={cardModalStudent}
          onClose={() => setCardModalStudent(null)}
        />
      )}

      {/* Modal Excel Bulk Import */}
      <ExcelImportModal
        isOpen={excelImportModalOpen}
        onClose={() => setExcelImportModalOpen(false)}
        defaultType={excelImportDefaultType}
        classes={classes}
        existingStudents={students}
        existingTeachers={teachers}
        onImportStudents={(newStudents) => {
          onAddStudentsBatch(newStudents);
          showToast(`Berhasil mengimport ${newStudents.length} murid baru.`);
        }}
        onImportTeachers={(newTeachers) => {
          onAddTeachersBatch(newTeachers);
          showToast(`Berhasil mengimport ${newTeachers.length} guru & walas baru.`);
        }}
      />
    </div>
  );
};
