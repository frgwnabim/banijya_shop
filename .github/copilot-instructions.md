# Project Context & Rules — E-Commerce Web App

## 1. Ringkasan Project
**Nama brand: Banijya Shop**

Website e-commerce full-stack dengan dua sisi utama:
- **Customer**: browse, search, filter, sort produk, detail produk, cart, wishlist, checkout, order history, reviews.
- **Admin**: product management, inventory, orders, users, discounts, sales dashboard.

Dikerjakan bertahap per-fitur (satu prompt = satu fitur), jadi konsistensi lintas prompt WAJIB dijaga sesuai aturan di file ini.

## 2. Tech Stack (JANGAN diganti tanpa instruksi eksplisit)
- Backend: **Laravel** (PHP, versi stable terbaru)
- Frontend: **React** via **Inertia.js** (bukan REST API + SPA terpisah)
- Database: **PostgreSQL**
- Cache & Queue: **Redis**
- CSS: **Tailwind CSS**
- Auth scaffolding: **Laravel Breeze** (stack Inertia + React)
- (Opsional lanjutan) Deployment: Docker + Nginx + CI/CD

## 3. Struktur Folder Baku
```
app/
  Models/
  Http/
    Controllers/
      Admin/        <- semua controller khusus admin masuk sini
      Customer/      <- opsional, kalau mau pisah dari default
    Requests/
  Services/         <- business logic kompleks (mis. checkout, stok)
resources/
  js/
    Pages/
      Admin/
      Customer/
    Components/
    Layouts/
database/
  migrations/
  seeders/
routes/
  web.php
  admin.php          <- kalau routes admin dipisah
```

## 4. Konvensi Penamaan
- Model: singular, PascalCase (`Product`, `OrderItem`)
- Tabel: plural, snake_case (`products`, `order_items`)
- Controller: `{Model}Controller` (`ProductController`)
- Inertia page: PascalCase, sesuai fitur (`Products/Index.jsx`, `Admin/Dashboard.jsx`)
- Route name: kebab-case dengan prefix area (`admin.products.index`, `customer.cart.show`)

## 5. Aturan Order State Machine
Status order HARUS mengikuti alur linear ini, tidak boleh loncat:
```
Pending → Paid → Processing → Shipped → Delivered
```
Setiap transisi status harus divalidasi di backend (tidak bisa langsung Pending → Shipped, dsb). Simpan riwayat perubahan status kalau memungkinkan (order_status_histories).

## 6. Aturan Stok/Inventory
- Pengurangan stok terjadi saat order masuk status **Paid** (bukan saat Pending / add to cart).
- Validasi stok tersedia sebelum checkout berhasil.
- Stok tidak boleh minus.

## 7. Aturan Keamanan
- Semua route admin WAJIB pakai middleware role/permission check (bukan hanya `auth`).
- Semua input form pakai Form Request class untuk validasi, jangan validasi manual di controller.
- Jangan expose data sensitif (harga cost, data user lain) ke response customer.

## 8. Aturan Coding per-Prompt
- Setiap prompt fitur **hanya boleh** mengerjakan scope yang diminta di prompt itu — jangan sekalian bikin fitur lain yang belum diminta.
- Kalau ada dependency ke fitur yang belum ada (misal fitur cart butuh Product), buat asumsi minimal (stub/interface) dan sebutkan di ringkasan akhir, jangan bangun fitur penuh di luar scope.
- Setiap prompt harus diakhiri dengan ringkasan: apa yang dibuat, file apa saja yang berubah, dan asumsi yang diambil.

## 9. Styling
- Semua UI pakai Tailwind utility classes, hindari custom CSS kecuali benar-benar perlu.
- Konsisten pakai komponen reusable dari `resources/js/Components` (Button, Input, Modal, dll) — jangan duplikasi style tiap halaman.

## 10. Bonus/Integrasi Lanjutan (dikerjakan belakangan, urutan disarankan)
1. Payment gateway sandbox
2. Email notification
3. Redis caching
4. Background jobs/queue
5. Image storage
6. Product recommendation
7. Docker + Nginx
8. CI/CD

## 11. Definition of Done per Fitur
- jalankan `php artisan serve` + `npm run dev` tanpa error
- Fitur berjalan tanpa error di `php artisan serve` + `npm run dev`
- Ada validasi input dasar (kalau relevan)
- Konsisten dengan struktur folder & penamaan di atas
- Tidak menyentuh/merusak fitur yang sudah dibuat di prompt sebelumnya
