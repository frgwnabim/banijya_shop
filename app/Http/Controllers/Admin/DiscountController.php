<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminDiscountRequest;
use App\Models\Discount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscountController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $filter = $request->query('filter', 'all');

        $discounts = Discount::query()
            ->withCount('usages')
            ->when($search !== '', fn ($query) => $query->where('code', 'ILIKE', "%{$search}%"))
            ->when($filter === 'active', fn ($query) => $query->where('is_active', true)->where('expires_at', '>=', now()))
            ->when($filter === 'expired', fn ($query) => $query->where(function ($query) {
                $query->where('is_active', false)->orWhere('expires_at', '<', now());
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Discounts/Index', [
            'discounts' => $discounts,
            'search' => $search,
            'filter' => $filter,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Discounts/Create');
    }

    public function store(AdminDiscountRequest $request): RedirectResponse
    {
        Discount::create($request->validated());

        return redirect()->route('admin.discounts.index')->with('success', 'Discount berhasil ditambahkan.');
    }

    public function edit(Discount $discount): Response
    {
        return Inertia::render('Admin/Discounts/Edit', [
            'discount' => $discount,
        ]);
    }

    public function update(AdminDiscountRequest $request, Discount $discount): RedirectResponse
    {
        $discount->update($request->validated());

        return redirect()->route('admin.discounts.index')->with('success', 'Discount berhasil diperbarui.');
    }

    public function destroy(Discount $discount): RedirectResponse
    {
        if ($discount->usages()->exists()) {
            $discount->update(['is_active' => false]);

            return back()->with('success', 'Discount sudah pernah dipakai sehingga hanya dinonaktifkan, bukan dihapus.');
        }

        $discount->delete();

        return back()->with('success', 'Discount berhasil dihapus.');
    }
}
