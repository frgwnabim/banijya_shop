<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_a_customer_with_a_delivered_order_can_review(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();

        $this->actingAs($user)
            ->post('/products/'.$product->id.'/reviews', ['rating' => 5, 'comment' => 'Bagus'])
            ->assertSessionHasErrors('review');

        $order = $this->createOrder($user, 'delivered');
        $order->items()->create([
            'product_id' => $product->id,
            'quantity' => 1,
            'price_snapshot' => $product->price,
            'subtotal' => $product->price,
        ]);

        $this->actingAs($user)
            ->post('/products/'.$product->id.'/reviews', ['rating' => 5, 'comment' => 'Bagus'])
            ->assertRedirect();

        $this->assertDatabaseHas('reviews', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'rating' => 5,
        ]);
    }

    public function test_customer_can_only_review_a_product_once(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $order = $this->createOrder($user, 'delivered');
        $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'price_snapshot' => $product->price, 'subtotal' => $product->price]);

        Review::create(['user_id' => $user->id, 'product_id' => $product->id, 'rating' => 4, 'comment' => 'Awalnya']);

        $this->actingAs($user)
            ->post('/products/'.$product->id.'/reviews', ['rating' => 5, 'comment' => 'Kedua'])
            ->assertSessionHasErrors('review');
    }

    public function test_customer_can_update_and_delete_only_their_own_review(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $product = Product::factory()->create();
        $review = Review::create(['user_id' => $owner->id, 'product_id' => $product->id, 'rating' => 3, 'comment' => 'Cukup']);

        $this->actingAs($otherUser)->patch('/reviews/'.$review->id, ['rating' => 1, 'comment' => 'Tidak'])->assertForbidden();
        $this->actingAs($owner)->patch('/reviews/'.$review->id, ['rating' => 5, 'comment' => 'Sangat bagus'])->assertRedirect();
        $this->assertDatabaseHas('reviews', ['id' => $review->id, 'rating' => 5, 'comment' => 'Sangat bagus']);

        $this->actingAs($otherUser)->delete('/reviews/'.$review->id)->assertForbidden();
        $this->actingAs($owner)->delete('/reviews/'.$review->id)->assertRedirect();
        $this->assertDatabaseMissing('reviews', ['id' => $review->id]);
    }

    public function test_product_detail_exposes_reviews_and_current_user_review_state(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        $order = $this->createOrder($user, 'delivered');
        $order->items()->create(['product_id' => $product->id, 'quantity' => 1, 'price_snapshot' => $product->price, 'subtotal' => $product->price]);
        $review = Review::create(['user_id' => $user->id, 'product_id' => $product->id, 'rating' => 4, 'comment' => 'Nyaman']);

        $response = $this->actingAs($user)->get('/products/'.$product->slug);
        $page = $response->assertOk()->viewData('page');

        $this->assertSame('Products/Show', $page['component']);
        $this->assertFalse($page['props']['canReview']);
        $this->assertTrue($page['props']['eligibleToReview']);
        $this->assertSame($review->id, $page['props']['userReview']['id']);
        $this->assertCount(1, $page['props']['reviews']);
    }

    private function createOrder(User $user, string $status): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-REVIEW-'.fake()->unique()->numerify('####'),
            'status' => $status,
            'total_amount' => 100,
            'shipping_address' => 'Test address',
        ]);
    }
}