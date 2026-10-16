import React, { useState } from 'react';
import {
  School,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, role: 'guru' | 'siswa') => void;
  allUsers: UserProfile[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  allUsers,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan email dan kata sandi.');
      return;
    }

    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      onLogin(found.email, found.role === 'admin' ? 'guru' : found.role as any);
      onClose();
    } else {
      setErrorMsg('Akun tidak terdaftar. Silakan hubungi Admin Sekolah untuk pembuatan akun.');
    }
  };

  // Quick fill helper
  const handleQuickLogin = (role: 'guru' | 'siswa') => {
    if (role === 'guru') {
      setEmail('guru@smk.belajar.id');
      setPassword('password123');
      onLogin('guru@smk.belajar.id', 'guru');
    } else {
      setEmail('siswa1@smk.belajar.id');
      setPassword('password123');
      onLogin('siswa1@smk.belajar.id', 'siswa');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <School className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Masuk ke AbsensiSiswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sistem Informasi Presensi Digital SMK Negeri Indonesia
            </p>
          </div>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Pilih Akun Demo (1-Klik Masuk):</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('guru')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-blue-50 transition-all cursor-pointer shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Guru / Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('siswa')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-blue-50 transition-all cursor-pointer shadow-xs"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Siswa (Fauzan)</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Pengguna
            </label>
            <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus-within:ring-2 focus-within:ring-blue-500">
              <Mail className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@smk.belajar.id"
                className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi
            </label>
            <div className="flex items-center px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm focus-within:ring-2 focus-within:ring-blue-500">
              <Lock className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Masuk ke Aplikasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Notice */}
        <p className="text-[11px] text-center text-slate-400">
          Hanya Administrator Sekolah yang berwenang membuat akun baru untuk Guru dan Siswa sesuai kebijakan keamanan sekolah.
        </p>
      </div>
    </div>
  );
};
