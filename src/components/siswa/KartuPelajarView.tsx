import React from 'react';
import { School, CreditCard, ShieldCheck, Download, Award, Sparkles, UserCheck } from 'lucide-react';
import { UserProfile } from '../../types';

interface KartuPelajarViewProps {
  currentUser: UserProfile;
}

export const KartuPelajarView: React.FC<KartuPelajarViewProps> = ({ currentUser }) => {
  const handlePrint = () => {
    window.print();
  };

  const rawNis = currentUser.nis || '20240101';

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-blue-600" />
          Kartu Pelajar Digital Siswa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kartu identitas resmi siswa SMK Negeri Indonesia Hebat dengan nomor induk terdaftar.
        </p>
      </div>

      {/* Realistic Indonesian Student ID Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-6 sm:p-8 text-white shadow-2xl shadow-blue-600/30 border border-white/20">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-black tracking-wider uppercase text-blue-100">
                SMK NEGERI INDONESIA HEBAT
              </p>
              <p className="text-[11px] text-blue-200 font-medium">KARTU IDENTITAS SISWA RESMI</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 border border-emerald-400/30 text-xs font-bold text-emerald-300">
            <ShieldCheck className="w-4 h-4" />
            TERVERIFIKASI
          </div>
        </div>

        {/* Smart ID Chip & Hologram */}
        <div className="mt-4 flex items-center justify-between">
          {/* Gold Chip Simulation */}
          <div className="w-12 h-8 rounded-md bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 border border-yellow-600/40 shadow-xs flex items-center justify-center">
            <div className="w-8 h-6 border border-yellow-700/30 rounded-xs flex flex-col justify-around px-1">
              <div className="h-[1px] bg-yellow-800/30" />
              <div className="h-[1px] bg-yellow-800/30" />
            </div>
          </div>

          {/* Hologram badge */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-300/30 to-pink-400/20 border border-white/30 text-[10px] font-mono tracking-widest text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            OFFICIAL STUDENT ID
          </div>
        </div>

        {/* Student info */}
        <div className="mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative flex-shrink-0">
            <img
              src={currentUser.fotoUrl}
              alt={currentUser.nama}
              className="w-24 h-28 rounded-2xl object-cover ring-4 ring-white/80 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-blue-600 text-white shadow-xs">
              <Award className="w-3.5 h-3.5 text-yellow-300" />
            </div>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className="font-extrabold text-lg sm:text-xl text-white truncate">
              {currentUser.nama}
            </h3>
            <div className="text-xs text-blue-100 font-medium space-y-1">
              <p>
                <span className="text-blue-200 opacity-75">NIS / NISN:</span>{' '}
                <span className="font-mono font-bold text-white">{currentUser.nis || '-'}</span> / 0071239821
              </p>
              <p>
                <span className="text-blue-200 opacity-75">Kelas:</span>{' '}
                <span className="font-bold text-white">{currentUser.kelasNama || 'X RPL 1'}</span>
              </p>
              <p>
                <span className="text-blue-200 opacity-75">Jurusan:</span> Rekayasa Perangkat Lunak
              </p>
              <p className="text-[11px] text-blue-200 truncate">
                Email: {currentUser.email}
              </p>
            </div>
            <div className="pt-1">
              <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30">
                STATUS: SISWA AKTIF 2024 - 2027
              </span>
            </div>
          </div>
        </div>

        {/* Code-128 Official Barcode */}
        <div className="mt-6 p-4 rounded-2xl bg-white text-center shadow-lg text-slate-900">
          <div className="flex justify-center items-center h-10 gap-[3px] px-2 overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => {
              const widths = [1, 3, 2, 1, 4, 2, 1, 3];
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
          <p className="mt-2 text-xs font-mono font-extrabold tracking-widest text-slate-800">
            *{rawNis}*
          </p>
        </div>

        {/* Card Footer notice */}
        <p className="mt-4 text-[11px] text-center text-blue-200">
          Kartu digital ini sah digunakan untuk presensi harian, perpustakaan, dan fasilitas sekolah resmi.
        </p>
      </div>

      {/* Print / Save button */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Cetak / Download Kartu Pelajar
        </button>
      </div>
    </div>
  );
};
