<?php

namespace App\Services;

use App\Events\StockRunningLow;
use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class StockAlertService
{
    /**
     * Check a product's stock against the low-stock threshold and dispatch
     * StockRunningLow only once per "dip" below the threshold (cache flag).
     * The flag is cleared once stock recovers above the threshold so the
     * next dip triggers a fresh alert instead of spamming on every sale.
     */
    public static function evaluate(Product $product): void
    {
        $threshold = config('inventory.low_stock_threshold');
        $cacheKey = "low_stock_alerted:product:{$product->id}";

        if ($product->stock <= $threshold) {
            if (! Cache::has($cacheKey)) {
                Cache::forever($cacheKey, true);
                event(new StockRunningLow($product));
            }

            return;
        }

        Cache::forget($cacheKey);
    }
}
