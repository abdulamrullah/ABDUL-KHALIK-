import { UserProfile, Kelas, Absensi, AppNotification } from '../types';
import {
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_CLASSES,
  generateSeedAttendances,
} from '../data/dummyData';

const STORAGE_KEYS = {
  USERS: 'absensisiswa_users_v1',
  CLASSES: 'absensisiswa_classes_v1',
  ATTENDANCE: 'absensisiswa_attendance_v1',
  NOTIFICATIONS: 'absensisiswa_notifications_v1',
  CURRENT_USER: 'absensisiswa_current_user_v1',
  OFFLINE_MODE: 'absensisiswa_offline_mode_v1',
  PENDING_SYNC: 'absensisiswa_pending_sync_v1',
};

class StorageService {
  private isOffline: boolean = false;

  constructor() {
    this.initDefaultData();
    const storedOffline = localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE);
    this.isOffline = storedOffline ? JSON.parse(storedOffline) : false;
  }

  public initDefaultData(force: boolean = false): void {
    if (force || !localStorage.getItem(STORAGE_KEYS.USERS)) {
      const allUsers = [...INITIAL_TEACHERS, ...INITIAL_STUDENTS];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(allUsers));
    }

    if (force || !localStorage.getItem(STORAGE_KEYS.CLASSES)) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    }

    if (force || !localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      const seeds = generateSeedAttendances();
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(seeds));
    }

    if (force || !localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const initialNotifs: AppNotification[] = [
        {
          id: 'notif-1',
          title: 'Rekap Absensi Harian Siap',
          message: 'Rekap kehadiran kelas X RPL 1 telah diperbarui oleh Wali Kelas.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'absensi',
        },
        {
          id: 'notif-2',
          title: 'Pengumuman Ujian Tengah Semester',
          message: 'Pastikan tingkat kehadiran siswa minimal 85% untuk mengikuti PTS.',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          read: true,
          type: 'info',
        },
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(initialNotifs));
    }

    if (force || !localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Guru / Admin
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_TEACHERS[0]));
    }
  }

  // --- Auth & Users ---
  public getCurrentUser(): UserProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) {
      return INITIAL_TEACHERS[0];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TEACHERS[0];
    }
  }

  public setCurrentUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  public getUsers(): UserProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getStudents(): UserProfile[] {
    return this.getUsers().filter((u) => u.role === 'siswa');
  }

  public getTeachers(): UserProfile[] {
    return this.getUsers().filter((u) => u.role === 'guru' || u.role === 'admin');
  }

  public addStudent(student: Omit<UserProfile, 'uid' | 'createdAt'>): UserProfile {
    const users = this.getUsers();
    const newStudent: UserProfile = {
      ...student,
      uid: `siswa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      role: 'siswa',
      createdAt: new Date().toISOString(),
    };
    users.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newStudent;
  }

  public addStudentsBatch(studentsList: Omit<UserProfile, 'uid' | 'createdAt'>[]): UserProfile[] {
    const users = this.getUsers();
    const created: UserProfile[] = [];
    const now = Date.now();

    studentsList.forEach((s, idx) => {
      const newStudent: UserProfile = {
        ...s,
        uid: `siswa-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
        role: 'siswa',
        createdAt: new Date().toISOString(),
      };
      users.push(newStudent);
      created.push(newStudent);
    });

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return created;
  }

  public updateStudent(uid: string, updates: Partial<UserProfile>): void {
    const users = this.getUsers().map((u) => (u.uid === uid ? { ...u, ...updates } : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Also update current user if it's the same
    const current = this.getCurrentUser();
    if (current.uid === uid) {
      this.setCurrentUser({ ...current, ...updates });
    }
  }

  public deleteStudent(uid: string): void {
    const users = this.getUsers().filter((u) => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- Teacher & Walas Management ---
  public addTeacher(teacher: Omit<UserProfile, 'uid' | 'createdAt'>): UserProfile {
    const users = this.getUsers();
    const newTeacher: UserProfile = {
      ...teacher,
      uid: `guru-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      role: teacher.role || 'guru',
      createdAt: new Date().toISOString(),
    };
    users.push(newTeacher);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newTeacher;
  }

  public addTeachersBatch(teachersList: Omit<UserProfile, 'uid' | 'createdAt'>[]): UserProfile[] {
    const users = this.getUsers();
    const created: UserProfile[] = [];
    const now = Date.now();

    teachersList.forEach((t, idx) => {
      const newTeacher: UserProfile = {
        ...t,
        uid: `guru-${now}-${idx}-${Math.floor(Math.random() * 1000)}`,
        role: t.role || 'guru',
        createdAt: new Date().toISOString(),
      };
      users.push(newTeacher);
      created.push(newTeacher);
    });

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return created;
  }

  public updateTeacher(uid: string, updates: Partial<UserProfile>): void {
    const users = this.getUsers().map((u) => (u.uid === uid ? { ...u, ...updates } : u));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    const current = this.getCurrentUser();
    if (current.uid === uid) {
      this.setCurrentUser({ ...current, ...updates });
    }
  }

  public deleteTeacher(uid: string): void {
    const users = this.getUsers().filter((u) => u.uid !== uid);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // --- Classes ---
  public getClasses(): Kelas[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CLASSES);
    return raw ? JSON.parse(raw) : [];
  }

  public addClass(kelas: Omit<Kelas, 'id'>): Kelas {
    const classes = this.getClasses();
    const newClass: Kelas = {
      ...kelas,
      id: `kelas-${Date.now()}`,
    };
    classes.push(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return newClass;
  }

  public updateClass(id: string, updates: Partial<Kelas>): void {
    const classes = this.getClasses().map((c) => (c.id === id ? { ...c, ...updates } : c));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  public deleteClass(id: string): void {
    const classes = this.getClasses().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }

  // --- Attendance ---
  public getAttendance(): Absensi[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    return raw ? JSON.parse(raw) : [];
  }

  public saveAttendanceBatch(records: Absensi[]): void {
    const existing = this.getAttendance();

    // Map by unique key (tanggal + siswaId)
    const recordMap = new Map<string, Absensi>();
    existing.forEach((r) => recordMap.set(`${r.tanggal}_${r.siswaId}`, r));

    records.forEach((newRec) => {
      recordMap.set(`${newRec.tanggal}_${newRec.siswaId}`, newRec);
    });

    const merged = Array.from(recordMap.values());
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(merged));

    // If offline, save to pending sync queue
    if (this.isOffline) {
      const pending = this.getPendingSync();
      const updatedPending = [...pending, ...records];
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(updatedPending));
    }
  }

  public recordQuickAttendance(
    nisOrId: string,
    teacher: UserProfile
  ): { success: boolean; message: string; record?: Absensi; student?: UserProfile } {
    const students = this.getStudents();
    const student = students.find((s) => s.nis === nisOrId || s.uid === nisOrId);

    if (!student) {
      return {
        success: false,
        message: `Siswa dengan NIS / Kode "${nisOrId}" tidak ditemukan.`,
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newRecord: Absensi = {
      id: `att-${todayStr}-${student.uid}`,
      siswaId: student.uid,
      siswaNama: student.nama,
      siswaNis: student.nis,
      kelasId: student.kelasId || 'kelas-xrpl1',
      kelasNama: student.kelasNama || 'X RPL 1',
      tanggal: todayStr,
      status: 'hadir',
      keterangan: 'Presensi cepat guru',
      dicatatOleh: teacher.uid,
      dicatatOlehNama: teacher.nama,
      timestamp: new Date().toISOString(),
    };

    this.saveAttendanceBatch([newRecord]);

    return {
      success: true,
      message: `${student.nama} (NIS: ${student.nis}) berhasil ditandai HADIR!`,
      record: newRecord,
      student,
    };
  }

  // --- Offline Mode & Sync ---
  public getIsOffline(): boolean {
    return this.isOffline;
  }

  public setIsOffline(offline: boolean): void {
    this.isOffline = offline;
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE, JSON.stringify(offline));
    if (!offline) {
      this.syncPendingData();
    }
  }

  public getPendingSync(): Absensi[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
    return raw ? JSON.parse(raw) : [];
  }

  public syncPendingData(): number {
    const pending = this.getPendingSync();
    if (pending.length > 0) {
      // Clear pending
      localStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify([]));
    }
    return pending.length;
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }
}

export const storageService = new StorageService();
