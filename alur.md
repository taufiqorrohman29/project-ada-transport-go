Alur Lengkap Aplikasi Ada Transport Go
Dokumen ini adalah dokumentasi teknis komprehensif mengenai bagaimana aplikasi "Ada Transport Go" beroperasi, dari request di sisi client hingga penanganan database pada server.

## 1. Arsitektur Umum Sistem
Aplikasi ini menggunakan model arsitektur tradisional Client-Server dengan pola rendering HTML di sisi server (Server-Side Rendering / SSR).

- **Client (Frontend):** Menggunakan HTML biasa dengan Javascript murni yang berinteraksi dalam arsitektur Multi-Page Application (MPA).
- **Server (Backend):** Menggunakan Node.js dengan framework express. Template engine yang dipakai adalah `ejs` (Embedded JavaScript).
- **Database:** Menggunakan MySQL 8.0, dihubungkan dengan library `mysql2` melalui pool connections.
- **Infrastruktur:** Dibungkus menggunakan Docker Compose, sehingga aplikasi node dan mysql dapat dikontainerisasi secara otomatis.

## 2. Alur Pengguna: Pendaftaran & Autentikasi (Auth)

### 2.1 Pembuatan Akun (Register)
- **User Action:** Pengguna mengisi formulir di `views/auth.ejs` (URL: `/auth#register`) lalu menekan tombol submit.
- **Komunikasi:** Front-end mengirim POST request ke endpoint backend: `POST /api/auth/register` dengan payload (nama, email, password, confirm).
- **Backend Logic (`routes/auth.js`):**
  1. Mengecek validitas password.
  2. Mengenkripsi password menggunakan library `bcrypt.hash(password, 10)` mengubahnya menjadi urutan acak agar aman.
  3. Menjalankan koneksi DB (pool) dan meng-eksekusi query `INSERT INTO users ...`.
- **Respon:** Render ulang `/auth` dengan notifikasi "Registrasi berhasil".

### 2.2 Proses Masuk (Login)
- **User Action:** Pengguna mengisi formulir login di `views/auth.ejs` dengan email & sandi.
- **Backend Logic (`POST /api/auth/login`):**
  1. Backend memanggil `SELECT * FROM users WHERE email = ?`.
  2. Mengkomparasi input sandi dengan hash DB menggunakan `bcrypt.compare`.
  3. Apabila lolos, Server menyimpan ID User & Data ke dalam memory RAM melalui dependensi express-session (`req.session.user = {id, email, username, role}`). Variabel global cookie browser dikirimkan balik ke pengguna (`connect.sid`).
- **Respon:** Mengalihkan user ke Beranda utama `Redirect /`. Node secara otomatis mendaftarkan `res.locals.user` di dalam `server.js` sehingga UI dapat menangkap nilai autentikasi mereka di Layout Header.

## 3. Alur Pengguna: Transaksi Pemesanan (Booking checkout)
- **User Action:** Di halaman `views/booking.ejs`, pengguna yang telah log in dapat mengeklik "Pesan Sekarang" pada tab apapun (Sewa, Wisata, Antar Kota). Frontend Javascript membaca atribut `data-price` HTML untuk mempopulasi Modal pembayaran secara real time.
- **Verifikasi Klien:** Jika user belum log in, skrip EJS menghentikan alur dan melemparkan alert log in terlebih dahulu.
- **Form Submit:** Menuju endpoint `POST /api/booking/checkout`.
- **Backend Logic (`routes/api.js`):**
  1. **ID Generating:** Sebuah Booking Reference di-generate secara acak. `crypto.randomBytes` menghasilkan format ID semisal `ATGO-X82A`.
  2. Data kalkulasi harga diintegrasikan dengan database table `bookings`.
- **Respon:** Mengalihkan klien ke `Redirect /ticket/ATGO-X82A`.

## 4. Alur Pengguna: Tampilan E-Ticket
- **Pemanggilan Routing (`GET /ticket/:ref`):**
  1. Server menjalankan `SELECT` join dari tabel `bookings` & `users` berbekal referensi url tiket pengguna.
  2. Jika valid, server langsung men-generate kode QR dinamis berbasis string murni menggunakan library NodeJS `qrcode.toDataURL`. Kode ini dimasukkan menjadi variabel base-64 ke EJS.
- **Respon:** Halaman render utuh `ticket.ejs` muncul, menampilkan antarmuka Boarding Pass profesional.

## 5. Alur Pemindaian / QR Validation (Untuk Scanner)
- **Akses Sistem:** Admin fisik di lapangan membuka `http://localhost:3000/admin/scanner`. Endpoint `GET /admin/scanner` me-render file ejs Scanner.
- **Fungsi Kamera:** File JS library dari luar sistem (`html5-qrcode`) memanfaatkan kapabilitas I/O perangkat klien untuk menyalakan Webcam dan menangkap pola barcode tiket pemesan.
- **Verifikasi (AJAX):** Setelah string ID terbaca, Javascript lokal mengirim Request Asynchronous murni (AJAX Fetch) berparameter JSON ke server HTTP: `POST /api/verify`.
- **Backend Logic:** Menjalankan statement `SELECT` sederhana. Jika ketemu (ID Valid), Server memberikan JSON Response `{success: true, data: {nama, metode}}`.
- **Tampilan Antarmuka:** Tampilan Scanner UI merespon JSON dengan notifikasi Hijau (sukses) & Merah (gagal).

## 6. Panduan Menjalankan Aplikasi
### Persyaratan Sistem
Pastikan sistem anda telah menginstal:
- Docker Engine dan Docker Compose

### Cara Menjalankan (Run) Aplikasi
1. Buka terminal (CMD/PowerShell/Bash)
2. Arahkan direktori (`cd`) ke dalam folder proyek `ada-transport-go`
3. Jalankan perintah: `docker compose up -d`
4. Tunggu hingga proses build selesai. Aplikasi (Node.js) akan terhubung ke container MySQL dan men-*generate* seluruh skema tabel beserta *user* admin secara otomatis.

### Cara Akses
Buka browser (Chrome/Firefox/Safari) lalu kunjungi alamat:
- **Aplikasi Utama**: http://localhost:3000
- **Halaman Admin & Scanner**: http://localhost:3000/admin

**Kredensial Default Admin (Generate Otomatis):**
- Email: `admin@adago.com`
- Password: `<PASSWORD_ADMIN_DEFAULT_ANDA>`

## 7. Panduan Testing Manual (End-to-End)
### Testing Autentikasi:
1. Masuk ke `http://localhost:3000/auth` dan lakukan "Daftar Akun Baru".
2. Setelah sukses, log in menggunakan akun tersebut. (Cek log di terminal menggunakan `docker compose logs app` pada saat uji coba "Lupa Password" untuk melihat tautan keamanan *reset token*).

### Testing Form Booking & E-Ticket:
1. Pastikan Anda telah ter-otentikasi (mempunyai *Cookie Session* dari langkah sebelumnya).
2. Pergi ke `http://localhost:3000/booking` dan cobalah klik tombol "Pesan" pada tab "Sewa Kendaraan" atau "Paket Wisata".
3. Form *pop-up* "Konfirmasi Pembayaran" akan otomatis menampilkan kalkulasi harga.
4. Klik Submit. Anda akan dialihkan ke halaman e-Ticket dinamis baru, contoh: `http://localhost:3000/ticket/ATGO-XXXX`. Pastikan halaman *boarding-pass* warna *pink* dapat terisi beserta pola QR code-nya.

### Testing Admin Dashboard & Scanner:
1. *Logout* dari akun pengguna biasa, kemudian *login* kembali dengan email `admin@adago.com` dan password `<PASSWORD_ADMIN_DEFAULT_ANDA>`.
2. Akses halaman Admin Dashboard di `http://localhost:3000/admin`.
3. Coba masukan nama dan harga di antarmuka "Tambah Kendaraan Sewa" dan refresh halaman `http://localhost:3000/booking` untuk melihat wujud tabel kendaraan baru tersinkronisasi.
4. Buka fitur **Scanner** khusus admin dengan mengeklik tombol beranda dashboard atau kunjungi `http://localhost:3000/admin/scanner`.
5. Jika memiliki smartphone/tablet yang terhubung pada jaringan *Wifi* yang sama atau menggunakan *webcam* laptop: _scan QR code_ yang terdapat di layar.
6. Modal *bottom-sheet* warna Hijau berisi rincian identitas "SCAN BERHASIL" akan menyembul keluar di pinggiran bawah halaman, menandakan validasi *end-to-end* yang berhasil!

## 8. Analisis Sistem & Perbaikan Tambahan (Log Updates)
Sistem telah melalui analisis menyeluruh serta uji coba komprehensif pada tampilan Desktop maupun Mobile. Beberapa *bug* dan peningkatan yang telah diaplikasikan diantaranya:

### A. Perbaikan Fitur Navigasi & Mobile Responsiveness
- **Konflik Hamburger Menu**: Sebelumnya hamburger menu di versi seluler gagal terbuka. Analisis menemukan adanya klik handler ganda di antara `script.js` dan inline script di `header.ejs` yang menyebabkan menu tertutup seketika dalam hitungan milidetik. *Fix*: Menghapus fungsi ganda di `script.js`.
- **Bug Smooth Scrolling**: Skrip *smooth scrolling* secara keliru mencegat klik pada *semua* tautan (mis. ke `/layanan`), menghentikan pengguna untuk berpindah halaman. *Fix*: Modifikasi fungsi dengan verifikasi awalan `#` (*anchor link*) agar perpindahan halaman normal tidak diblokir.

### B. Perbaikan Routing & Database Integrasi
- **Riwayat Pemesanan (Error 404)**: Tautan profil *dropdown* mengarah ke `/booking-history`, namun tidak ada backend controller maupun halaman *view* terkait, memunculkan halaman 404 *Not Found*. *Fix*: Penambahan routing `GET /booking-history` di `routes/index.js` dengan _query DB_ (menarik data *booking* berdasarkan `user_id`) dan membuat *template engine* baru `booking-history.ejs` untuk mencetak riwayat.

### C. Keamanan & Konvensi UX 
- **Atribut Form Autocomplete**: Registrasi dan Login tidak menggunakan atribut otomatisasi bawaan, memunculkan peringatan pada browser lokal. *Fix*: Menambahkan label `autocomplete="username"`, `"current-password"`, dan `"new-password"` pada file `auth.ejs` guna meningkatkan pengalaman pengguna (UX) bagi *password managers*.
- **Konfigurasi HTTP ke HTTPS**: Akses fungsi kamera (*Scanner QR*) di modern *browsers* wajib berjalan di atas Secure Context (HTTPS). Sistem disokong sertifikat mandiri (*self-signed localhost*) pada jalur *port* alternatif `3443`.
