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
