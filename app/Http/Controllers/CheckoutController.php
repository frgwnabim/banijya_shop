<?php

namespace App\Http\Controllers;

use App\Events\OrderCreated;
use App\Http\Requests\CheckoutRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CheckoutController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $cart = $request->user()->cart()->with('items.product')->first();

        if (! $cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang kamu masih kosong.');
        }

        $items = $cart->items->map(fn ($item) => [
            'id' => $item->id,
            'quantity' => $item->quantity,
            'price' => (float) $item->price_snapshot,
            'subtotal' => (float) $item->price_snapshot * $item->quantity,
            'product' => [
                'name' => $item->product->name,
                'image_path' => $item->product->image_path,
            ],
        ])->values();

        return Inertia::render('Checkout/Index', [
            'items' => $items,
            'total' => $items->sum('subtotal'),
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $discountCode = $data['discount_code'] ?? null;
        unset($data['discount_code']);

        $order = $this->orderService->createFromCart($request->user(), $data, $discountCode);

        event(new OrderCreated($order));

        return redirect()->route('checkout.success', $order)->with('success', 'Pesanan berhasil dibuat.');
    }

    public function applyDiscount(Request $request): RedirectResponse
    {
        $request->validate(['code' => ['required', 'string', 'max:50']]);

        $cart = $request->user()->cart()->with('items')->first();
        $subtotal = $cart ? (float) $cart->items->sum(fn ($item) => (float) $item->price_snapshot * $item->quantity) : 0.0;

        $discount = $this->orderService->validateDiscount($request->string('code')->toString(), $request->user(), $subtotal);
        $discountAmount = $this->orderService->calculateDiscountAmount($discount, $subtotal);

        return back()->with('success', "Kode diskon {$discount->code} berhasil diterapkan.")->with('discount', [
            'code' => $discount->code,
            'amount' => $discountAmount,
        ]);
    }

    public function showConfirmation(Request $request, Order $order): Response
    {
        $this->ensureOwnership($request, $order);

        return Inertia::render('Checkout/Success', [
            'order' => $order->load(['items.product', 'statusHistories']),
        ]);
    }

    public function simulatePayment(Request $request, Order $order): RedirectResponse
    {
        $this->ensureOwnership($request, $order);

        try {
            $this->orderService->updateStatus($order, 'paid');
        } catch (ValidationException|RuntimeException $exception) {
            if ($exception instanceof ValidationException) {
                throw $exception;
            }

            throw ValidationException::withMessages(['status' => $exception->getMessage()]);
        }

        return back()->with('success', 'Pembayaran berhasil disimulasikan. Stok telah diperbarui.');
    }

    private function ensureOwnership(Request $request, Order $order): void
    {
        abort_unless($order->user_id === $request->user()->id, 404);
    }
}