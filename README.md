# NobNob

Aplikasi web untuk membantu UMKM mengelola konten TikTok, mulai dari menyusun ide sampai menjadwalkan dan memantau performa konten.

## Prasyarat

- Git
- Node.js `>=20.9.0` dan npm
- Akses ke repo GitHub dan konfigurasi Supabase pengembangan dari Mada

## Setup lokal

1. Clone repo dan masuk ke folder proyek.

   ```bash
   git clone https://github.com/Mazees/nobnob-ai.git
   cd nobnob-ai
   npm ci
   ```

2. Salin `.env.example` ke `.env.local` di root proyek.

   ```powershell
   Copy-Item .env.example .env.local
   ```

   Di macOS atau Linux, gunakan `cp .env.example .env.local`.

3. Isi `.env.local` dengan URL proyek dan publishable key Supabase pengembangan.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
   ```

   Simpan `.env.local` secara lokal. Gunakan `.env.example` untuk mencatat nama variabel yang dibutuhkan tim.

4. Jalankan server pengembangan.

   ```bash
   npm run dev
   ```

   Buka [localhost:3000](http://localhost:3000).

## Branch tim

Sebelum mulai mengerjakan tugas, pindah ke branch masing-masing (`dev-mada`, `dev-cleo`, atau `dev-novan`) dan ambil perubahan terbaru dengan `git pull origin staging`. Buka PR ke `staging` setelah tugas selesai dan diuji.

## CRUD Posts

Halaman `/dashboard/posts` memakai data Supabase dengan sesi pengguna dan whitelist aktif. Sebelum mencoba simpan, Mada perlu mereview lalu menjalankan `sql/posts_member_mutations.sql` setelah schema awal. SQL tambahan ini menyediakan izin dan policy INSERT, UPDATE, DELETE untuk anggota aktif. Jangan menjalankan ulang schema awal pada database yang sudah terisi.

Tahap ini memvalidasi format link video TikTok penuh. Kepemilikan video, statistik TikTok, prediksi baru, dan penyimpanan ide AI Studio menyusul.

## Pemeriksaan sebelum PR

```bash
npm run lint
npm run test
npm run build
npm run test:browser
```

`npm run test` menguji validasi, service Posts, dan policy RLS pada PostgreSQL lokal dalam memori (PGlite). `npm run test:browser` menjalankan aplikasi asli pada port 3101 serta fixture Auth/PostgREST lokal pada port 54329. Kedua pengujian tidak mengakses atau mengubah Supabase tim dan tidak memakai konfigurasi rahasia dari `.env.local`. Pastikan kedua port kosong. Browser test menggunakan Google Chrome; jika belum terpasang, pasang Chrome atau sesuaikan `channel` pada `playwright.config.mjs` dengan browser Playwright yang tersedia.

Pengujian pada Supabase tim dilakukan setelah SQL tambahan diterapkan dan akun Google sudah diberi akses. Cek buat, edit, jadwalkan, konfirmasi upload, hapus, serta reload dengan akun tersebut.
