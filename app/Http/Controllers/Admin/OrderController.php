<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminOrderStatusRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    public function index(Request $request): Response
    {
        $status = $request->query('status');
        $status = in_array($status, OrderService::statuses(), true) ? $status : null;
        $search = trim((string) $request->query('search', ''));
        $dateFrom = $request->query('date_from');
        $dateTo = $request->query('date_to');

        $orders = Order::query()
            ->with('user:id,name,email')
            ->withCount('items')
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('order_number', 'ILIKE', "%{$search}%")
                        ->orWhereHas('user', function ($query) use ($search) {
                            $query->where('name', 'ILIKE', "%{$search}%")->orWhere('email', 'ILIKE', "%{$search}%");
                        });
                });
            })
            ->when($dateFrom, fn ($query) => $query->whereDate('created_at', '>=', $dateFrom))
            ->when($dateTo, fn ($query) => $query->whereDate('created_at', '<=', $dateTo))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $summary = collect(OrderService::statuses())->mapWithKeys(fn ($item) => [
            $item => Order::where('status', $item)->count(),
        ]);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'status' => $status,
            'search' => $search,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'statuses' => OrderService::statuses(),
            'summary' => $summary,
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load([
            'user:id,name,email',
            'items.product:id,name,image_path',
            'statusHistories' => fn ($query) => $query->orderBy('changed_at'),
        ]);

        $historyByStatus = $order->statusHistories->keyBy('status');
        $statuses = OrderService::statuses();
        $currentIndex = array_search($order->status, $statuses, true);

        $timeline = collect($statuses)->map(function (string $timelineStatus, int $index) use ($historyByStatus, $currentIndex) {
            $history = $historyByStatus->get($timelineStatus);

            return [
                'status' => $timelineStatus,
                'reached' => $currentIndex !== false && $index <= $currentIndex,
                'changed_at' => $history?->changed_at?->toISOString(),
                'note' => $history?->note,
            ];
        })->values();

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total_amount' => (float) $order->total_amount,
                'shipping_address' => $order->shipping_address,
                'created_at' => $order->created_at?->toISOString(),
                'customer' => [
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ],
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
            'nextStatus' => $this->orderService->nextStatus($order->status),
        ]);
    }

    public function updateStatus(AdminOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $data = $request->validated();

        try {
            $this->orderService->updateStatus($order, $data['status'], $data['note'] ?? null);
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages(['status' => $exception->getMessage()]);
        }

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }
}
