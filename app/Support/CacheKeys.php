<?php

namespace App\Support;

use App\Models\Category;
use Closure;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Central place for cache keys/TTLs so producers (controllers reading data)
 * and consumers (controllers invalidating data) never drift out of sync.
 */
class CacheKeys
{
    public const PRODUCTS_TAG = 'products';

    public const CATEGORIES_TAG = 'categories';

    public const TTL_PRODUCT_LISTING = 300; // 5 minutes

    public const TTL_PRODUCT_DETAIL = 600; // 10 minutes

    public const TTL_CATEGORIES = 3600; // 1 hour

    public const TTL_DASHBOARD = 300; // 5 minutes

    public static function productListingKey(array $params): string
    {
        return 'products:index:'.static::hashParams($params);
    }

    public static function productDetailKey(string $slug): string
    {
        return "products:detail:{$slug}";
    }

    public static function categoriesKey(): string
    {
        return 'categories:all';
    }

    public static function dashboardKey(array $params): string
    {
        return 'admin:dashboard:'.static::hashParams($params);
    }

    /**
     * Full category list (id, name, slug, parent_id), shared by every screen
     * that needs categories (customer filters, admin dropdowns, etc.).
     */
    public static function categories()
    {
        return static::remember(
            static::categoriesKey(),
            static::TTL_CATEGORIES,
            fn () => Category::query()->orderBy('name')->get(['id', 'name', 'slug', 'parent_id']),
            static::CATEGORIES_TAG,
        );
    }

    public static function flushProducts(): void
    {
        Cache::tags([self::PRODUCTS_TAG])->flush();
    }

    public static function flushCategories(): void
    {
        Cache::tags([self::CATEGORIES_TAG])->flush();
    }

    public static function forgetProductDetail(string $slug): void
    {
        Cache::forget(static::productDetailKey($slug));
    }

    /**
     * Cache::remember wrapper that logs a "cache hit/miss" line so caching
     * behaviour is easy to verify locally (see `php artisan pail --filter=cache`).
     */
    public static function remember(string $key, int $ttlSeconds, Closure $callback, ?string $tag = null): mixed
    {
        $repository = $tag ? Cache::tags([$tag]) : Cache::store();

        Log::debug($repository->has($key) ? "[cache] HIT {$key}" : "[cache] MISS {$key}");

        return $repository->remember($key, $ttlSeconds, $callback);
    }

    private static function hashParams(array $params): string
    {
        ksort($params);

        return md5(http_build_query($params));
    }
}
