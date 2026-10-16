import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  Search,
} from 'lucide-react';
import { FLUTTER_CODEBASE, FlutterFile } from '../../data/flutterCodebase';

interface FlutterCodeHubProps {
  onClose?: () => void;
}

export const FlutterCodeHub: React.FC<FlutterCodeHubProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'files' | 'architecture' | 'setup'>('files');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('pubspec.yaml');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const selectedFile =
    FLUTTER_CODEBASE.find((f) => f.path === selectedFilePath) || FLUTTER_CODEBASE[0];

  const filteredFiles = FLUTTER_CODEBASE.filter(
    (f) =>
      f.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'flutter_code.dart';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            Flutter Android Clean Architecture Codebase
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Pusat Kode Flutter &amp; Integrasi Firebase
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Source code lengkap Flutter (Dart), struktur folder feature-first, dependencies, dan setup Firebase siap running.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            File Dart ({FLUTTER_CODEBASE.length})
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Struktur Folder
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'setup'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Instruksi Setup Firebase
          </button>
        </div>
      </div>

      {/* TAB 1: FILE CODE VIEWER */}
      {activeTab === 'files' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* File Explorer Tree */}
          <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari file Flutter..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredFiles.map((f) => {
                const isSelected = f.path === selectedFilePath;
                return (
                  <button
                    key={f.path}
                    onClick={() => setSelectedFilePath(f.path)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-semibold truncate">
                          {f.path}
                        </span>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        {f.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-1">
                      {f.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Code Box */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="font-mono text-xs font-bold text-white ml-2">
                  {selectedFile.path}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  title="Unduh file"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Unduh</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
                  title="Salin kode ke clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Description Banner */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-blue-400">Deskripsi: </span>
              {selectedFile.description}
            </div>

            {/* Code Content */}
            <div className="p-4 overflow-x-auto max-h-[520px] overflow-y-auto">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed">
                <code>{selectedFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLEAN ARCHITECTURE FOLDER STRUCTURE */}
      {activeTab === 'architecture' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Struktur Folder Clean Architecture / Feature-First
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Aplikasi Flutter <strong>AbsensiSiswa</strong> dibangun dengan standar industri arsitektur modular (Feature-First) yang memudahkan maintenance, testing, dan penambahan fitur:
          </p>

          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs leading-loose overflow-x-auto">
            <pre>{`absensi_siswa/
├── android/                   # Konfigurasi native Android (AndroidManifest.xml, build.gradle)
├── assets/                    # Gambar logo SMK, ikon QR, placeholder
├── lib/
│   ├── core/                  # Utilitas global, tema, konstanta, network
│   │   ├── constants/         # AppConstants (warna #1A73E8, string Firestore)
│   │   ├── services/          # FcmService, LocalStorageService (Hive)
│   │   └── theme/             # AppTheme (Material Design 3 Light & Dark mode)
│   ├── features/              # Modular per fitur (Feature-First)
│   │   ├── auth/              # Autentikasi Firebase (Login, RBAC, Profile)
│   │   │   ├── providers/     # auth_provider.dart (Riverpod State)
│   │   │   ├── screens/       # login_screen.dart
│   │   │   └── services/      # auth_service.dart
│   │   ├── guru/              # Modul Guru & Admin
│   │   │   ├── screens/       # guru_main_nav.dart, dashboard_guru.dart, absensi_harian.dart,
│   │   │   │                  # qr_scanner_screen.dart, laporan_screen.dart, manajemen_kelas.dart
│   │   │   └── providers/     # absensi_provider.dart, kelas_provider.dart
│   │   └── siswa/             # Modul Siswa
│   │       ├── screens/       # siswa_main_nav.dart, dashboard_siswa.dart, riwayat_siswa.dart,
│   │       │                  # kartu_pelajar_screen.dart (QR Code), profil_siswa.dart
│   │       └── providers/     # siswa_attendance_provider.dart
│   ├── models/                # Data Transfer Objects (UserModel, KelasModel, AbsensiModel)
│   ├── services/              # ExportService (PDF & Excel), FirestoreService
│   ├── firebase_options.dart  # Konfigurasi otomatis Firebase CLI
│   └── main.dart              # Entrypoint aplikasi
├── firestore.rules            # Security rules Cloud Firestore
└── pubspec.yaml               # Manifest dependensi Flutter`}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: FIREBASE & ANDROID SETUP GUIDE */}
      {activeTab === 'setup' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-600" />
              Panduan Menjalankan Project Flutter di Android Studio / VS Code
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Ikuti 4 langkah mudah di bawah untuk menjalankan project di emulator atau HP Android fisik:
            </p>
          </div>

          <div className="space-y-4">
            {/* Langkah 1 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black uppercase text-blue-600">Langkah 1</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                Install Dependencies
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Salin file <code>pubspec.yaml</code> ke direktori project Anda, lalu jalankan:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs">
                flutter pub get
              </div>
            </div>

            {/* Langkah 2 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black uppercase text-blue-600">Langkah 2</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                Konfigurasi Firebase Authentication &amp; Firestore
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Gunakan FlutterFire CLI untuk mengaitkan project dengan Firebase Console:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
                <div>npm install -g firebase-tools</div>
                <div>dart pub global activate flutterfire_cli</div>
                <div>flutterfire configure</div>
              </div>
            </div>

            {/* Langkah 3 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black uppercase text-blue-600">Langkah 3</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                Izin Kamera &amp; Penyimpanan Android (AndroidManifest.xml)
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-2">
                Buka <code>android/app/src/main/AndroidManifest.xml</code> dan tambahkan permissions:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs">
                {`<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />`}
              </div>
            </div>

            {/* Langkah 4 */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-black uppercase text-blue-600">Langkah 4</span>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                Jalankan di Android
              </h4>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs">
                flutter run
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
