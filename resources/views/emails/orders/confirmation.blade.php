<x-mail::message>
# Banijya Shop

Halo **{{ $order->user->name }}**,

Terima kasih! Pesanan kamu dengan nomor **{{ $order->order_number }}** telah berhasil dibuat dan sedang menunggu pembayaran.

<x-mail::panel>
Status saat ini: **Pending**
</x-mail::panel>

## Ringkasan Pesanan

<x-mail::table>
| Produk | Qty | Subtotal |
| :----- | :-: | -------: |
@foreach ($order->items as $item)
| {{ $item->product->name ?? 'Produk' }} | {{ $item->quantity }} | Rp{{ number_format((float) $item->subtotal, 0, ',', '.') }} |
@endforeach
</x-mail::table>

**Total: Rp{{ number_format((float) $order->total_amount, 0, ',', '.') }}**

Alamat pengiriman:
{{ $order->shipping_address }}

<x-mail::button :url="route('checkout.success', $order)">
Lihat Detail Pesanan
</x-mail::button>

Terima kasih telah berbelanja di Banijya Shop.

Salam,<br>
Banijya Shop
</x-mail::message>
