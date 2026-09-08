<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class OrderService
{
    private const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

    public function createFromCart(User $user, array $shippingAddress): Order
    {
        return DB::transaction(function () use ($user, $shippingAddress) {
            $cart = $user->cart()->with('items.product')->lockForUpdate()->first();

            if (! $cart || $cart->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang kamu masih kosong.',
                ]);
            }

            $lockedProducts = $cart->items->mapWithKeys(function ($cartItem) {
                return [$cartItem->product_id => Product::query()
                    ->whereKey($cartItem->product_id)
                    ->lockForUpdate()
                    ->firstOrFail()];
            });

            $stockErrors = [];
            foreach ($cart->items as $cartItem) {
                $product = $lockedProducts[$cartItem->product_id];

                if ($cartItem->quantity > $product->stock) {
                    $stockErrors["items.{$cartItem->product_id}"] = "Stok {$product->name} tidak mencukupi. Tersedia {$product->stock}, di keranjang {$cartItem->quantity}.";
                }
            }

            if ($stockErrors) {
                throw ValidationException::withMessages($stockErrors);
            }

            $order = $user->orders()->create([
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'total_amount' => $cart->items->sum(fn ($item) => (float) $item->price_snapshot * $item->quantity),
                'shipping_address' => $this->formatShippingAddress($shippingAddress),
            ]);

            foreach ($cart->items as $cartItem) {
                $order->items()->create([
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price_snapshot' => $cartItem->price_snapshot,
                    'subtotal' => (float) $cartItem->price_snapshot * $cartItem->quantity,
                ]);
            }

            $order->statusHistories()->create([
                'status' => 'pending',
                'note' => 'Pesanan dibuat dari checkout.',
            ]);

            $cart->items()->delete();

            return $order;
        });
    }

    public function updateStatus(Order $order, string $newStatus): Order
    {
        if (! in_array($newStatus, self::STATUSES, true)) {
            throw new RuntimeException("Status order tidak valid: {$newStatus}.");
        }

        return DB::transaction(function () use ($order, $newStatus) {
            $lockedOrder = Order::query()->whereKey($order->id)->lockForUpdate()->firstOrFail();
            $currentIndex = array_search($lockedOrder->status, self::STATUSES, true);
            $newIndex = array_search($newStatus, self::STATUSES, true);

            if ($currentIndex === false || $newIndex !== $currentIndex + 1) {
                throw new RuntimeException("Transisi status {$lockedOrder->status} ke {$newStatus} tidak valid.");
            }

            if ($newStatus === 'paid') {
                $this->deductStock($lockedOrder);
            }

            $lockedOrder->update(['status' => $newStatus]);
            $lockedOrder->statusHistories()->create([
                'status' => $newStatus,
                'note' => $newStatus === 'paid' ? 'Pembayaran disimulasikan berhasil.' : null,
            ]);

            return $lockedOrder->fresh(['items.product', 'statusHistories']);
        });
    }

    private function deductStock(Order $order): void
    {
        $items = $order->items()->get();
        $products = $items->mapWithKeys(fn ($item) => [
            $item->product_id => Product::query()->whereKey($item->product_id)->lockForUpdate()->firstOrFail(),
        ]);
        $stockErrors = [];

        foreach ($items as $item) {
            $product = $products[$item->product_id];
            if ($item->quantity > $product->stock) {
                $stockErrors["items.{$item->product_id}"] = "Stok {$product->name} tidak mencukupi untuk pembayaran. Tersedia {$product->stock}, dibutuhkan {$item->quantity}.";
            }
        }

        if ($stockErrors) {
            throw ValidationException::withMessages($stockErrors);
        }

        foreach ($items as $item) {
            $products[$item->product_id]->decrement('stock', $item->quantity);
        }
    }

    private function generateOrderNumber(): string
    {
        do {
            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.strtoupper(bin2hex(random_bytes(2)));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }

    private function formatShippingAddress(array $shippingAddress): string
    {
        return "Nama penerima: {$shippingAddress['recipient_name']}\n".
            "No. telepon: {$shippingAddress['phone']}\n".
            "Alamat: {$shippingAddress['shipping_address']}";
    }
}