import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  Sparkles,
  HelpCircle,
  UserCheck,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { Kelas, UserProfile } from '../../types';
import {
  downloadStudentTemplate,
  downloadTeacherTemplate,
  parseStudentRows,
  parseTeacherRows,
  ParsedStudentRow,
  ParsedTeacherRow,
  createStudentTemplateWorkbook,
  createTeacherTemplateWorkbook,
} from '../../utils/excelImport';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'siswa' | 'guru';
  classes: Kelas[];
  existingStudents: UserProfile[];
  existingTeachers: UserProfile[];
  onImportStudents: (students: Omit<UserProfile, 'uid' | 'createdAt'>[]) => void;
  onImportTeachers: (teachers: Omit<UserProfile, 'uid' | 'createdAt'>[]) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'siswa',
  classes,
  existingStudents,
  existingTeachers,
  onImportStudents,
  onImportTeachers,
}) => {
  const [importType, setImportType] = useState<'siswa' | 'guru'>(defaultType);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<ParsedStudentRow[]>([]);
  const [parsedTeachers, setParsedTeachers] = useState<ParsedTeacherRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const existingNisSet = new Set(existingStudents.map((s) => s.nis || ''));
  const existingNipSet = new Set(existingTeachers.map((t) => t.nip || ''));

  // Handle parsing array buffer
  const processExcelBuffer = (data: ArrayBuffer, name: string) => {
    setIsProcessing(true);
    setFileName(name);
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet);

      if (importType === 'siswa') {
        const result = parseStudentRows(rawRows, classes, existingNisSet);
        setParsedStudents(result.valid);
        setParsedTeachers([]);
        setParseErrors(result.errors);
      } else {
        const result = parseTeacherRows(rawRows, classes, existingNipSet);
        setParsedTeachers(result.valid);
        setParsedStudents([]);
        setParseErrors(result.errors);
      }
    } catch (err: any) {
      setParseErrors([`Gagal membaca file Excel: ${err.message || 'Format tidak valid'}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        processExcelBuffer(evt.target.result as ArrayBuffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        processExcelBuffer(evt.target.result as ArrayBuffer, file.name);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Load Built-in Demo Template Data for 1-click testability
  const handleLoadSampleData = () => {
    const wb =
      importType === 'siswa'
        ? createStudentTemplateWorkbook()
        : createTeacherTemplateWorkbook();

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    processExcelBuffer(
      wbout,
      importType === 'siswa'
        ? 'Contoh_Data_Import_Murid.xlsx'
        : 'Contoh_Data_Import_Guru_Walas.xlsx'
    );
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (importType === 'siswa' && parsedStudents.length > 0) {
      const payload: Omit<UserProfile, 'uid' | 'createdAt'>[] = parsedStudents.map((s) => ({
        nama: s.nama,
        email: s.email,
        role: 'siswa',
        nis: s.nis,
        kelasId: s.kelasId,
        kelasNama: s.kelasNama,
        telepon: s.telepon,
        jenisKelamin: s.jenisKelamin,
        alamat: s.alamat,
        fotoUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80`,
      }));
      onImportStudents(payload);
      onClose();
    } else if (importType === 'guru' && parsedTeachers.length > 0) {
      const payload: Omit<UserProfile, 'uid' | 'createdAt'>[] = parsedTeachers.map((t) => ({
        nama: t.nama,
        email: t.email,
        role: t.role,
        nip: t.nip,
        telepon: t.telepon,
        isWaliKelas: t.isWaliKelas,
        waliKelasRombel: t.waliKelasRombel,
        mapel: t.mapel,
        jenisKelamin: t.jenisKelamin,
        fotoUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80`,
      }));
      onImportTeachers(payload);
      onClose();
    }
  };

  const totalValid =
    importType === 'siswa' ? parsedStudents.length : parsedTeachers.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Import Data Massal via Excel
                </h3>
                <p className="text-xs text-slate-500">
                  Unggah data Murid, Guru, dan Wali Kelas menggunakan template resmi
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Type Switcher */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => {
                  setImportType('siswa');
                  setFileName('');
                  setParsedStudents([]);
                  setParsedTeachers([]);
                  setParseErrors([]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  importType === 'siswa'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                Import Murid (Siswa)
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('guru');
                  setFileName('');
                  setParsedStudents([]);
                  setParsedTeachers([]);
                  setParseErrors([]);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  importType === 'guru'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Import Guru &amp; Walas
              </button>
            </div>

            {/* Template Download & Sample Loader buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (importType === 'siswa') {
                    downloadStudentTemplate();
                  } else {
                    downloadTeacherTemplate();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Template ({importType === 'siswa' ? 'Murid' : 'Guru & Walas'})
              </button>

              <button
                type="button"
                onClick={handleLoadSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Gunakan contoh data bawaan untuk simulasi import langsung"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Contoh Data
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="my-4 overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">
              {fileName ? fileName : 'Klik atau seret file Excel ke area ini'}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Mendukung format Microsoft Excel (.xlsx, .xls) atau CSV
            </p>
          </div>

          {/* Validation Warnings / Error Banner */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>Ditemukan {parseErrors.length} baris tidak valid:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto text-[11px] opacity-90 pl-1">
                {parseErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Table if Data Parsed */}
          {totalValid > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Pratinjau Data Siap Import ({totalValid} baris)
                </span>
                <span className="text-[11px] text-slate-500">
                  Data valid akan langsung ditambahkan ke sistem
                </span>
              </div>

              <div className="max-h-56 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                    {importType === 'siswa' ? (
                      <tr>
                        <th className="px-3 py-2">NIS</th>
                        <th className="px-3 py-2">Nama Murid</th>
                        <th className="px-3 py-2">Kelas</th>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">JK</th>
                        <th className="px-3 py-2">No Telp</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-3 py-2">NIP</th>
                        <th className="px-3 py-2">Nama Guru</th>
                        <th className="px-3 py-2">Mata Pelajaran</th>
                        <th className="px-3 py-2">Tugas / Walas</th>
                        <th className="px-3 py-2">Kelas Binaan</th>
                        <th className="px-3 py-2">Email</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {importType === 'siswa'
                      ? parsedStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-3 py-2 font-mono font-bold text-blue-600">{s.nis}</td>
                            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-white">{s.nama}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 font-semibold">
                                {s.kelasNama}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-500 truncate max-w-[150px]">{s.email}</td>
                            <td className="px-3 py-2">{s.jenisKelamin}</td>
                            <td className="px-3 py-2 text-slate-500">{s.telepon}</td>
                          </tr>
                        ))
                      : parsedTeachers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="px-3 py-2 font-mono font-bold text-blue-600">{t.nip}</td>
                            <td className="px-3 py-2 font-semibold text-slate-800 dark:text-white">{t.nama}</td>
                            <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{t.mapel}</td>
                            <td className="px-3 py-2">
                              {t.isWaliKelas ? (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold">
                                  Wali Kelas
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  Guru Mapel
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300">
                              {t.waliKelasRombel || '-'}
                            </td>
                            <td className="px-3 py-2 text-slate-500 truncate max-w-[150px]">{t.email}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Total {totalValid} data siap disimpan
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={totalValid === 0}
              onClick={handleConfirmImport}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                totalValid > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Import {totalValid} Data Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
