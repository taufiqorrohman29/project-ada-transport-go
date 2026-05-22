# Ada Transport Go

Sistem Informasi Transportasi dan Pemesanan Kendaraan berbasis Web yang dibangun dengan **Node.js (Express)**, **EJS**, dan **MySQL**. Proyek ini mendukung manajemen pemesanan secara dinamis untuk Kendaraan Pribadi, Perjalanan Antar Kota, dan Paket Pariwisata.

## Fitur Utama
- **Landing Page Interaktif**: Menampilkan daftar armada dan paket layanan (Antar Kota & Pariwisata) yang dikelola langsung dari database.
- **Sistem Pemesanan (Booking)**: Formulir pemesanan kendaraan lengkap.
- **QR Scanner Integrasi**: Mendukung penggunaan kamera untuk keperluan pemindaian QR.
- **Admin Dashboard**: Panel admin (terlindungi *session*) untuk mengelola:
  - Pesanan pelanggan
  - Kendaraan dan harga
  - Rute antar kota dan paket pariwisata
  - Pesan masuk (Inbox)
- **Deployment-Ready**: Sepenuhnya di-Docker-isasi menggunakan Docker Compose (Node App, MySQL, Nginx Proxy).

## Teknologi yang Digunakan
- **Backend**: Node.js, Express.js
- **Frontend**: EJS (Templating Engine), CSS/HTML
- **Database**: MySQL 8.0 (`mysql2/promise`)
- **Keamanan**: `bcrypt` (Hashing), `express-session`, `jsonwebtoken`
- **Upload File**: `multer`
- **Infrastruktur**: Docker, Docker Compose, Nginx (Reverse Proxy + SSL)

## Prasyarat
Untuk menjalankan proyek ini di lingkungan lokal Anda (Windows/Mac/Linux), pastikan Anda telah menginstal:
- [Docker Desktop / Engine](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

## Cara Menjalankan (Sangat Disarankan via Docker)

Penggunaan Docker akan memastikan lingkungan (*environment*) proyek ini selalu stabil dan konsisten, terlepas dari OS apa yang Anda gunakan.

1. **Clone repository ini**
   ```bash
   git clone https://github.com/taufiqorrohman29/project-ada-transport-go-privat.git
   cd project-ada-transport-go-privat
   ```

2. **Jalankan Docker Compose**
   Perintah ini akan melakukan *build image* Node.js Anda dan menyalakan seluruh servis (App, Database, dan Proxy) di *background*.
   ```bash
   docker-compose up --build -d
   ```

3. **Inisialisasi Otomatis (Tunggu Sejenak)**
   Pada saat *pertama kali* dijalankan, kontainer MySQL memerlukan waktu sekitar 30-45 detik untuk inisialisasi *storage*. Aplikasi Node.js dirancang untuk otomatis menunggu (*retry* hingga 15 kali) hingga database siap. Begitu siap, tabel dan *seed data* akan dibuat secara otomatis.

4. **Akses Aplikasi**
   Setelah semua log menyatakan sukses, buka web browser Anda di:
   - HTTP (Aplikasi Node): `http://localhost:3000`
   - HTTPS (Nginx Proxy): `https://localhost:3443`

## Akses Akun Admin
Secara otomatis, sistem akan membuatkan (*seed*) satu akun administrator utama saat aplikasi pertama kali terhubung ke basis data:
- **Email**: `admin@adago.com`
- **Password**: `admin123`
*(Catatan: Anda dapat login melalui rute/tombol login di pojok kanan atas)*

## Catatan Lintas Platform (Windows & Linux)
- Folder `node_modules` sengaja diletakkan di `.gitignore` untuk mencegah tabrakan *binary file* (contohnya library `bcrypt`) antara sistem operasi Windows dan Linux.
- Anda tidak perlu menjalankan `npm install` secara manual di Windows Anda. Biarkan Docker yang menangani semua instalasi modul di dalam kontainer berbasis Alpine Linux.
