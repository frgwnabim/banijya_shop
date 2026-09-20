<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminProductRequest;
use App\Models\Product;
use App\Support\CacheKeys;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        return Inertia::render('Admin/Products/Index', [
            'products' => Product::withTrashed()
                ->with('category')
                ->when($search !== '', fn ($query) => $query->where('name', 'ILIKE', "%{$search}%"))
                ->latest()
                ->paginate(15)
                ->withQueryString(),
            'search' => $search,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => CacheKeys::categories()->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'parent_id' => $category->parent_id,
            ])->values(),
        ]);
    }

    public function store(AdminProductRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        $data['sku'] = $data['sku'] ?? $this->uniqueSku($data['name']);
        unset($data['image']);

        if ($request->hasFile('image')) {
            $storedPath = $request->file('image')->store('products', 'public');
            $data['image_path'] = '/storage/'.$storedPath;
        }

        Product::create($data);

        CacheKeys::flushProducts();

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product): Response
    {
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => CacheKeys::categories()->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
                'parent_id' => $category->parent_id,
            ])->values(),
        ]);
    }

    public function update(AdminProductRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name'], $product);
        $data['sku'] = $data['sku'] ?? $product->sku;
        unset($data['image']);

        $previousSlug = $product->slug;

        if ($request->hasFile('image')) {
            $this->deleteStoredImage($product->image_path);
            $storedPath = $request->file('image')->store('products', 'public');
            $data['image_path'] = '/storage/'.$storedPath;
        }

        $product->update($data);

        CacheKeys::flushProducts();
        CacheKeys::forgetProductDetail($previousSlug);
        CacheKeys::forgetProductDetail($product->slug);

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        $product->delete();

        CacheKeys::flushProducts();
        CacheKeys::forgetProductDetail($product->slug);

        return back()->with('success', 'Produk dihapus secara aman dan tidak akan tampil di area customer.');
    }

    private function uniqueSlug(string $name, ?Product $product = null): string
    {
        $base = Str::slug($name) ?: 'produk';
        $slug = $base;
        $counter = 2;

        while (Product::withTrashed()->where('slug', $slug)->when($product, fn ($query) => $query->where('id', '!=', $product->id))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    private function uniqueSku(string $name): string
    {
        $base = strtoupper(Str::slug($name, '')) ?: 'PRODUCT';
        $sku = substr($base, 0, 12).'-'.strtoupper(Str::random(6));

        while (Product::withTrashed()->where('sku', $sku)->exists()) {
            $sku = substr($base, 0, 12).'-'.strtoupper(Str::random(6));
        }

        return $sku;
    }

    private function deleteStoredImage(?string $imagePath): void
    {
        if ($imagePath && str_contains($imagePath, '/storage/')) {
            Storage::disk('public')->delete(Str::after($imagePath, '/storage/'));
        }
    }
}