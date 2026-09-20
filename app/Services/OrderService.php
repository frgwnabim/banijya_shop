<?php

namespace App\Services;

use App\Events\OrderStatusUpdated;
use App\Models\Cart;
use App\Models\Discount;
use App\Models\DiscountUsage;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class OrderService
{
    private const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

    public function createFromCart(User $user, array $shippingAddress, ?string $discountCode = null): Order
    {
        return DB::transaction(function () use ($user, $shippingAddress, $discountCode) {
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

            $subtotal = (float) $cart->items->sum(fn ($item) => (float) $item->price_snapshot * $item->quantity);

            $discount = null;
            $discountAmount = 0.0;

            if ($discountCode) {
                $discount = $this->validateDiscount($discountCode, $user, $subtotal);
                $discountAmount = $this->calculateDiscountAmount($discount, $subtotal);
            }

            $order = $user->orders()->create([
                'order_number' => $this->generateOrderNumber(),
                'status' => 'pending',
                'total_amount' => max(0, $subtotal - $discountAmount),
                'discount_id' => $discount?->id,
                'discount_amount' => $discountAmount,
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

            if ($discount) {
                $order->discountUsage()->create([
                    'discount_id' => $discount->id,
                    'user_id' => $user->id,
                    'used_at' => now(),
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

    public function updateStatus(Order $order, string $newStatus, ?string $note = null): Order
    {
        if (! in_array($newStatus, self::STATUSES, true)) {
            throw new RuntimeException("Status order tidak valid: {$newStatus}.");
        }

        $previousStatus = $order->status;

        $updatedOrder = DB::transaction(function () use ($order, $newStatus, $note) {
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
                'note' => $note ?? ($newStatus === 'paid' ? 'Pembayaran disimulasikan berhasil.' : null),
            ]);

            return $lockedOrder->fresh(['items.product', 'statusHistories']);
        });

        // Notification is a side effect of the (already committed) status change, not a condition for it.
        event(new OrderStatusUpdated($updatedOrder, $previousStatus, $newStatus, $note));

        if ($newStatus === 'paid') {
            // Checked after commit so queued low-stock alert jobs never race the transaction.
            $updatedOrder->items->each(fn ($item) => StockAlertService::evaluate($item->product->fresh()));
        }

        return $updatedOrder;
    }

    public static function statuses(): array
    {
        return self::STATUSES;
    }

    public function nextStatus(string $status): ?string
    {
        $index = array_search($status, self::STATUSES, true);

        if ($index === false || $index === count(self::STATUSES) - 1) {
            return null;
        }

        return self::STATUSES[$index + 1];
    }

    public function validateDiscount(string $code, User $user, float $subtotal): Discount
    {
        $discount = Discount::where('code', strtoupper(trim($code)))->first();

        if (! $discount) {
            throw ValidationException::withMessages(['code' => 'Kode diskon tidak ditemukan.']);
        }

        if (! $discount->is_active) {
            throw ValidationException::withMessages(['code' => 'Kode diskon sudah tidak aktif.']);
        }

        $now = now();
        if ($now->lt($discount->starts_at) || $now->gt($discount->expires_at)) {
            throw ValidationException::withMessages(['code' => 'Kode diskon sudah tidak berlaku di luar periode aktifnya.']);
        }

        if ($discount->min_purchase !== null && $subtotal < (float) $discount->min_purchase) {
            $minPurchase = number_format((float) $discount->min_purchase, 0, ',', '.');
            throw ValidationException::withMessages(['code' => "Minimal belanja untuk kode ini adalah Rp{$minPurchase}."]);
        }

        if (DiscountUsage::where('discount_id', $discount->id)->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages(['code' => 'Kamu sudah pernah menggunakan kode diskon ini.']);
        }

        return $discount;
    }

    public function calculateDiscountAmount(Discount $discount, float $subtotal): float
    {
        $amount = $discount->type === 'percentage'
            ? $subtotal * ((float) $discount->value / 100)
            : (float) $discount->value;

        return round(min(max($amount, 0), $subtotal), 2);
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
            $product = $products[$item->product_id];
            $stockBefore = $product->stock;
            $stockAfter = $stockBefore - $item->quantity;

            $product->decrement('stock', $item->quantity);

            StockMovement::create([
                'product_id' => $product->id,
                'user_id' => null,
                'type' => 'sale',
                'quantity_change' => -$item->quantity,
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'note' => "Pengurangan stok otomatis dari pesanan {$order->order_number}.",
            ]);
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