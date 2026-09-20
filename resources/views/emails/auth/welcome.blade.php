<x-mail::message>
# Selamat Datang di Banijya Shop

Halo **{{ $user->name }}**,

Terima kasih sudah mendaftar di Banijya Shop! Akun kamu sudah aktif dan siap digunakan untuk belanja.

<x-mail::button :url="route('dashboard')">
Mulai Belanja
</x-mail::button>

Kalau ada pertanyaan, cukup balas email ini.

Salam,<br>
Banijya Shop
</x-mail::message>
