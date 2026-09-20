<?php

namespace App\Jobs;

use App\Models\Product;
use App\Models\Review;
use App\Support\CacheKeys;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RecalculateProductRatingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public int $productId)
    {
    }

    public function handle(): void
    {
        $product = Product::find($this->productId);

        if (! $product) {
            return;
        }

        $average = Review::where('product_id', $this->productId)->avg('rating');
        $product->update(['cache_rating_average' => $average !== null ? round($average, 2) : null]);

        // Invalidate only after the recalculated value is safely persisted.
        CacheKeys::forgetProductDetail($product->slug);
    }
}
