<x-mail::message>
# Banijya Shop

Halo **{{ $order->user->name }}**,

@php
    $messages = [
        'paid' => 'Pembayaran untuk pesanan kamu telah kami terima. Pesanan sedang disiapkan.',
        'processing' => 'Pesanan kamu sedang diproses oleh tim kami.',
        'shipped' => 'Pesanan kamu telah dikirim dan sedang dalam perjalanan.',
        'delivered' => 'Pesanan kamu telah sampai tujuan. Terima kasih telah berbelanja di Banijya Shop!',
    ];
@endphp

{{ $messages[$status] ?? 'Status pesanan kamu telah diperbarui.' }}

<x-mail::panel>
Nomor Pesanan: **{{ $order->order_number }}**<br>
Status Baru: **{{ ucfirst($status) }}**
</x-mail::panel>

@if ($status === 'shipped' && $note)
## Info Pengiriman

{{ $note }}
@endif

**Total Pesanan: Rp{{ number_format((float) $order->total_amount, 0, ',', '.') }}**

<x-mail::button :url="route('checkout.success', $order)">
Lihat Detail Pesanan
</x-mail::button>

Salam,<br>
Banijya Shop
</x-mail::message>
