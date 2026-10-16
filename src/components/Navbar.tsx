import React, { useState } from 'react';
import {
  School,
  Moon,
  Sun,
  Wifi,
  WifiOff,
  Bell,
  Code2,
  ChevronDown,
  LogOut,
  UserCheck,
  GraduationCap,
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  Users,
  CalendarDays,
  CreditCard,
  User,
} from 'lucide-react';
import { UserProfile, AppNotification } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (user: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenFlutterHub: () => void;
  onLogout: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  isDarkMode,
  onToggleDarkMode,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  notifications,
  onOpenNotifications,
  onOpenFlutterHub,
  onLogout,
  activeTab,
  onSelectTab,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const isGuru = currentUser.role === 'admin' || currentUser.role === 'guru';

  const navItems = isGuru
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'absen', label: 'Presensi', icon: ClipboardCheck },
        { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
        { id: 'kelola', label: 'Master Data', icon: Users },
      ]
    : [
        { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
        { id: 'riwayat', label: 'Riwayat', icon: CalendarDays },
        { id: 'kartu', label: 'Kartu Pelajar', icon: CreditCard },
        { id: 'profil', label: 'Profil', icon: User },
      ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  Absensi<span className="text-blue-600 dark:text-blue-400">Siswa</span>
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Android &amp; Flutter
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                SMK Negeri Indonesia Hebat
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Responsive Modern Touch) */}
          {onSelectTab && activeTab && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Quick Actions & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Flutter Code Explorer Button */}
            <button
              onClick={onOpenFlutterHub}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-xs"
              title="Lihat Source Code Flutter & Setup Firebase"
            >
              <Code2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline font-bold">Kode Flutter</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={onToggleOffline}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                isOffline
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-700 dark:text-amber-300 font-bold'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
              title={
                isOffline
                  ? 'Mode Offline aktif (data di-cache lokal di Hive/Storage)'
                  : 'Online terhubung ke Cloud Firestore'
              }
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Offline</span>
                  {pendingSyncCount > 0 && (
                    <span className="bg-amber-500 text-white rounded-full text-[10px] px-1.5 py-0.2">
                      {pendingSyncCount}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* User Profile & Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-400 bg-white dark:bg-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <img
                  src={currentUser.fotoUrl}
                  alt={currentUser.nama}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                    {currentUser.nama}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                    {currentUser.role === 'admin' ? 'Guru & Admin' : currentUser.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role & Account Switcher Dropdown */}
              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Akun Saat Ini
                      </p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {currentUser.nama}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="px-3 py-2">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5">
                        Ganti Peran Pengguna (Demo):
                      </p>
                      <div className="space-y-1">
                        {allUsers.slice(0, 6).map((user) => (
                          <button
                            key={user.uid}
                            onClick={() => {
                              onSwitchUser(user);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                              currentUser.uid === user.uid
                                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {user.role === 'guru' || user.role === 'admin' ? (
                                <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                              ) : (
                                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              )}
                              <span className="truncate">{user.nama}</span>
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-400">
                              {user.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700/60 pt-1 px-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Keluar / Ganti Akun
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
