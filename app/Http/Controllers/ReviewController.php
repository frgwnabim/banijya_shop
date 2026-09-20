<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewRequest;
use App\Models\Product;
use App\Models\Review;
use App\Support\CacheKeys;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function store(ReviewRequest $request, Product $product): RedirectResponse
    {
        abort_unless($product->status === 'active', 404);
        $this->ensureEligible($request, $product);

        if ($request->user()->reviews()->where('product_id', $product->id)->exists()) {
            throw ValidationException::withMessages([
                'review' => 'Kamu sudah memberikan ulasan untuk produk ini.',
            ]);
        }

        try {
            $request->user()->reviews()->create([
                'product_id' => $product->id,
                ...$request->validated(),
            ]);
        } catch (QueryException $exception) {
            if ($this->isUniqueViolation($exception)) {
                throw ValidationException::withMessages([
                    'review' => 'Kamu sudah memberikan ulasan untuk produk ini.',
                ]);
            }

            throw $exception;
        }

        CacheKeys::forgetProductDetail($product->slug);

        return back()->with('success', 'Ulasan berhasil ditambahkan.');
    }

    public function update(ReviewRequest $request, Review $review): RedirectResponse
    {
        $this->ensureOwnership($request, $review);
        $review->update($request->validated());

        CacheKeys::forgetProductDetail($review->product->slug);

        return back()->with('success', 'Ulasan berhasil diperbarui.');
    }

    public function destroy(Request $request, Review $review): RedirectResponse
    {
        $this->ensureOwnership($request, $review);
        $productSlug = $review->product->slug;
        $review->delete();

        CacheKeys::forgetProductDetail($productSlug);

        return back()->with('success', 'Ulasan berhasil dihapus.');
    }

    private function ensureEligible(Request $request, Product $product): void
    {
        $hasDeliveredOrder = $request->user()->orders()
            ->where('status', 'delivered')
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->exists();

        if (! $hasDeliveredOrder) {
            throw ValidationException::withMessages([
                'review' => 'Beli dan terima produk ini dulu untuk bisa memberi ulasan.',
            ]);
        }
    }

    private function ensureOwnership(Request $request, Review $review): void
    {
        abort_unless($review->user_id === $request->user()->id, 403);
    }

    private function isUniqueViolation(QueryException $exception): bool
    {
        return in_array($exception->errorInfo[0] ?? null, ['23000', '23505'], true);
    }
}