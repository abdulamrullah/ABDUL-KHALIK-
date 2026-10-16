import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileSpreadsheet,
  Users,
  CalendarDays,
  CreditCard,
  User,
} from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role, activeTab, onSelectTab }) => {
  const isGuru = role === 'admin' || role === 'guru';

  const guruItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'absen', label: 'Presensi', icon: ClipboardCheck },
    { id: 'laporan', label: 'Laporan', icon: FileSpreadsheet },
    { id: 'kelola', label: 'Master Data', icon: Users },
  ];

  const siswaItems = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'riwayat', label: 'Riwayat', icon: CalendarDays },
    { id: 'kartu', label: 'Kartu Pelajar', icon: CreditCard },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  const items = isGuru ? guruItems : siswaItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg">
      <div className="max-w-md md:max-w-xl mx-auto px-2 flex items-center justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-transform ${
                  isActive
                    ? 'bg-blue-100 dark:bg-blue-950/60 scale-110 shadow-xs'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight truncate max-w-[65px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
