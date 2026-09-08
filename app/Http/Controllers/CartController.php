<?php

namespace App\Http\Controllers;

use App\Http\Requests\AddCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function add(AddCartItemRequest $request): RedirectResponse
    {
        $product = Product::findOrFail($request->validated('product_id'));
        abort_unless($product->status === 'active', 404);

        $quantity = (int) $request->validated('quantity');
        $cart = $request->user()->cart()->firstOrCreate();
        $cartItem = $cart->items()->where('product_id', $product->id)->first();
        $newQuantity = $quantity + ($cartItem?->quantity ?? 0);

        if ($newQuantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => "Jumlah melebihi stok tersedia ({$product->stock}).",
            ]);
        }

        if ($cartItem) {
            $cartItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $quantity,
                'price_snapshot' => $product->price,
            ]);
        }

        return back()->with('success', 'Produk ditambahkan ke keranjang');
    }

    public function index(Request $request): Response
    {
        $cart = $request->user()->cart()->with('items.product')->first();
        $items = $cart?->items->map(fn (CartItem $item) => [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'price' => (float) $item->price_snapshot,
            'subtotal' => round((float) $item->price_snapshot * $item->quantity, 2),
            'product' => [
                'id' => $item->product->id,
                'name' => $item->product->name,
                'image_path' => $item->product->image_path,
                'stock' => $item->product->stock,
            ],
        ])->values() ?? collect();

        return Inertia::render('Cart/Index', [
            'items' => $items,
            'total' => round($items->sum('subtotal'), 2),
            'itemCount' => $items->sum('quantity'),
        ]);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): RedirectResponse
    {
        $this->ensureOwnership($request, $cartItem);

        $quantity = (int) $request->validated('quantity');
        if ($quantity > $cartItem->product->stock) {
            throw ValidationException::withMessages([
                'quantity' => "Jumlah melebihi stok tersedia ({$cartItem->product->stock}).",
            ]);
        }

        $cartItem->update(['quantity' => $quantity]);

        return back();
    }

    public function remove(Request $request, CartItem $cartItem): RedirectResponse
    {
        $this->ensureOwnership($request, $cartItem);
        $cartItem->delete();

        return back()->with('success', 'Produk dihapus dari keranjang');
    }

    private function ensureOwnership(Request $request, CartItem $cartItem): void
    {
        abort_unless($cartItem->cart->user_id === $request->user()->id, 404);
    }
}