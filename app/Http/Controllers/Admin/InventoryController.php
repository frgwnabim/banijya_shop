<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\InventoryAdjustRequest;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockAlertService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $filter = $request->query('filter', 'all');
        $threshold = config('inventory.low_stock_threshold');

        $products = Product::query()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'ILIKE', "%{$search}%")->orWhere('sku', 'ILIKE', "%{$search}%");
            }))
            ->when($filter === 'out_of_stock', fn ($query) => $query->where('stock', 0))
            ->when($filter === 'low_stock', fn ($query) => $query->where('stock', '>', 0)->where('stock', '<=', $threshold))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'search' => $search,
            'filter' => $filter,
            'lowStockThreshold' => $threshold,
            'summary' => [
                'out_of_stock' => Product::where('stock', 0)->count(),
                'low_stock' => Product::where('stock', '>', 0)->where('stock', '<=', $threshold)->count(),
            ],
        ]);
    }

    public function adjust(InventoryAdjustRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $product, $request) {
            $lockedProduct = Product::whereKey($product->id)->lockForUpdate()->firstOrFail();
            $stockBefore = $lockedProduct->stock;
            $stockAfter = $stockBefore + $data['quantity_change'];

            if ($stockAfter < 0) {
                throw ValidationException::withMessages([
                    'quantity_change' => "Stok akhir tidak boleh minus. Stok saat ini {$stockBefore}.",
                ]);
            }

            $lockedProduct->update(['stock' => $stockAfter]);

            StockMovement::create([
                'product_id' => $lockedProduct->id,
                'user_id' => $request->user()->id,
                'type' => $data['type'],
                'quantity_change' => $data['quantity_change'],
                'stock_before' => $stockBefore,
                'stock_after' => $stockAfter,
                'note' => $data['note'],
            ]);
        });

        // Evaluated after commit so the queued alert job never races the transaction.
        StockAlertService::evaluate($product->fresh());

        return back()->with('success', 'Stok berhasil disesuaikan.');
    }

    public function history(Product $product): Response
    {
        return Inertia::render('Admin/Inventory/History', [
            'product' => $product->only(['id', 'name', 'sku', 'stock']),
            'movements' => $product->stockMovements()
                ->with('user:id,name')
                ->latest()
                ->paginate(20)
                ->withQueryString(),
        ]);
    }
}
