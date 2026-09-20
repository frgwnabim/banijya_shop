<?php

namespace App\Jobs;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CleanupExpiredCartsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    private const EXPIRY_DAYS = 30;

    public int $tries = 3;

    public function __construct()
    {
        $this->onQueue('maintenance');
    }

    public function handle(): void
    {
        $expiredCartIds = Cart::where('updated_at', '<', now()->subDays(self::EXPIRY_DAYS))->pluck('id');

        if ($expiredCartIds->isEmpty()) {
            return;
        }

        $deleted = CartItem::whereIn('cart_id', $expiredCartIds)->delete();

        Log::info("CleanupExpiredCartsJob: removed {$deleted} cart item(s) from {$expiredCartIds->count()} abandoned cart(s).");
    }
}
