<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_access_admin_catalog(): void
    {
        $user = User::factory()->create(['role' => 'customer']);

        $this->actingAs($user)->get('/admin/products')->assertForbidden();
        $this->actingAs($user)->get('/admin/categories')->assertForbidden();
    }

    public function test_admin_can_create_product_with_generated_slug_sku_and_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        $image = UploadedFile::fake()->createWithContent(
            'product.jpg',
            base64_decode('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AX//xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AX//xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8Qf//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8Qf//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8Qf//Z'),
        );

        $response = $this->actingAs($admin)->post('/admin/products', [
            'name' => 'Produk Baru',
            'description' => 'Deskripsi',
            'price' => 12500,
            'stock' => 8,
            'category_id' => $category->id,
            'status' => 'active',
            'image' => $image,
        ]);

        $product = Product::firstOrFail();
        $response->assertRedirect('/admin/products');
        $this->assertSame('produk-baru', $product->slug);
        $this->assertNotEmpty($product->sku);
        $this->assertStringStartsWith('/storage/products/', $product->image_path);
        $this->assertTrue(Storage::disk('public')->exists(str_replace('/storage/', '', $product->image_path)));
    }

    public function test_product_with_order_history_is_soft_deleted(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $product = Product::factory()->create();
        $order = Order::create([
            'user_id' => User::factory()->create()->id,
            'order_number' => 'ORD-ADMIN-TEST',
            'status' => 'delivered',
            'total_amount' => 100,
            'shipping_address' => 'Test',
        ]);
        $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'price_snapshot' => $product->price, 'subtotal' => $product->price]);

        $this->actingAs($admin)->delete('/admin/products/'.$product->id)->assertRedirect();
        $this->assertSoftDeleted('products', ['id' => $product->id]);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id]);
    }

    public function test_admin_can_create_category_and_cannot_delete_category_used_by_product(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $parent = Category::factory()->create();

        $this->actingAs($admin)->post('/admin/categories', ['name' => 'Elektronik', 'parent_id' => $parent->id])->assertRedirect('/admin/categories');
        $category = Category::where('name', 'Elektronik')->firstOrFail();
        $product = Product::factory()->create(['category_id' => $category->id]);

        $this->actingAs($admin)->delete('/admin/categories/'.$category->id)->assertRedirect()->assertSessionHas('error');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }
}