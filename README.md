# Ada Transport Go

**Ada Transport Go** adalah sebuah ekosistem *Full-Stack* manajemen layanan transportasi darat modern. Platform ini menyediakan solusi holistik mulai dari sistem pemesanan (*booking*) travel antarkota, penyewaan kendaraan premium, hingga pemesanan paket pariwisata wisata secara dinamis dan antarmuka yang elegan.

---

## Fitur Utama

### Untuk Pelanggan (Public Facing)
*   **Antarmuka Responsif:** Desain UI/UX termutakhir penuh dengan animasi dinamis dan dukungan seluler (*Mobile-First*).
*   **Grid Interaktif Pemesanan:** Kartu visual untuk pemilihan Rute, Kendaraan, dan Destinasi Parawisata yang menyatu dengan *form* popup pintar.
*   **e-Ticket & Boarding Pass Otomatis:** Setelah sukses *booking*, pelanggan langsung menerima cetakan halaman tiket berdesain premium dilengkapi **QR Code**.
*   **Registrasi & Pengamanan Sesi:** Autentikasi ketat untuk mendaftarkan akun sebelum riwayat pesanan dicatat ke database.

### ⚙️ Untuk Administrator (Dashboard)
*   **Database Dinamis dengan Auto-Seeding:** Tidak perlu repot menata awal; sistem otomatis menyuntikkan (seeding) template rute & wisata ke Database MySQL yang kosong.
*   **Sistem Full CRUD via 1 Endpoint:** Admin dapat Menambah, Mengedit, dan Menghapus tiap moda transportasi langsung tanpa memecah logika struktur *backend*. (Disokong oleh injeksi URL Dinamis lokal `/edit/:type/:id`).
*   **Sistem Upload File Lokal (Multer):** Mengelola pertukaran media gambar secara mandiri dan aman.
*   **Kamera Scanner Terpasang (Dashboard-Ready):** Fitur pemindai QR Code mutakhir untuk konfirmasi tiket pelanggan cukup menggunakan kamera depan tanpa layanan aplikasi pihak ketiga!
*   **Pusat Kendali Pesan In-Box:** Membaca pesan langsung dari halaman *Contact Us*.

---

## Tech Stack & Ekosistem
Aplikasi ini dibangun menuruti konvensi *software architecture* tertinggi menggunakan:

- **Back-End:** Node.js, Express.js.
- **Front-End Rendering:** EJS (*Embedded JavaScript Templates*), HTML5, Vanilla JavaScript, Custom Flexible CSS.
- **Database:** MySQL 8 (*Connection Pooling & Pre-configured Schemas*).
- **Security:** `bcrypt` (Password Hashing), `express-session` (Access control).
- **Infrastruktur / Deployment:** Docker & Docker Compose *(Isolated multi-container microservice)*.

---

## Panduan Instalasi (Quick Start)

### Syarat Sistem
Pastikan Anda telah menginstal **[Docker Desktop / Docker Compose](https://www.docker.com/)** di PC atau mesin server Anda. Anda **tidak perlu** menginstal Node.js atau XAMPP secara manual! Seluruh ekosistem sudah dikarantinakan ke dalam kontainer.

### Cara Menjalankan Clone
1. Salin / Kloning repositori ini ke dalam komputer:
   ```bash
   git clone https://github.com/taufiqorrohman29/project-ada-transport-go.git
   ```
2. Ganti nama file `.env.example` menjadi `.env` lalu masukkan *Password Database* dan *Kunci Rahasia Sesi* Anda sesuka hati.
3. Buka Terminal/Console di folder ini, lalu ketik perintah sakti:
   ```bash
   docker compose up -d --build
   ```
4. Selesai! Web sudah tayang secara *Live*. Silakan buka browser Anda ke `http://localhost:3000`.

*(Opsional)*: Akun percontohan Admin akan otomatis tercipta setelah peluncuran. 
- **Email:** `admin@adago.com`
- **Password:** `<Password Rahasia Anda>`

---

## Potret Aplikasi (Screenshots)
*(Opsional: Unggah gambar asli web Anda ke folder `/public/image` di GitHub dan ganti nama file di bawah untuk memukau pengunjung profil Anda!)*

| Halaman Utama Web | Dasbor Panel Admin |
| :---: | :---: |
| ![Home](https://via.placeholder.com/400x250/800000/FFFFFF?text=Preview+Beranda) | ![Admin](https://via.placeholder.com/400x250/2E8B57/FFFFFF?text=Preview+Dashboard) |

---

## Pengembang & Lisensi

Proyek kolaboratif kelas tinggi **Ada Transport Go** 2026 dikembangkan oleh:

| Nama | Peran / Role |
| :--- | :--- |
| **Mochammad Fachry Maulana Abdillah** | Project Manager |
| **Taufiqorrohman** | Cyber Security & Full Stack Developer |
| **Ray'za Rahmadani Putri** | UI/UX Designer |
| **Novivka Indah Wulandari** | Frontend Developer |
| **Sovia Oktaviantika** | Backend Developer |
| **Queensha Alya Risty** | Mobile Developer |
| **Revina Ardiana Putri** | Data Analyst |

---
*© 2026 Ada Transport Go. All rights reserved.*