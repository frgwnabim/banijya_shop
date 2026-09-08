<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    private const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $status = in_array($status, self::STATUSES, true) ? $status : null;

        $orders = $request->user()->orders()
            ->withCount('items')
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'status' => $status,
            'statuses' => self::STATUSES,
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        abort_unless($order->user_id === $request->user()->id, 403);

        $order->load([
            'items.product',
            'statusHistories' => fn ($query) => $query->orderBy('changed_at'),
        ]);

        $historyByStatus = $order->statusHistories->keyBy('status');
        $currentIndex = array_search($order->status, self::STATUSES, true);

        $timeline = collect(self::STATUSES)->map(function (string $timelineStatus, int $index) use ($historyByStatus, $currentIndex) {
            $history = $historyByStatus->get($timelineStatus);

            return [
                'status' => $timelineStatus,
                'reached' => $currentIndex !== false && $index <= $currentIndex,
                'changed_at' => $history?->changed_at?->toISOString(),
                'note' => $history?->note,
            ];
        })->values();

        return Inertia::render('Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total_amount' => (float) $order->total_amount,
                'shipping_address' => $order->shipping_address,
                'created_at' => $order->created_at?->toISOString(),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'price_snapshot' => (float) $item->price_snapshot,
                    'subtotal' => (float) $item->subtotal,
                    'product' => [
                        'name' => $item->product->name,
                        'image_path' => $item->product->image_path,
                    ],
                ])->values(),
            ],
            'timeline' => $timeline,
        ]);
    }
}