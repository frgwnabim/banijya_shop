<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Support\CacheKeys;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Mengisi 8 kategori dan 40 produk contoh beserta gambarnya (public/images/products).
 * Aman dijalankan berulang kali karena memakai updateOrCreate berdasarkan slug.
 */
class ProductCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = require database_path('data/product_catalog.php');

        foreach ($catalog as $categoryData) {
            $category = Category::updateOrCreate(
                ['slug' => Str::slug($categoryData['name'])],
                ['name' => $categoryData['name'], 'parent_id' => null],
            );

            foreach ($categoryData['products'] as $index => $productData) {
                $slug = Str::slug($productData['name']);

                Product::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'category_id' => $category->id,
                        'name' => $productData['name'],
                        'description' => $productData['description'],
                        'price' => $productData['price'],
                        'stock' => $productData['stock'],
                        'sku' => sprintf('%s-%03d', $categoryData['code'], $index + 1),
                        'image_path' => "/images/products/{$slug}.jpg",
                        'thumbnail_path' => "/images/products/thumbs/{$slug}.jpg",
                        'status' => 'active',
                    ],
                );
            }
        }

        CacheKeys::flushProducts();
        CacheKeys::flushCategories();
    }
}
