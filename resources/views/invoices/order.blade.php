<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; color: #1e293b; }
        h1 { color: #b45309; margin-bottom: 0; }
        .muted { color: #64748b; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; }
        th { background-color: #fef3c7; }
        .totals td { border: none; padding: 2px 8px; }
        .text-right { text-align: right; }
    </style>
</head>
<body>
    <h1>Banijya Shop</h1>
    <p class="muted">Invoice Pesanan</p>

    <p>
        <strong>No. Pesanan:</strong> {{ $order->order_number }}<br>
        <strong>Tanggal:</strong> {{ $order->created_at?->format('d M Y H:i') }}<br>
        <strong>Pelanggan:</strong> {{ $order->user->name }} ({{ $order->user->email }})
    </p>

    <p class="muted">{{ $order->shipping_address }}</p>

    <table>
        <thead>
            <tr>
                <th>Produk</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga</th>
                <th class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($order->items as $item)
                <tr>
                    <td>{{ $item->product->name ?? 'Produk' }}</td>
                    <td class="text-right">{{ $item->quantity }}</td>
                    <td class="text-right">Rp{{ number_format((float) $item->price_snapshot, 0, ',', '.') }}</td>
                    <td class="text-right">Rp{{ number_format((float) $item->subtotal, 0, ',', '.') }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        @if ($order->discount_amount > 0)
            <tr>
                <td class="text-right" colspan="3">Diskon</td>
                <td class="text-right">-Rp{{ number_format((float) $order->discount_amount, 0, ',', '.') }}</td>
            </tr>
        @endif
        <tr>
            <td class="text-right" colspan="3"><strong>Total</strong></td>
            <td class="text-right"><strong>Rp{{ number_format((float) $order->total_amount, 0, ',', '.') }}</strong></td>
        </tr>
    </table>

    <p class="muted">Terima kasih telah berbelanja di Banijya Shop.</p>
</body>
</html>
