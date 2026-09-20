<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use App\Support\CacheKeys;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    // Orders in these statuses represent confirmed/realized revenue; Pending is excluded.
    private const REVENUE_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

    public function index(Request $request): Response
    {
        $dateTo = $request->query('date_to')
            ? Carbon::parse($request->query('date_to'))->endOfDay()
            : now()->endOfDay();
        $dateFrom = $request->query('date_from')
            ? Carbon::parse($request->query('date_from'))->startOfDay()
            : $dateTo->copy()->subDays(29)->startOfDay();

        $threshold = config('inventory.low_stock_threshold');

        $payload = CacheKeys::remember(
            CacheKeys::dashboardKey(['from' => $dateFrom->toDateString(), 'to' => $dateTo->toDateString()]),
            CacheKeys::TTL_DASHBOARD,
            function () use ($dateFrom, $dateTo, $threshold) {
                return [
                    'totalRevenue' => (float) Order::whereIn('status', self::REVENUE_STATUSES)->sum('total_amount'),
                    'totalCustomers' => User::where('role', 'customer')->count(),
                    'orderSummary' => collect(OrderService::statuses())->mapWithKeys(fn ($status) => [
                        $status => Order::where('status', $status)->count(),
                    ]),
                    'stockAlert' => [
                        'out_of_stock' => Product::where('stock', 0)->count(),
                        'low_stock' => Product::where('stock', '>', 0)->where('stock', '<=', $threshold)->count(),
                    ],
                    'lowStockThreshold' => $threshold,
                    'revenueTrend' => $this->revenueTrend($dateFrom, $dateTo),
                    'dateFrom' => $dateFrom->toDateString(),
                    'dateTo' => $dateTo->toDateString(),
                    'topProducts' => $this->topProducts(),
                    'newCustomersPerMonth' => $this->newCustomersPerMonth(),
                ];
            },
        );

        return Inertia::render('Admin/Dashboard', $payload);
    }

    private function revenueTrend(Carbon $dateFrom, Carbon $dateTo): array
    {
        $rows = Order::query()
            ->whereIn('status', self::REVENUE_STATUSES)
            ->whereDate('created_at', '>=', $dateFrom->toDateString())
            ->whereDate('created_at', '<=', $dateTo->toDateString())
            ->selectRaw('DATE(created_at) as date, SUM(total_amount) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy(fn ($row) => (string) $row->date);

        $trend = [];
        $cursor = $dateFrom->copy();

        while ($cursor->lte($dateTo)) {
            $key = $cursor->toDateString();
            $trend[] = [
                'date' => $key,
                'revenue' => (float) ($rows->get($key)->revenue ?? 0),
            ];
            $cursor->addDay();
        }

        return $trend;
    }

    private function topProducts(): array
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->whereIn('orders.status', self::REVENUE_STATUSES)
            ->selectRaw('products.id, products.name, SUM(order_items.quantity) as total_qty, SUM(order_items.subtotal) as total_revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'total_qty' => (int) $row->total_qty,
                'total_revenue' => (float) $row->total_revenue,
            ])
            ->values()
            ->all();
    }

    private function newCustomersPerMonth(): array
    {
        $start = now()->subMonths(5)->startOfMonth();

        $rows = User::query()
            ->where('role', 'customer')
            ->where('created_at', '>=', $start)
            ->selectRaw("to_char(created_at, 'YYYY-MM') as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month');

        $result = [];
        $cursor = $start->copy();

        for ($i = 0; $i < 6; $i++) {
            $key = $cursor->format('Y-m');
            $result[] = [
                'month' => $key,
                'total' => (int) ($rows->get($key)->total ?? 0),
            ];
            $cursor->addMonth();
        }

        return $result;
    }
}
