import React, { useState, useEffect } from 'react';
import { UserProfile, Kelas, Absensi, AppNotification } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardGuru } from './components/guru/DashboardGuru';
import { AbsensiHarian } from './components/guru/AbsensiHarian';
import { LaporanStatistik } from './components/guru/LaporanStatistik';
import { ManajemenKelasSiswa } from './components/guru/ManajemenKelasSiswa';
import { DashboardSiswa } from './components/siswa/DashboardSiswa';
import { RiwayatSiswa } from './components/siswa/RiwayatSiswa';
import { KartuPelajarView } from './components/siswa/KartuPelajarView';
import { ProfilSiswa } from './components/siswa/ProfilSiswa';
import { KartuPelajarModal } from './components/siswa/KartuPelajarModal';
import { FlutterCodeHub } from './components/flutter/FlutterCodeHub';
import { LoginModal } from './components/auth/LoginModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Application Data State
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => storageService.getUsers());
  const [classes, setClasses] = useState<Kelas[]>(() => storageService.getClasses());
  const [attendances, setAttendances] = useState<Absensi[]>(() => storageService.getAttendance());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => storageService.getNotifications());

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [absenInitialClassId, setAbsenInitialClassId] = useState<string | undefined>(undefined);

  // Offline State
  const [isOffline, setIsOffline] = useState<boolean>(() => storageService.getIsOffline());
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => storageService.getPendingSync().length);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);
  const [isFlutterHubOpen, setIsFlutterHubOpen] = useState(false);
  const [cardModalStudent, setCardModalStudent] = useState<UserProfile | null>(null);

  // Sync dark mode class on document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const isGuru = currentUser.role === 'admin' || currentUser.role === 'guru';

  // Handlers
  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    storageService.setIsOffline(nextState);
    if (!nextState) {
      const synced = storageService.syncPendingData();
      setPendingSyncCount(0);
    }
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogin = (email: string) => {
    const found = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      handleSwitchUser(found);
    }
  };

  // Attendance handlers
  const handleSaveAttendance = (records: Absensi[]) => {
    storageService.saveAttendanceBatch(records);
    setAttendances(storageService.getAttendance());
    setPendingSyncCount(storageService.getPendingSync().length);
  };

  // Classes & Students Handlers
  const handleAddClass = (newClass: Omit<Kelas, 'id'>) => {
    storageService.addClass(newClass);
    setClasses(storageService.getClasses());
  };

  const handleUpdateClass = (id: string, updates: Partial<Kelas>) => {
    storageService.updateClass(id, updates);
    setClasses(storageService.getClasses());
  };

  const handleDeleteClass = (id: string) => {
    storageService.deleteClass(id);
    setClasses(storageService.getClasses());
  };

  const handleAddStudent = (newStudent: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    storageService.addStudent(newStudent);
    setAllUsers(storageService.getUsers());
  };

  const handleAddStudentsBatch = (newStudents: Omit<UserProfile, 'uid' | 'createdAt'>[]) => {
    storageService.addStudentsBatch(newStudents);
    setAllUsers(storageService.getUsers());
  };

  const handleUpdateStudent = (uid: string, updates: Partial<UserProfile>) => {
    storageService.updateStudent(uid, updates);
    setAllUsers(storageService.getUsers());
    if (currentUser.uid === uid) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const handleDeleteStudent = (uid: string) => {
    storageService.deleteStudent(uid);
    setAllUsers(storageService.getUsers());
  };

  const handleAddTeacher = (newTeacher: Omit<UserProfile, 'uid' | 'createdAt'>) => {
    storageService.addTeacher(newTeacher);
    setAllUsers(storageService.getUsers());
  };

  const handleAddTeachersBatch = (newTeachers: Omit<UserProfile, 'uid' | 'createdAt'>[]) => {
    storageService.addTeachersBatch(newTeachers);
    setAllUsers(storageService.getUsers());
  };

  const handleUpdateTeacher = (uid: string, updates: Partial<UserProfile>) => {
    storageService.updateTeacher(uid, updates);
    setAllUsers(storageService.getUsers());
    if (currentUser.uid === uid) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  const handleDeleteTeacher = (uid: string) => {
    storageService.deleteTeacher(uid);
    setAllUsers(storageService.getUsers());
  };

  const handleMarkNotificationAsRead = (id: string) => {
    storageService.markNotificationAsRead(id);
    setNotifications(storageService.getNotifications());
  };

  const students = allUsers.filter((u) => u.role === 'siswa');
  const teachers = allUsers.filter((u) => u.role === 'guru' || u.role === 'admin');

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}>
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingSyncCount}
        notifications={notifications}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onOpenFlutterHub={() => setIsFlutterHubOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
        {/* If user clicked Flutter Hub modal/view */}
        {isFlutterHubOpen ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Mode Tinjauan Kode Flutter &amp; Struktur Bersih Aktif
              </span>
              <button
                onClick={() => setIsFlutterHubOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer hover:bg-blue-700"
              >
                &larr; Kembali ke Aplikasi
              </button>
            </div>
            <FlutterCodeHub onClose={() => setIsFlutterHubOpen(false)} />
          </div>
        ) : isGuru ? (
          /* GURU & ADMIN VIEWS */
          <>
            {activeTab === 'dashboard' && (
              <DashboardGuru
                currentUser={currentUser}
                students={students}
                classes={classes}
                attendances={attendances}
                onNavigateTab={(tab, extra) => {
                  if (extra?.selectedClassId) {
                    setAbsenInitialClassId(extra.selectedClassId);
                  }
                  setActiveTab(tab);
                }}
              />
            )}

            {activeTab === 'absen' && (
              <AbsensiHarian
                currentUser={currentUser}
                classes={classes}
                students={students}
                attendances={attendances}
                initialClassId={absenInitialClassId}
                onSaveAttendance={handleSaveAttendance}
              />
            )}

            {activeTab === 'laporan' && (
              <LaporanStatistik
                classes={classes}
                students={students}
                attendances={attendances}
              />
            )}

            {activeTab === 'kelola' && (
              <ManajemenKelasSiswa
                currentUser={currentUser}
                classes={classes}
                students={students}
                teachers={teachers}
                onAddClass={handleAddClass}
                onUpdateClass={handleUpdateClass}
                onDeleteClass={handleDeleteClass}
                onAddStudent={handleAddStudent}
                onAddStudentsBatch={handleAddStudentsBatch}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onAddTeacher={handleAddTeacher}
                onAddTeachersBatch={handleAddTeachersBatch}
                onUpdateTeacher={handleUpdateTeacher}
                onDeleteTeacher={handleDeleteTeacher}
              />
            )}
          </>
        ) : (
          /* SISWA VIEWS */
          <>
            {activeTab === 'dashboard' && (
              <DashboardSiswa
                currentUser={currentUser}
                attendances={attendances}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCardModal={() => setCardModalStudent(currentUser)}
              />
            )}

            {activeTab === 'riwayat' && (
              <RiwayatSiswa
                currentUser={currentUser}
                attendances={attendances}
              />
            )}

            {activeTab === 'kartu' && (
              <KartuPelajarView currentUser={currentUser} />
            )}

            {activeTab === 'profil' && (
              <ProfilSiswa
                currentUser={currentUser}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onUpdateProfile={(updates) => handleUpdateStudent(currentUser.uid, updates)}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      {!isFlutterHubOpen && (
        <BottomNav
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Login / Switch Account Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        allUsers={allUsers}
      />

      {/* FCM Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
      />

      {/* Student QR Card Modal */}
      {cardModalStudent && (
        <KartuPelajarModal
          student={cardModalStudent}
          onClose={() => setCardModalStudent(null)}
        />
      )}
    </div>
  );
}
