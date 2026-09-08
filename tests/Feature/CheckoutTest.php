<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_pending_order_copies_items_and_does_not_reduce_stock(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5, 'price' => 12000]);
        $cart = Cart::create(['user_id' => $user->id]);
        $cart->items()->create(['product_id' => $product->id, 'quantity' => 2, 'price_snapshot' => $product->price]);

        $response = $this->actingAs($user)->post('/checkout', [
            'recipient_name' => 'Budi',
            'shipping_address' => 'Jl. Mawar No. 1',
            'phone' => '08123456789',
        ]);

        $order = Order::firstOrFail();
        $response->assertRedirect(route('checkout.success', $order, absolute: false));
        $this->assertSame('pending', $order->status);
        $this->assertSame(5, $product->fresh()->stock);
        $this->assertDatabaseHas('order_items', ['order_id' => $order->id, 'quantity' => 2]);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'pending']);
        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_simulated_payment_reduces_stock_and_records_paid_status(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 5]);
        $order = $this->createOrder($user, 'pending');
        $order->items()->create(['product_id' => $product->id, 'quantity' => 2, 'price_snapshot' => $product->price, 'subtotal' => $product->price * 2]);

        $this->actingAs($user)->post(route('orders.simulate-payment', $order))->assertRedirect();

        $this->assertSame('paid', $order->fresh()->status);
        $this->assertSame(3, $product->fresh()->stock);
        $this->assertDatabaseHas('order_status_histories', ['order_id' => $order->id, 'status' => 'paid']);
    }

    public function test_invalid_order_transition_is_rejected(): void
    {
        $order = $this->createOrder(User::factory()->create(), 'pending');

        $this->expectException(RuntimeException::class);
        app(OrderService::class)->updateStatus($order, 'shipped');
    }

    public function test_payment_fails_when_stock_has_changed(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create(['stock' => 1]);
        $order = $this->createOrder($user, 'pending');
        $order->items()->create(['product_id' => $product->id, 'quantity' => 2, 'price_snapshot' => $product->price, 'subtotal' => $product->price * 2]);

        $this->actingAs($user)->post(route('orders.simulate-payment', $order))->assertSessionHasErrors('items.'.$product->id);
        $this->assertSame('pending', $order->fresh()->status);
        $this->assertSame(1, $product->fresh()->stock);
    }

    public function test_order_confirmation_is_private_to_the_owner(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $order = $this->createOrder($owner, 'pending');

        $this->actingAs($otherUser)->get(route('checkout.success', $order))->assertNotFound();
    }

    private function createOrder(User $user, string $status): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'order_number' => 'ORD-TEST-'.fake()->unique()->numerify('####'),
            'status' => $status,
            'total_amount' => 100,
            'shipping_address' => 'Test address',
        ]);
    }
}