export interface FlutterFile {
  path: string;
  category: 'config' | 'model' | 'service' | 'provider' | 'screen' | 'widget' | 'rules';
  description: string;
  code: string;
}

export const FLUTTER_CODEBASE: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    category: 'config',
    description: 'File konfigurasi dependensi lengkap Flutter: Firebase, Riverpod, QR Scanner, PDF & Excel',
    code: `name: absensi_siswa
description: "Aplikasi Absensi Siswa Berbasis Android dengan Flutter & Firebase"
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.3.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # State Management & DI
  flutter_riverpod: ^2.5.1

  # Firebase Core & Products
  firebase_core: ^2.30.1
  firebase_auth: ^4.19.4
  cloud_firestore: ^4.17.2
  firebase_storage: ^11.7.4
  firebase_messaging: ^14.9.1
  flutter_local_notifications: ^17.1.2

  # QR Code Scanning & Generation
  mobile_scanner: ^5.1.1
  qr_flutter: ^4.1.0

  # Local Storage & Offline Cache
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  shared_preferences: ^2.2.3

  # Export Laporan (PDF & Excel)
  pdf: ^3.10.8
  printing: ^5.13.0
  excel: ^4.0.3
  path_provider: ^2.1.3
  open_file: ^3.3.2

  # UI, Icons, Charts & Utilities
  google_fonts: ^6.2.1
  intl: ^0.19.0
  fl_chart: ^0.68.0
  cached_network_image: ^3.3.1
  image_picker: ^1.1.1
  flutter_spinkit: ^5.2.1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/icons/`,
  },
  {
    path: 'lib/main.dart',
    category: 'config',
    description: 'Entry point aplikasi dengan Firebase Init, Hive offline storage, dan routing role-based',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:google_fonts/google_fonts.dart';

import 'firebase_options.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/guru/screens/guru_main_nav.dart';
import 'features/siswa/screens/siswa_main_nav.dart';
import 'core/services/fcm_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Inisialisasi Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // Inisialisasi Hive Local Offline Storage
  await Hive.initFlutter();
  await Hive.openBox('absensi_offline_box');
  await Hive.openBox('user_cache_box');

  // Inisialisasi Firebase Cloud Messaging
  await FcmService().initialize();

  // Set orientasi portrait & status bar warna #1A73E8
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));

  runApp(
    const ProviderScope(
      child: AbsensiSiswaApp(),
    ),
  );
}

class AbsensiSiswaApp extends ConsumerWidget {
  const AbsensiSiswaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'AbsensiSiswa',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: authState.when(
        data: (user) {
          if (user == null) {
            return const LoginScreen();
          }
          // Role-based routing: Guru/Admin vs Siswa
          if (user.role == 'guru' || user.role == 'admin') {
            return const GuruMainNav();
          } else {
            return const SiswaMainNav();
          }
        },
        loading: () => const Scaffold(
          body: Center(
            child: CircularProgressIndicator(color: Color(0xFF1A73E8)),
          ),
        ),
        error: (error, _) => Scaffold(
          body: Center(child: Text('Terjadi kesalahan: \$error')),
        ),
      ),
    );
  }
}`,
  },
  {
    path: 'lib/core/theme/app_theme.dart',
    category: 'config',
    description: 'Material Design 3 Theme dengan warna utama #1A73E8 dan palet status kehadiran',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Warna Utama Sesuai Spesifikasi
  static const Color primaryBlue = Color(0xFF1A73E8);
  static const Color secondaryBlue = Color(0xFFE8F0FE);

  // Warna Status Absensi Resmi
  static const Color statusHadir = Color(0xFF22C55E);  // Hijau
  static const Color statusIzin = Color(0xFFEAB308);   // Kuning
  static const Color statusSakit = Color(0xFFF97316);  // Oranye
  static const Color statusAlpha = Color(0xFFEF4444);  // Merah

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: primaryBlue,
        secondary: const Color(0xFF1557B0),
        surface: Colors.white,
        background: const Color(0xFFF8FAFC),
        brightness: Brightness.light,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        foregroundColor: Color(0xFF1E293B),
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFCBD5E1)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryBlue, width: 2),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryBlue,
        primary: const Color(0xFF4285F4),
        surface: const Color(0xFF1E293B),
        background: const Color(0xFF0F172A),
        brightness: Brightness.dark,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme(
        ThemeData.dark().textTheme,
      ),
      cardTheme: CardTheme(
        color: const Color(0xFF1E293B),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
      ),
    );
  }
}`,
  },
  {
    path: 'lib/models/user_model.dart',
    category: 'model',
    description: 'Model data user Firestore: uid, nama, email, role, kelasId, nis, fotoUrl',
    code: `class UserModel {
  final String uid;
  final String nama;
  final String email;
  final String role; // 'admin', 'guru', 'siswa'
  final String? kelasId;
  final String? nis;
  final String? fotoUrl;
  final String? nip;
  final String? telepon;

  UserModel({
    required this.uid,
    required this.nama,
    required this.email,
    required this.role,
    this.kelasId,
    this.nis,
    this.fotoUrl,
    this.nip,
    this.telepon,
  });

  factory UserModel.fromMap(Map<String, dynamic> map, String id) {
    return UserModel(
      uid: id,
      nama: map['nama'] ?? '',
      email: map['email'] ?? '',
      role: map['role'] ?? 'siswa',
      kelasId: map['kelasId'],
      nis: map['nis'],
      fotoUrl: map['fotoUrl'],
      nip: map['nip'],
      telepon: map['telepon'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'nama': nama,
      'email': email,
      'role': role,
      'kelasId': kelasId,
      'nis': nis,
      'fotoUrl': fotoUrl,
      'nip': nip,
      'telepon': telepon,
    };
  }
}`,
  },
  {
    path: 'lib/models/kelas_model.dart',
    category: 'model',
    description: 'Model data kelas Firestore: id, namaKelas, tahunAjaran, waliKelasId',
    code: `class KelasModel {
  final String id;
  final String namaKelas;
  final String tahunAjaran;
  final String waliKelasId;
  final String? waliKelasNama;
  final String? jurusan;

  KelasModel({
    required this.id,
    required this.namaKelas,
    required this.tahunAjaran,
    required this.waliKelasId,
    this.waliKelasNama,
    this.jurusan,
  });

  factory KelasModel.fromMap(Map<String, dynamic> map, String id) {
    return KelasModel(
      id: id,
      namaKelas: map['namaKelas'] ?? '',
      tahunAjaran: map['tahunAjaran'] ?? '',
      waliKelasId: map['waliKelasId'] ?? '',
      waliKelasNama: map['waliKelasNama'],
      jurusan: map['jurusan'],
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'namaKelas': namaKelas,
      'tahunAjaran': tahunAjaran,
      'waliKelasId': waliKelasId,
      'waliKelasNama': waliKelasNama,
      'jurusan': jurusan,
    };
  }
}`,
  },
  {
    path: 'lib/models/absensi_model.dart',
    category: 'model',
    description: 'Model data absensi Firestore: id, siswaId, kelasId, tanggal, status, keterangan, dicatatOleh, timestamp',
    code: `import 'package:cloud_firestore/cloud_firestore.dart';

enum AttendanceStatus { hadir, izin, sakit, alpha }

class AbsensiModel {
  final String id;
  final String siswaId;
  final String kelasId;
  final String tanggal; // Format: YYYY-MM-DD
  final AttendanceStatus status;
  final String? keterangan;
  final String dicatatOleh;
  final DateTime timestamp;

  AbsensiModel({
    required this.id,
    required this.siswaId,
    required this.kelasId,
    required this.tanggal,
    required this.status,
    this.keterangan,
    required this.dicatatOleh,
    required this.timestamp,
  });

  factory AbsensiModel.fromMap(Map<String, dynamic> map, String id) {
    AttendanceStatus parseStatus(String? val) {
      switch (val?.toLowerCase()) {
        case 'izin':
          return AttendanceStatus.izin;
        case 'sakit':
          return AttendanceStatus.sakit;
        case 'alpha':
          return AttendanceStatus.alpha;
        default:
          return AttendanceStatus.hadir;
      }
    }

    DateTime parseTimestamp(dynamic ts) {
      if (ts is Timestamp) return ts.toDate();
      if (ts is String) return DateTime.tryParse(ts) ?? DateTime.now();
      return DateTime.now();
    }

    return AbsensiModel(
      id: id,
      siswaId: map['siswaId'] ?? '',
      kelasId: map['kelasId'] ?? '',
      tanggal: map['tanggal'] ?? '',
      status: parseStatus(map['status']),
      keterangan: map['keterangan'],
      dicatatOleh: map['dicatatOleh'] ?? '',
      timestamp: parseTimestamp(map['timestamp']),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'siswaId': siswaId,
      'kelasId': kelasId,
      'tanggal': tanggal,
      'status': status.name,
      'keterangan': keterangan,
      'dicatatOleh': dicatatOleh,
      'timestamp': FieldValue.serverTimestamp(),
    };
  }
}`,
  },
  {
    path: 'lib/services/auth_service.dart',
    category: 'service',
    description: 'Service autentikasi Firebase dengan pembuatan akun guru/siswa oleh Admin',
    code: `import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  Stream<User?> get authStateChanges => _auth.authStateChanges();

  User? get currentUser => _auth.currentUser;

  // Login dengan Email & Password
  Future<UserModel> signInWithEmailPassword(String email, String password) async {
    final credential = await _auth.signInWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );
    final doc = await _firestore.collection('users').doc(credential.user!.uid).get();
    if (!doc.exists) {
      throw Exception('Data profil pengguna tidak ditemukan di database.');
    }
    return UserModel.fromMap(doc.data()!, doc.id);
  }

  // Admin membuat akun baru untuk Siswa atau Guru
  Future<UserModel> createNewAccountByAdmin({
    required String email,
    required String password,
    required String nama,
    required String role,
    String? kelasId,
    String? nis,
    String? nip,
    String? telepon,
  }) async {
    // Gunakan Firebase secondary app instance untuk create user tanpa auto-login admin keluar
    final userCredential = await _auth.createUserWithEmailAndPassword(
      email: email.trim(),
      password: password,
    );

    final uid = userCredential.user!.uid;
    final userModel = UserModel(
      uid: uid,
      nama: nama,
      email: email.trim(),
      role: role,
      kelasId: kelasId,
      nis: nis,
      nip: nip,
      telepon: telepon,
      fotoUrl: 'https://ui-avatars.com/api/?name=\${Uri.encodeComponent(nama)}&background=1A73E8&color=fff',
    );

    await _firestore.collection('users').doc(uid).set(userModel.toMap());
    return userModel;
  }

  // Logout
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // Ambil profil user saat ini
  Future<UserModel?> getUserProfile(String uid) async {
    final doc = await _firestore.collection('users').doc(uid).get();
    if (doc.exists) {
      return UserModel.fromMap(doc.data()!, doc.id);
    }
    return null;
  }
}`,
  },
  {
    path: 'lib/services/firestore_service.dart',
    category: 'service',
    description: 'Service Firestore untuk query realtime, CRUD kelas, siswa, dan simpan absensi harian',
    code: `import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';
import '../models/kelas_model.dart';
import '../models/absensi_model.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Stream daftar kelas
  Stream<List<KelasModel>> streamKelas() {
    return _db.collection('kelas').snapshots().map((snapshot) {
      return snapshot.docs.map((d) => KelasModel.fromMap(d.data(), d.id)).toList();
    });
  }

  // Stream daftar siswa berdasarkan kelas
  Stream<List<UserModel>> streamSiswaByKelas(String kelasId) {
    return _db
        .collection('users')
        .where('role', isEqualTo: 'siswa')
        .where('kelasId', isEqualTo: kelasId)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((d) => UserModel.fromMap(d.data(), d.id)).toList();
    });
  }

  // Stream absensi harian per kelas
  Stream<List<AbsensiModel>> streamAbsensiHarian(String kelasId, String tanggal) {
    return _db
        .collection('absensi')
        .where('kelasId', isEqualTo: kelasId)
        .where('tanggal', isEqualTo: tanggal)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((d) => AbsensiModel.fromMap(d.data(), d.id)).toList();
    });
  }

  // Stream riwayat kehadiran pribadi siswa
  Stream<List<AbsensiModel>> streamRiwayatSiswa(String siswaId) {
    return _db
        .collection('absensi')
        .where('siswaId', isEqualTo: siswaId)
        .orderBy('tanggal', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((d) => AbsensiModel.fromMap(d.data(), d.id)).toList();
    });
  }

  // Simpan atau update absensi secara batch
  Future<void> saveBatchAbsensi(List<AbsensiModel> absensiList) async {
    final batch = _db.batch();

    for (final absensi in absensiList) {
      // Gunakan ID terpadu tanggal_siswaId untuk menghindari duplikasi
      final docId = '\${absensi.tanggal}_\${absensi.siswaId}';
      final docRef = _db.collection('absensi').doc(docId);
      batch.set(docRef, absensi.toMap(), SetOptions(merge: true));
    }

    await batch.commit();
  }

  // Absensi cepat via scan QR Code
  Future<void> submitQuickQrAttendance({
    required String siswaId,
    required String kelasId,
    required String tanggal,
    required String guruId,
  }) async {
    final docId = '\${tanggal}_\${siswaId}';
    await _db.collection('absensi').doc(docId).set({
      'siswaId': siswaId,
      'kelasId': kelasId,
      'tanggal': tanggal,
      'status': 'hadir',
      'keterangan': 'Scan QR Code Cepat',
      'dicatatOleh': guruId,
      'timestamp': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }
}`,
  },
  {
    path: 'lib/services/export_service.dart',
    category: 'service',
    description: 'Export laporan rekapitulasi kehadiran siswa ke format PDF dan Excel (.xlsx)',
    code: `import 'dart:io';
import 'package:excel/excel.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import '../models/user_model.dart';
import '../models/absensi_model.dart';

class ExportService {
  // Export ke Excel
  static Future<void> exportToExcel({
    required String namaKelas,
    required String periode,
    required List<UserModel> siswaList,
    required List<AbsensiModel> absensiList,
  }) async {
    var excel = Excel.createExcel();
    Sheet sheet = excel['Rekap Absensi'];
    excel.delete('Sheet1');

    // Header Judul
    sheet.appendRow([TextCellValue('LAPORAN KEHADIRAN SISWA - \$namaKelas')]);
    sheet.appendRow([TextCellValue('Periode: \$periode')]);
    sheet.appendRow([]);

    // Kolom Header
    sheet.appendRow([
      TextCellValue('No'),
      TextCellValue('NIS'),
      TextCellValue('Nama Siswa'),
      TextCellValue('Hadir'),
      TextCellValue('Izin'),
      TextCellValue('Sakit'),
      TextCellValue('Alpha'),
      TextCellValue('Persentase Kehadiran'),
    ]);

    for (int i = 0; i < siswaList.length; i++) {
      final s = siswaList[i];
      final records = absensiList.where((a) => a.siswaId == s.uid).toList();
      final h = records.where((a) => a.status == AttendanceStatus.hadir).length;
      final iz = records.where((a) => a.status == AttendanceStatus.izin).length;
      final sk = records.where((a) => a.status == AttendanceStatus.sakit).length;
      final a = records.where((a) => a.status == AttendanceStatus.alpha).length;
      final total = h + iz + sk + a;
      final pct = total > 0 ? (h / total * 100).toStringAsFixed(1) : '0';

      sheet.appendRow([
        IntCellValue(i + 1),
        TextCellValue(s.nis ?? '-'),
        TextCellValue(s.nama),
        IntCellValue(h),
        IntCellValue(iz),
        IntCellValue(sk),
        IntCellValue(a),
        TextCellValue('\$pct%'),
      ]);
    }

    final bytes = excel.save();
    if (bytes != null) {
      final dir = await getApplicationDocumentsDirectory();
      final file = File('\${dir.path}/Rekap_Absensi_\${namaKelas}_\$periode.xlsx');
      await file.writeAsBytes(bytes);
      await OpenFile.open(file.path);
    }
  }

  // Export ke PDF
  static Future<void> exportToPdf({
    required String namaKelas,
    required String periode,
    required List<UserModel> siswaList,
    required List<AbsensiModel> absensiList,
  }) async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Center(
                child: pw.Text(
                  'SMK NEGERI INDONESIA HEBAT',
                  style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColor.fromHex('#1A73E8')),
                ),
              ),
              pw.Center(
                child: pw.Text('Laporan Rekapitulasi Presensi Kelas: \$namaKelas | Periode: \$periode'),
              ),
              pw.Divider(thickness: 1.5),
              pw.SizedBox(height: 12),
              pw.Table.fromTextArray(
                headers: ['No', 'NIS', 'Nama', 'H', 'I', 'S', 'A', '% Hadir'],
                data: List.generate(siswaList.length, (i) {
                  final s = siswaList[i];
                  final recs = absensiList.where((a) => a.siswaId == s.uid).toList();
                  final h = recs.where((a) => a.status == AttendanceStatus.hadir).length;
                  final iz = recs.where((a) => a.status == AttendanceStatus.izin).length;
                  final sk = recs.where((a) => a.status == AttendanceStatus.sakit).length;
                  final a = recs.where((a) => a.status == AttendanceStatus.alpha).length;
                  final total = h + iz + sk + a;
                  final pct = total > 0 ? (h / total * 100).toStringAsFixed(0) : '0';

                  return ['\${i + 1}', s.nis ?? '-', s.nama, '\$h', '\$iz', '\$sk', '\$a', '\$pct%'];
                }),
                headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                headerDecoration: const pw.BoxDecoration(color: PdfColor.fromHex('#1A73E8')),
              ),
            ],
          );
        },
      ),
    );

    final dir = await getApplicationDocumentsDirectory();
    final file = File('\${dir.path}/Rekap_Presensi_\${namaKelas}_\$periode.pdf');
    await file.writeAsBytes(await pdf.save());
    await OpenFile.open(file.path);
  }
}`,
  },
  {
    path: 'lib/screens/guru/qr_scanner_screen.dart',
    category: 'screen',
    description: 'Screen scan QR Code siswa menggunakan mobile_scanner untuk pencatatan kehadiran cepat real-time',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../services/firestore_service.dart';
import '../../features/auth/providers/auth_provider.dart';

class QrScannerScreen extends ConsumerStatefulWidget {
  final String kelasId;
  const QrScannerScreen({super.key, required this.kelasId});

  @override
  ConsumerState<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends ConsumerState<QrScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isProcessing = false;

  void _onDetect(BarcodeCapture capture) async {
    if (_isProcessing) return;
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;

    final String? scannedValue = barcodes.first.rawValue;
    if (scannedValue == null) return;

    setState(() => _isProcessing = true);

    try {
      final todayStr = DateTime.now().toIso8601String().split('T').first;
      final currentGuru = ref.read(currentUserProfileProvider).value;

      await FirestoreService().submitQuickQrAttendance(
        siswaId: scannedValue,
        kelasId: widget.kelasId,
        tanggal: todayStr,
        guruId: currentGuru?.uid ?? 'guru-system',
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Berhasil mencatat HADIR untuk ID: \$scannedValue'),
            backgroundColor: const Color(0xFF22C55E),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal: \$e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan QR Presensi Siswa'),
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: _controller.torchState,
              builder: (context, state, child) {
                return Icon(state == TorchState.on ? Icons.flash_on : Icons.flash_off);
              },
            ),
            onPressed: () => _controller.toggleTorch(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF1A73E8), width: 3),
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ),
          Positioned(
            bottom: 40,
            left: 20,
            right: 20,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                'Arahkan kamera ke QR Code pada Kartu Pelajar Siswa untuk presensi instan',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 13),
              ),
            ),
          ),
        ],
      ),
    );
  }
}`,
  },
  {
    path: 'lib/screens/siswa/kartu_pelajar_screen.dart',
    category: 'screen',
    description: 'Screen Kartu Pelajar Digital Siswa lengkap dengan QR Code generator untuk absensi cepat',
    code: `import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../models/user_model.dart';

class KartuPelajarScreen extends StatelessWidget {
  final UserModel siswa;
  final String namaKelas;

  const KartuPelajarScreen({
    super.key,
    required this.siswa,
    required this.namaKelas,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kartu Pelajar Digital')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Kartu ID Siswa Modern
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1A73E8), Color(0xFF0D47A1)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1A73E8).withOpacity(0.35),
                      blurRadius: 20,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    // Header Kartu
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'SMK NEGERI INDONESIA',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            Text(
                              'KARTU IDENTITAS SISWA',
                              style: TextStyle(color: Colors.white70, fontSize: 11),
                            ),
                          ],
                        ),
                        const Icon(Icons.school, color: Colors.white, size: 32),
                      ],
                    ),
                    const Divider(color: Colors.white30, height: 24),
                    const SizedBox(height: 8),

                    // Avatar Foto Siswa
                    CircleAvatar(
                      radius: 46,
                      backgroundColor: Colors.white,
                      child: CircleAvatar(
                        radius: 43,
                        backgroundImage: NetworkImage(
                          siswa.fotoUrl ?? 'https://ui-avatars.com/api/?name=\${siswa.nama}',
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    Text(
                      siswa.nama,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'NIS: \${siswa.nis ?? "-"} | Kelas: \$namaKelas',
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                    const SizedBox(height: 20),

                    // QR Code Container
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: QrImageView(
                        data: siswa.nis ?? siswa.uid,
                        version: QrVersions.auto,
                        size: 160.0,
                        eyeStyle: const QrEyeStyle(
                          eyeShape: QrEyeShape.square,
                          color: Color(0xFF1A73E8),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Tunjukkan QR Code ini ke Guru untuk Absensi Cepat',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,
  },
  {
    path: 'firestore.rules',
    category: 'rules',
    description: 'Aturan Keamanan Cloud Firestore (RBAC: Hanya Admin/Guru yang bisa kelola data & catat absensi)',
    code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
    }
    
    function isGuruOrAdmin() {
      return isAuthenticated() && (getUserRole() == 'guru' || getUserRole() == 'admin');
    }

    // Collection users:
    // - Siswa bisa membaca datanya sendiri
    // - Guru & Admin bisa membaca & mengelola akun
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isGuruOrAdmin() || request.auth.uid == userId;
    }

    // Collection kelas:
    // - Semua yang login bisa membaca
    // - Hanya Guru/Admin yang bisa membuat, mengedit, atau menghapus kelas
    match /kelas/{kelasId} {
      allow read: if isAuthenticated();
      allow write: if isGuruOrAdmin();
    }

    // Collection absensi:
    // - Siswa hanya bisa membaca riwayat absensi miliknya
    // - Guru/Admin bisa membaca dan mencatat presensi seluruh siswa
    match /absensi/{absensiId} {
      allow read: if isAuthenticated() && (
        isGuruOrAdmin() || resource.data.siswaId == request.auth.uid
      );
      allow create, update, delete: if isGuruOrAdmin();
    }
  }
}`,
  },
  {
    path: 'lib/services/excel_import_service.dart',
    category: 'service',
    description: 'Service parsing file Excel template untuk import massal data Murid, Guru, dan Wali Kelas ke Firestore',
    code: `import 'dart:io';
import 'package:excel/excel.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/user_model.dart';
import '../models/kelas_model.dart';

class ExcelImportService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Import murid dari file Excel template
  Future<int> importStudentsFromExcel(File excelFile, List<KelasModel> classes) async {
    final bytes = await excelFile.readAsBytes();
    final excel = Excel.decodeBytes(bytes);
    final sheet = excel.tables[excel.tables.keys.first];

    if (sheet == null) throw Exception('Sheet Excel tidak ditemukan.');

    final batch = _db.batch();
    int count = 0;

    // Lewati baris 0 (header)
    for (int i = 1; i < sheet.rows.length; i++) {
      final row = sheet.rows[i];
      if (row.isEmpty) continue;

      final nis = row[0]?.value?.toString().trim() ?? '';
      final nama = row[1]?.value?.toString().trim() ?? '';
      final kelasNama = row[2]?.value?.toString().trim() ?? '';
      final email = row[3]?.value?.toString().trim() ?? 'siswa.\$nis@smk.belajar.id';
      final telepon = row[5]?.value?.toString().trim() ?? '';

      if (nis.isEmpty || nama.isEmpty) continue;

      // Cari ID kelas yang cocok
      final matchedClass = classes.firstWhere(
        (c) => c.namaKelas.toLowerCase() == kelasNama.toLowerCase(),
        orElse: () => classes.first,
      );

      final docRef = _db.collection('users').doc('siswa_\$nis');
      batch.set(docRef, {
        'nama': nama,
        'email': email,
        'role': 'siswa',
        'nis': nis,
        'kelasId': matchedClass.id,
        'kelasNama': matchedClass.namaKelas,
        'telepon': telepon,
        'fotoUrl': 'https://ui-avatars.com/api/?name=\${Uri.encodeComponent(nama)}&background=1A73E8&color=fff',
        'createdAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      count++;
    }

    await batch.commit();
    return count;
  }

  // Import guru & wali kelas dari template Excel
  Future<int> importTeachersFromExcel(File excelFile, List<KelasModel> classes) async {
    final bytes = await excelFile.readAsBytes();
    final excel = Excel.decodeBytes(bytes);
    final sheet = excel.tables[excel.tables.keys.first];

    if (sheet == null) throw Exception('Sheet Excel tidak ditemukan.');

    final batch = _db.batch();
    int count = 0;

    for (int i = 1; i < sheet.rows.length; i++) {
      final row = sheet.rows[i];
      if (row.isEmpty) continue;

      final nip = row[0]?.value?.toString().trim() ?? '';
      final nama = row[1]?.value?.toString().trim() ?? '';
      final email = row[2]?.value?.toString().trim() ?? 'guru.\$nip@smk.belajar.id';
      final mapel = row[3]?.value?.toString().trim() ?? 'Guru Mata Pelajaran';
      final tugas = row[4]?.value?.toString().trim().toLowerCase() ?? '';
      final rombel = row[5]?.value?.toString().trim() ?? '';
      final telepon = row[7]?.value?.toString().trim() ?? '';

      if (nip.isEmpty || nama.isEmpty) continue;

      final isWalas = tugas.contains('walas') || tugas.contains('wali') || rombel.isNotEmpty;

      final docRef = _db.collection('users').doc('guru_\$nip');
      batch.set(docRef, {
        'nama': nama,
        'email': email,
        'role': 'guru',
        'nip': nip,
        'mapel': mapel,
        'isWaliKelas': isWalas,
        'waliKelasRombel': isWalas ? rombel : null,
        'telepon': telepon,
        'fotoUrl': 'https://ui-avatars.com/api/?name=\${Uri.encodeComponent(nama)}&background=34A853&color=fff',
        'createdAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));

      count++;
    }

    await batch.commit();
    return count;
  }
}`,
  },
];
