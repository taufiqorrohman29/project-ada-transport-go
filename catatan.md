# 📘 Ensiklopedia Arsitektur Master "Ada Transport Go"

Selamat datang di pedoman mutlak arsitektur **Ada Transport Go**. Sesuai dengan spesifikasi pengembangan tingkat lanjut, dokumen ini ditulis menyerupai "Master Manual" dari seorang *Senior Software Architect* untuk mendedah, membedah, dan menguraikan fungsi **SETIAP** komponen krusial yang membangun ekosistem aplikasi ini secara utuh. 

Sistem ini didesain menggunakan pola desain MVC hibrida dengan Express.js (*Backend*), EJS (*Server-Side Rendering Front-End*), MySQL (*Database*), dan arsitektur *Containerized* (Docker).

---

## 🏗️ BAB 1: Lapisan Akar & Infrastruktur (Root & Docker)

Lapisan akar adalah komponen yang mengatur bagaimana aplikasi hidup di dalam lingkungan server.

### 1. `server.js` (Otak Utama Eksekusi)
Ini adalah "Jantung" (*Entry Point*) aplikasi Node.js Anda.
* **Fungsi:** Menginisialisasi *Express*, menyetel mesin *EJS*, memasang *middleware* wajib (parsing JSON, Cookie parser, Express Session), dan meregistrasi semua kabel sirkuit rute (`routes/`).
* **Snippet Penting:**
  ```javascript
  const session = require('express-session');
  // Sesi diciptakan untuk "mengingat" mesin siapa yang sedang login.
  app.use(session({
      secret: process.env.SESSION_SECRET || 'secret-key',
      resave: false,
      saveUninitialized: false,
  }));
  // Menyambungkan sirkuit rute
  const indexRoutes = require('./routes/index');
  app.use('/', indexRoutes); // Melempar semua request '/' ke file index.js
  ```

### 2. `docker-compose.yml` & `Dockerfile` (Bungkus Karantina Server)
Mencegah fenomena "Di komputer saya jalan, tapi pas di-hosting error".
* **`Dockerfile`:** Instruksi untuk memasang Node.js, me-copy `package.json`, dan menjalankan `npm install` dalam membangun *Image* steril.
* **`docker-compose.yml`** (Orkestrasi): Menghidupkan *database* (`db`) secara terisolasi bersamaan dengan server web (`app`). Berperan mem- *binding* `port 3000` dan mengikat `adago_db_data` sebagai gudang abadi database walau laptop mati.

---

## 🗄️ BAB 2: Lapisan Model & Data (Models)

### 1. `models/db.js` (Saraf Pusat Database & Seeding)
Inilah yang menghubungkan Node.js dengan instansi MySQL yang berjalan di dalam Docker.
* **Fungsi 1 (Pool Connection):** Menyetel kumpulan koneksi (Pool) agar website tangguh menerima banyak klik bersamaan tanpa macet (*bottleneck*).
* **Fungsi 2 (Auto-Seed / Penyuntikan Bawaan):** Sebuah fitur brilian di mana jika ia mendeteksi tabel masih kosong secara harafiah, ia akan mengeksekusi struktur `INSERT INTO` masif.
* **Snippet Penting:**
  ```javascript
  const [vRows] = await pool.query("SELECT * FROM vehicles");
  if (vRows.length === 0) { // Cek apakah tabel kosong?
      // Injeksi mutlak data mentah pertama kali sistem dihidupkan
      await pool.query("INSERT INTO vehicles (name, capacity, price, image) VALUES ('Toyota Hiace', '15 seat', 800000, '/imagebooking2/Toyota-hiace.jpg')");
  }
  ```

---

## 🚦 BAB 3: Sirkuit Logika / Controllers (`routes/`)

Ini adalah stasiun stasiun yang menangkap tautan (*URL*) yang diketik pengunjung.

### 1. `routes/index.js` (Sirkuit Publik)
* **Fungsi:** Menangani halaman-halaman yang boleh dilihat semua orang. (Beranda, Booking, Destinasi, dsb).
* **Fitur Krusial:** Saat me-render `/booking`, ia tidak hanya mengirim halaman kosong, tapi ia menarik tabel dari `db.js` dan melemparnya ke file EJS agar langsung tergambar di layar.

### 2. `routes/auth.js` (Pengamanan & Kredensial)
* **Fungsi:** Mengurusi Pendaftaran, Login, dan Logout.
* **Teknologi Kunci:** Menggunakan modul `bcrypt` untuk mengubah password '<PASSWORD_ADMIN_DEFAULT_ANDA>' menjadi stringacak rahasia (Hash).
  ```javascript
  // Contoh Komparasi:
  const match = await bcrypt.compare(passwordDariUser, passwordEnkripsiDiDatabase);
  if (!match) return res.render('auth', { message: "Password salah." });
  ```

### 3. `routes/api.js` (Pusat Aksi Transaksi)
* **Fungsi:** Menerima pengiriman logika "Ghaib" (AJAX) seperti konfirmasi pemesanan (Booking Submission) atau data kontak usulan pengunjung.

### 4. `routes/admin.js` (Markas Besar Dasbor CRUD)
* **Fungsi:** Ruang kendali eksklusif yang dilindungi *middleware* pencegat `checkAdmin`.
* **Sistem File Upload (Multer):** Menangkap file foto dari form Admin, mengganti namanya agar tidak bentrok, memindahkannya ke `/public/uploads`, lalu menyerahkan `path`-nya ke MySQL.
* **Endpoint Universal:**
  ```javascript
  router.post('/delete/:type/:id', async (req, res) => {
      // Endpoint super-fleksibel. Apapun ':type' nya (vehicles, tourism), query SQL akan menyesuaikan secara dinamis.
      await pool.query(`DELETE FROM ${req.params.type} WHERE id = ?`, [req.params.id]);
  });
  ```

---

## 🎭 BAB 4: Layar Tampilan Muka / Presentation (`views/`)

Folder ini berisi file `.ejs` (Template HTML bertenaga).

### 1. Templating (`views/layouts/`)
* **`header.ejs` & `footer.ejs`:** Dibangun terpisah karena navigasi tampil di semua halaman. Ketika User masuk, `header.ejs` akan mengevaluasi kepingan `<% if(user) %>` untuk menampilkan ikon Gembok/Profil bukan tulisan 'Login'.
* **Logika Interaksi (Hamburger):** Javascript mendeteksi `nav-link` lalu mematikannya (Close). Kita juga memasang perbaikan pengecualian dengan `:not(#nav-login-btn)` agar Dropdown profil aman diklik tanpa menutup navigasi besar HP.

### 2. Tampilan Menu Publik (`views/home.ejs`, `booking.ejs`, `layanan.ejs`, dll)
* Mengambil data `vehicles` dari *Router* dan mengubahnya menjadi *Grid Cards*.
* Di file `booking.ejs`, sistem mengeksploitasi data EJS menjadi parameter HTML (*data-route*, *data-price*) sehingga ketika Card ditekan, form pemesanan otomatis membaca harga.

### 3. Ekosistem Admin (`views/admin/`)
* **`dashboard.ejs`:** Etalase Grid untuk Kendaraan, Wisata, dan Rute. Terdapat fitur HTML kustom untuk mencetak Tombol Aksi `Hapus` & `Edit` merujuk langsung dengan Parameter URL `/delete/vehicles/<id_kendaraan>`.
* **`edit-service.ejs`:** Ruang form Dinamis. Hanya dengan struktur EJS khusus (`<% if(type === 'vehicles') %>`), layar ini sanggup ber-metamorfosis menjadi form mobil ATAU form wisata menyesuaikan dari *URL* yang dipicu.
* **`messages.ejs`:** Tabel sederhana pembaca kotak saran dan kontak pengguna.

### 4. Ekosistem Personal (`profile.ejs`, `ticket.ejs`)
* File tiket ini memproduksi bukti bayar yang dinamis menggunakan *library* QRCode otomatis dari server.

---

## 🎨 BAB 5: Mesin Frontend Statis (`public/`)

File ini dilepaskan langsung ke klien/browser pengunjung tanpa campur tangan mesin backend Node.

### 1. `public/style.css`
Pusat pengendalian estetika. Desain UI dibuat *Responsive* menggunakan teknik Flexbox dan Media Queries (`@media (max-width: 768px)`).

### 2. `public/script.js` (DOM Interactivity)
Berbeda dengan Node.js (yang berjalan di mesin server Docker), file ini didownload oleh laptop tamu dan dijalankan di layarnya sendiri. 
* **Fungsi:** Memunculkan Pop-Up Modal pembayaran, mendeteksi pertambahan huruf, menghitung Total Pembayaran Penumpang, memindai aksi di kamera melalui pustaka HTML5-QRCode scanner Admin, dsb.

---

## 📘 Kesimpulan & Rekomendasi
Sistem ini dibuat solid karena berhasil memisahkan tanggung jawab secara absolut:
- MySQL (**Data**)
- Node/Express (**Polisi & Pengantar Logika**)
- EJS (**Buku Gambar**)
- Multer (**Pengangkut File**) 
- Docker (**Pelindung Ekosistem**)

Dengan pemahaman manual ensiklopedia ini, Anda memiliki kendali mental dan teknis 100% untuk memodifikasi apa pun di dalam kerangka struktur yang dibangun. Selamat mengembangkan karya tingkat lanjut ini! 💯
