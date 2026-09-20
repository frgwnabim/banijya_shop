<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use App\Support\CacheKeys;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $categoryIds = collect((array) $request->query('category', []))
            ->filter(fn ($categoryId) => filter_var($categoryId, FILTER_VALIDATE_INT) !== false)
            ->map(fn ($categoryId) => (int) $categoryId)
            ->unique()
            ->values();
        $minPrice = is_numeric($request->query('min_price')) ? (float) $request->query('min_price') : null;
        $maxPrice = is_numeric($request->query('max_price')) ? (float) $request->query('max_price') : null;
        $inStock = $request->boolean('in_stock');
        $sort = in_array($request->query('sort'), [
            'newest',
            'price_asc',
            'price_desc',
            'name_asc',
            'name_desc',
        ], true) ? $request->query('sort') : 'newest';

        $cacheParams = [
            'search' => $search,
            'category' => $categoryIds->all(),
            'min_price' => $minPrice,
            'max_price' => $maxPrice,
            'in_stock' => $inStock,
            'sort' => $sort,
            'page' => (int) $request->query('page', 1),
        ];

        $products = CacheKeys::remember(
            CacheKeys::productListingKey($cacheParams),
            CacheKeys::TTL_PRODUCT_LISTING,
            fn () => Product::query()
                ->with('category')
                ->where('status', 'active')
                ->when($categoryIds->isNotEmpty(), fn ($query) => $query->whereIn('category_id', $categoryIds))
                ->when($minPrice !== null, fn ($query) => $query->where('price', '>=', $minPrice))
                ->when($maxPrice !== null, fn ($query) => $query->where('price', '<=', $maxPrice))
                ->when($inStock, fn ($query) => $query->where('stock', '>', 0))
                ->when($search !== '', function ($query) use ($search) {
                    $term = "%{$search}%";

                    $query->where(function ($query) use ($term) {
                        $query->where('name', 'ILIKE', $term)
                            ->orWhere('description', 'ILIKE', $term);
                    });
                })
                ->when($sort === 'price_asc', fn ($query) => $query->orderBy('price'))
                ->when($sort === 'price_desc', fn ($query) => $query->orderByDesc('price'))
                ->when($sort === 'name_asc', fn ($query) => $query->orderBy('name'))
                ->when($sort === 'name_desc', fn ($query) => $query->orderByDesc('name'))
                ->when($sort === 'newest', fn ($query) => $query->orderByDesc('created_at'))
                ->paginate(12)
                ->withQueryString(),
            CacheKeys::PRODUCTS_TAG,
        );

        return Inertia::render('Products/Index', [
            'products' => $products,
            'wishlistedProductIds' => $request->user()?->wishlists()->pluck('product_id')->values() ?? [],
            'search' => $search,
            'sort' => $sort,
            'categories' => CacheKeys::categories()->map(fn ($category) => [
                'id' => $category->id,
                'name' => $category->name,
            ])->values(),
            'filters' => [
                'category' => $categoryIds->all(),
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'in_stock' => $inStock,
            ],
        ]);
    }

    public function show(Request $request, Product $product): Response
    {
        abort_unless($product->status === 'active', 404);

        $cachedProduct = CacheKeys::remember(
            CacheKeys::productDetailKey($product->slug),
            CacheKeys::TTL_PRODUCT_DETAIL,
            fn () => $product->fresh(['category', 'images'])
                ->loadAvg('reviews', 'rating')
                ->loadCount('reviews'),
        );
        $product->setRelations($cachedProduct->getRelations());
        $product->setAttribute('reviews_avg_rating', $cachedProduct->reviews_avg_rating);
        $product->setAttribute('reviews_count', $cachedProduct->reviews_count);

        $productReviews = $product->reviews()
            ->with('user:id,name')
            ->latest()
            ->get();
        $userReview = $request->user()?->reviews()->where('product_id', $product->id)->first();
        $eligibleToReview = $request->user()?->orders()
            ->where('status', 'delivered')
            ->whereHas('items', fn ($query) => $query->where('product_id', $product->id))
            ->exists() ?? false;

        $relatedProducts = Product::query()
            ->with('category')
            ->where('status', 'active')
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->latest()
            ->limit(4)
            ->get();

        return Inertia::render('Products/Show', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'isWishlisted' => $request->user()?->wishlists()->where('product_id', $product->id)->exists() ?? false,
            'reviews' => $productReviews->map(fn ($review) => [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at?->toISOString(),
                'updated_at' => $review->updated_at?->toISOString(),
                'user' => ['name' => $review->user->name],
            ])->values(),
            'userReview' => $userReview ? [
                'id' => $userReview->id,
                'rating' => $userReview->rating,
                'comment' => $userReview->comment,
            ] : null,
            'eligibleToReview' => $eligibleToReview,
            'canReview' => $eligibleToReview && ! $userReview,
        ]);
    }
}
