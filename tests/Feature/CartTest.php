<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_with_product_as_intended_url(): void
    {
        $product = Product::factory()->create(['stock' => 3]);

        $response = $this->from('/products/'.$product->slug)->post('/cart', [
            'quantity' => 1,
            'return_to' => '/products/'.$product->slug,
        ]);

        $response->assertRedirect('/login');
        $this->assertSame(url('/products/'.$product->slug), session('url.intended'));
    }

    public function test_product_is_added_and_existing_quantity_is_merged_without_exceeding_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5, 'price' => 12000]);

        $this->actingAs($user)->post('/cart', ['product_id' => $product->id, 'quantity' => 3]);
        $this->actingAs($user)->post('/cart', ['product_id' => $product->id, 'quantity' => 2]);

        $this->assertDatabaseHas('carts', ['user_id' => $user->id]);
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 5,
        ]);

        $this->actingAs($user)
            ->from('/products/'.$product->slug)
            ->post('/cart', ['product_id' => $product->id, 'quantity' => 1])
            ->assertSessionHasErrors('quantity');
    }

    public function test_cart_item_can_be_updated_and_removed_only_by_its_owner(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create(['stock' => 4]);
        $cartItem = Cart::create(['user_id' => $owner->id])->items()->create([
            'product_id' => $product->id,
            'quantity' => 1,
            'price_snapshot' => $product->price,
        ]);

        $this->actingAs($otherUser)->patch('/cart/'.$cartItem->id, ['quantity' => 2])->assertNotFound();
        $this->actingAs($owner)->patch('/cart/'.$cartItem->id, ['quantity' => 3])->assertRedirect();
        $this->assertDatabaseHas('cart_items', ['id' => $cartItem->id, 'quantity' => 3]);

        $this->actingAs($owner)->delete('/cart/'.$cartItem->id)->assertRedirect();
        $this->assertDatabaseMissing('cart_items', ['id' => $cartItem->id]);
    }
}