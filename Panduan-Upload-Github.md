# 🚀 Panduan Lengkap (Walkthrough) Upload Project ke GitHub Pertama Kali

Panduan ini dibuat khusus untuk Anda yang baru pertama kali melakukan *Push* proyek "Ada Transport Go" ke GitHub secara manual. Mari kita lakukan langkah demi langkah dengan aman.

---

## Persiapan Wajib (Pembersihan Keamanan)
Sebelum kita mengirim kode ke publik, pastikan Anda **TIDAK** mengirim beban berat bernama `node_modules` dan file *password* rahasia.
1. Pastikan di dalam folder `project-ada-transport-go` sudah ada file rahasia bernama `.gitignore`.
2. Hapus file bernama `.env` asli (yang menyimpan sandi database sungguhan Anda), pastikan yang tersisa hanya `.env.example` *(Halaman contoh kosong)*.

---

## Langkah-Langkah (Ikuti Secara Berurutan di Terminal)

### Langkah 1: Buka Terminal di Lokasi yang Tepat
Pastikan Anda mengeksekusi perintah di *Terminal/Command Prompt* dengan posisi sudah di dalam folder sasaran:
```bash
cd /home/nakamura/pweb/project-ada-transport-go
```

### Langkah 2: Inisialisasi Git (Bila Belum)
Ketik penanda bahwa folder ini kini diawasi oleh mesin Git:
```bash
git init
```

### Langkah 3: Bungkus Semua File
Ketik perintah ini untuk merekam semua status kode, file EJS, Docker, dll untuk dibungkus ke dalam *draft*. (Tanda titik memaksudkan *semua file*):
```bash
git add .
```

git config
git config --global user.name "taufiqorrohman29"
git config --global user.email "email.akun.github@anda.com"

git config pull.rebase false
### Langkah 4: Berikan Stempel Pesan (Commit)
*Commit* ibarat memberi nama pada paket pengiriman Anda.
```bash
git commit -m "Rilis Perdana Sistem Full-Stack Ada Transport Go (Aman dari Bug)"
```

### Langkah 5: Pastikan Nama Cabang adalah 'main'
Secara default Git membuat cabang `master`, namun GitHub mensyaratkan `main`. Ubah dengan perintah:
```bash
git branch -M main
```

### Langkah 6: Sambungkan dengan Tautan Repo GitHub Anda
Perintah ini mengajari folder lokal Anda tentang keberadaan tautan GitHub Anda di internet:
```bash
git remote add origin https://github.com/taufiqorrohman29/project-ada-transport-go.git
```
*(Apabila muncul tulisan `error: remote origin already exists`, Anda bisa abaikan langkah ini)*

git pull origin main --allow-unrelated-histories

### Langkah 7: Proses Peluncuran Eudaimonik (Push)
Ini adalah eksekusi pamungkas yang menyuruh komputer menembakkan kode Anda secara *Live*:
```bash
git push -u origin main
```

---

## 🎯 Verifikasi Keberhasilan
Begitu perintah di Langkah 7 selesai *(Loading berhasil 100%)*, buka *browser* Anda dan kunjungi tautan:  
**https://github.com/taufiqorrohman29/project-ada-transport-go**

Jika seluruh *folder* (seperti `routes`, `views`, `docker-compose.yml`) telah tampil membentang di layar GitHub tersebut, selamat—misi Anda sukses besar! Proyek Anda resmi mengudara sebagai jejak rekam portofolio profesional! 🥳
