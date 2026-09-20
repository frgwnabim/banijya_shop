# Ecommerce

Fondasi aplikasi e-commerce full-stack. Project ini berisi Laravel dengan React melalui Inertia.js, autentikasi Laravel Breeze, serta konfigurasi PostgreSQL dan Redis. Fitur bisnis seperti produk, cart, order, dan inventory belum dibuat.

## Stack

- Laravel 12
- PHP 8.2+
- React + Inertia.js
- Vite + Tailwind CSS
- PostgreSQL
- Redis melalui `predis/predis`
- MinIO (S3-compatible object storage, untuk gambar produk)
- Laravel Breeze (Inertia + React)

## Instalasi

1. Pastikan PHP, Composer, Node.js/npm, PostgreSQL, dan Redis tersedia.
2. Salin `.env.example` menjadi `.env` jika file `.env` belum ada.
3. Sesuaikan `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, dan kredensial Redis pada `.env`.
4. Jalankan:

```bash
composer install
php artisan key:generate
npm install
php artisan migrate
npm run build
```

PHP harus memuat extension `pdo_pgsql`. Redis harus aktif pada host dan port yang tercantum di `.env` sebelum cache, queue, dan halaman auth digunakan.

Untuk development, jalankan dua terminal:

```bash
php artisan serve
npm run dev
```

Buka `http://localhost:8000`. Halaman login dan register tersedia melalui route Breeze.

## Queue worker & scheduler (background jobs)

Email notification (order confirmation, status update, welcome, low stock alert) dan job
background (invoice PDF, recalculate rating, cleanup cart kadaluarsa) diproses lewat Redis
queue (`QUEUE_CONNECTION=redis`). Redis dipakai untuk dua keperluan berbeda dengan index
database terpisah supaya tidak saling bentrok:

- **Queue** → koneksi Redis `default`, `REDIS_DB=0` (lihat `REDIS_QUEUE_CONNECTION=default` di `.env`).
- **Cache** → koneksi Redis `cache`, `REDIS_CACHE_DB=1` (lihat `REDIS_CACHE_DB` di `.env`).

Job-job dikelompokkan ke beberapa queue name agar mudah diprioritaskan:

- `default` — event listener notifikasi email (order confirmation, status update, welcome, low stock) dan `RecalculateProductRatingJob`.
- `invoices` — `GenerateOrderInvoiceJob` (generate PDF invoice).
- `maintenance` — `CleanupExpiredCartsJob` (cleanup cart abandoned, dijadwalkan harian).

Jalankan worker di terminal terpisah selama development:

```bash
php artisan queue:work redis --queue=default,invoices,maintenance --tries=3
```

Jalankan scheduler (untuk `CleanupExpiredCartsJob` yang jalan harian jam 02:00) dengan:

```bash
php artisan schedule:work
```

Job yang gagal setelah 3 kali percobaan akan masuk ke tabel `failed_jobs`. Lihat daftarnya
dengan `php artisan queue:failed`, retry dengan `php artisan queue:retry all`, atau hapus
dengan `php artisan queue:flush`.

## Cloud storage untuk gambar produk (MinIO)

Upload gambar produk (Admin > Produk) disimpan di disk `product_images`, sebuah disk S3-compatible
(`config/filesystems.php`), bukan lagi di `storage/app/public`. Untuk development lokal dipakai
**MinIO** (self-hosted S3-compatible, jalan via Docker, gratis, tidak perlu akun/API token
eksternal seperti Cloudflare R2) — pilihan ini paling cepat untuk setup lokal tanpa dependensi
jaringan luar.

Jalankan MinIO lokal via Docker:

```bash
docker run -d --name banijya-minio -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

Lalu buka `http://127.0.0.1:9001` (login `minioadmin`/`minioadmin`) dan buat bucket bernama
`banijya-product-images` (harus cocok dengan `AWS_BUCKET` di `.env`). Nilai default di
`.env`/`.env.example` (`AWS_ENDPOINT=http://127.0.0.1:9000`, `AWS_USE_PATH_STYLE_ENDPOINT=true`,
kredensial `minioadmin`/`minioadmin`) sudah cocok dengan perintah Docker di atas — tidak perlu
diubah untuk development lokal.

Untuk production, ganti nilai `AWS_*` dengan kredensial Cloudflare R2 (atau AWS S3 asli) —
kode aplikasi tidak perlu berubah karena semuanya lewat konfigurasi `.env`.

Resize/compress gambar otomatis (max width 1200px untuk gambar utama, 300px untuk thumbnail
listing, tanpa upscale gambar kecil) memakai `intervention/image` dengan driver GD. Pastikan
extension `gd` aktif di `php.ini` (`extension=gd`, tidak dikomentari).

## Struktur utama

```text
app/
  Http/Controllers/
  Http/Requests/
  Models/
database/
  migrations/
  seeders/
resources/js/
  Components/
  Layouts/
  Pages/
routes/
  web.php
```

Migration bawaan Laravel untuk user, session, cache, dan queue tetap dipertahankan. Tidak ada migration atau model untuk entitas bisnis.<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
