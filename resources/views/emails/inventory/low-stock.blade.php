<x-mail::message>
# Peringatan Stok Rendah

Produk berikut sudah mencapai atau berada di bawah ambang batas stok rendah:

<x-mail::panel>
**{{ $product->name }}** (SKU: {{ $product->sku }})<br>
Stok saat ini: **{{ $product->stock }}**<br>
Ambang batas stok rendah: **{{ $threshold }}**
</x-mail::panel>

Mohon segera lakukan restock agar produk ini tidak kehabisan stok.

<x-mail::button :url="route('admin.inventory.index')">
Buka Halaman Inventory
</x-mail::button>

Salam,<br>
Banijya Shop
</x-mail::message>
