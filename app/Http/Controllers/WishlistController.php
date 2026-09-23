<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function toggle(Request $request, Product $product): RedirectResponse
    {
        abort_unless($product->status === 'active', 404);

        $wishlist = Wishlist::query()
            ->where('user_id', $request->user()->id)
            ->where('product_id', $product->id)
            ->first();

        if ($wishlist) {
            $wishlist->delete();

            return back();
        }

        Wishlist::create([
            'user_id' => $request->user()->id,
            'product_id' => $product->id,
        ]);

        return back();
    }

    public function index(Request $request): Response
    {
        $products = Wishlist::query()
            ->where('user_id', $request->user()->id)
            ->with(['product.category', 'product.images'])
            ->latest()
            ->get()
            ->filter(fn (Wishlist $wishlist) => $wishlist->product?->status === 'active')
            ->map(fn (Wishlist $wishlist) => $wishlist->product)
            ->values();

        return Inertia::render('Wishlist/Index', [
            'products' => $products,
        ]);
    }
}