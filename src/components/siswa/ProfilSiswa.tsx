import React, { useState } from 'react';
import {
  User,
  Camera,
  Mail,
  Phone,
  School,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
  Check,
  Save,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface ProfilSiswaProps {
  currentUser: UserProfile;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export const ProfilSiswa: React.FC<ProfilSiswaProps> = ({
  currentUser,
  isDarkMode,
  onToggleDarkMode,
  onUpdateProfile,
  onLogout,
}) => {
  const [telepon, setTelepon] = useState(currentUser.telepon || '082100112233');
  const [isSaved, setIsSaved] = useState(false);

  // Avatar presets
  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  ];

  const handleSelectPreset = (url: string) => {
    onUpdateProfile({ fotoUrl: url });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ telepon });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-blue-600" />
          Profil Siswa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Informasi identitas akun siswa, foto profil, dan preferensi aplikasi
        </p>
      </div>

      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <img
            src={currentUser.fotoUrl}
            alt={currentUser.nama}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
          />
          <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {currentUser.nama}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            NIS: {currentUser.nis || '-'} &bull; {currentUser.kelasNama || 'X RPL 1'}
          </p>
          <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
            Peran: {currentUser.role.toUpperCase()}
          </span>
        </div>

        {/* Change Avatar Presets */}
        <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <p className="text-xs font-semibold text-slate-500 mb-2">
            Pilih Foto Profil Cepat:
          </p>
          <div className="flex items-center justify-center gap-3">
            {AVATAR_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleSelectPreset(preset)}
                className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                  currentUser.fotoUrl === preset ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-transparent'
                }`}
              >
                <img src={preset} alt={`Preset ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          Data Kontak Siswa
        </h3>

        {isSaved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Perubahan profil berhasil disimpan!
          </div>
        )}

        <form onSubmit={handleSaveContact} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Alamat Email (Akun Sekolah)
            </label>
            <div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
              <Mail className="w-4 h-4 mr-2 text-slate-400" />
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full bg-transparent focus:outline-hidden cursor-not-allowed"
              />
            </div>
            <span className="text-[10px] text-slate-400">Email dikelola oleh Admin Sekolah</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <div className="flex items-center px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus-within:ring-2 focus-within:ring-blue-500">
              <Phone className="w-4 h-4 mr-2 text-slate-400" />
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="08123456789"
                className="w-full bg-transparent focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan
          </button>
        </form>
      </div>

      {/* App Preferences */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
          Pengaturan Aplikasi
        </h3>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
            <div>
              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Mode Gelap (Dark Mode)
              </p>
              <p className="text-[11px] text-slate-400">Sesuaikan tampilan tema aplikasi</p>
            </div>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              isDarkMode ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isDarkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 font-bold text-xs sm:text-sm hover:bg-rose-100 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Keluar dari Akun Siswa
        </button>
      </div>
    </div>
  );
};
