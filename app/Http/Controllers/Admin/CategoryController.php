<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminCategoryRequest;
use App\Models\Category;
use App\Support\CacheKeys;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Categories/Index', [
            'categories' => Category::with('parent')->withCount(['products', 'children'])->orderBy('name')->paginate(15),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Categories/Create', [
            'categories' => CacheKeys::categories()->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])->values(),
        ]);
    }

    public function store(AdminCategoryRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name']);
        Category::create($data);

        CacheKeys::flushCategories();

        return redirect()->route('admin.categories.index')->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit(Category $category): Response
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'categories' => CacheKeys::categories()
                ->reject(fn ($item) => $item->id === $category->id)
                ->map(fn ($item) => ['id' => $item->id, 'name' => $item->name])
                ->values(),
        ]);
    }

    public function update(AdminCategoryRequest $request, Category $category): RedirectResponse
    {
        $data = $request->validated();
        $data['slug'] = $this->uniqueSlug($data['name'], $category);
        $category->update($data);

        CacheKeys::flushCategories();

        return redirect()->route('admin.categories.index')->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists() || $category->children()->exists()) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan produk atau memiliki sub-kategori.');
        }

        try {
            $category->delete();
        } catch (QueryException) {
            return back()->with('error', 'Kategori tidak dapat dihapus karena masih digunakan.');
        }

        CacheKeys::flushCategories();

        return back()->with('success', 'Kategori berhasil dihapus.');
    }

    private function uniqueSlug(string $name, ?Category $category = null): string
    {
        $base = Str::slug($name) ?: 'kategori';
        $slug = $base;
        $counter = 2;

        while (Category::where('slug', $slug)->when($category, fn ($query) => $query->where('id', '!=', $category->id))->exists()) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}