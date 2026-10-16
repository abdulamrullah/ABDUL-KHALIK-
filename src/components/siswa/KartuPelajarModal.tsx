import React from 'react';
import { X, Download, School, CreditCard, ShieldCheck, Award, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';

interface KartuPelajarModalProps {
  student: UserProfile;
  onClose: () => void;
}

export const KartuPelajarModal: React.FC<KartuPelajarModalProps> = ({ student, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const rawNis = student.nis || '20240101';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Kartu Pelajar Digital Resmi
              </h3>
              <p className="text-[11px] text-slate-500">Identitas Siswa Terverifikasi Sekolah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Realistic ID Card */}
        <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-5 sm:p-6 text-white shadow-xl shadow-blue-600/20 border border-white/20">
            {/* Header Sekolah */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-blue-100">
                    SMK NEGERI INDONESIA HEBAT
                  </p>
                  <p className="text-[9px] text-blue-200 font-medium">
                    KARTU TANDA PELAJAR DIGITAL RESMI
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                AKTIF
              </div>
            </div>

            {/* Smart ID Chip & Hologram */}
            <div className="mt-3 flex items-center justify-between">
              {/* Gold Chip Simulation */}
              <div className="w-10 h-7 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-yellow-600/40 shadow-xs flex items-center justify-center">
                <div className="w-7 h-5 border border-yellow-700/30 rounded-xs flex flex-col justify-around px-0.5">
                  <div className="h-[1px] bg-yellow-800/30" />
                  <div className="h-[1px] bg-yellow-800/30" />
                </div>
              </div>

              {/* Hologram badge */}
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-300/30 to-pink-400/20 border border-white/30 text-[9px] font-mono tracking-widest text-blue-100">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                OFFICIAL STUDENT ID
              </div>
            </div>

            {/* Student Info Body */}
            <div className="mt-4 flex items-center gap-4">
              <div className="relative">
                <img
                  src={student.fotoUrl}
                  alt={student.nama}
                  className="w-20 h-24 rounded-xl object-cover ring-2 ring-white/80 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white shadow-xs">
                  <Award className="w-3 h-3 text-yellow-300" />
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-extrabold text-sm sm:text-base text-white truncate">
                  {student.nama}
                </h4>
                <div className="text-[11px] text-blue-100 space-y-0.5 font-medium">
                  <p>
                    <span className="text-blue-200 opacity-75">NIS / NISN:</span>{' '}
                    <span className="font-mono font-bold text-white">{student.nis || '-'}</span> / 0071239821
                  </p>
                  <p>
                    <span className="text-blue-200 opacity-75">Kelas:</span>{' '}
                    <span className="font-bold text-white">{student.kelasNama || 'X RPL 1'}</span>
                  </p>
                  <p>
                    <span className="text-blue-200 opacity-75">Jurusan:</span> Rekayasa Perangkat Lunak
                  </p>
                  <p className="text-[10px] text-blue-200 truncate">
                    Email: {student.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Official Code-128 Barcode Simulation */}
            <div className="mt-4 pt-3 border-t border-white/20 bg-white/95 rounded-2xl p-2.5 text-center text-slate-900 shadow-sm">
              {/* SVG Barcode Strip */}
              <div className="flex justify-center items-center h-8 gap-[2.5px] px-2 overflow-hidden">
                {Array.from({ length: 42 }).map((_, i) => {
                  const widths = [1, 2, 3, 1, 4, 2, 1, 3];
                  const w = widths[i % widths.length];
                  return (
                    <div
                      key={i}
                      style={{ width: `${w}px` }}
                      className="h-full bg-slate-900 rounded-2xs"
                    />
                  );
                })}
              </div>
              <p className="mt-1 text-[10px] font-mono font-extrabold tracking-widest text-slate-800">
                *{rawNis}*
              </p>
            </div>

            <p className="mt-3 text-[10px] text-center text-blue-200/80">
              Kartu ini merupakan bukti identitas resmi siswa di lingkungan sekolah dan instansi mitra.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Cetak Kartu Pelajar
          </button>
        </div>
      </div>
    </div>
  );
};
