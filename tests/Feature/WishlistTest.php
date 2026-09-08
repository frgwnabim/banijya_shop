<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_with_product_as_intended_url(): void
    {
        $product = Product::factory()->create();

        $response = $this->from('/products/'.$product->slug)->post('/wishlist/'.$product->id, [
            'return_to' => '/products/'.$product->slug,
        ]);

        $response->assertRedirect('/login');
        $this->assertSame(url('/products/'.$product->slug), session('url.intended'));
    }

    public function test_toggle_adds_then_removes_a_product_from_the_wishlist(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)->post('/wishlist/'.$product->id)->assertRedirect();
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        $this->actingAs($user)->post('/wishlist/'.$product->id)->assertRedirect();
        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_wishlist_items_are_owned_by_the_authenticated_user(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create();
        Wishlist::create(['user_id' => $owner->id, 'product_id' => $product->id]);

        $this->actingAs($otherUser)->get('/wishlist')->assertOk();
        $this->assertDatabaseHas('wishlists', [
            'user_id' => $owner->id,
            'product_id' => $product->id,
        ]);
    }
}