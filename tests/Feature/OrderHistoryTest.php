<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_sees_only_their_orders_and_can_filter_by_status(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $pendingOrder = $this->createOrder($user, 'pending', 'ORD-PENDING');
        $this->createOrder($user, 'delivered', 'ORD-DELIVERED');
        $this->createOrder($otherUser, 'pending', 'ORD-OTHER');

        $response = $this->actingAs($user)->get('/orders');
        $page = $response->assertOk()->viewData('page');
        $this->assertSame('Orders/Index', $page['component']);
        $this->assertCount(2, $page['props']['orders']['data']);
        $this->assertEqualsCanonicalizing(
            ['ORD-DELIVERED', 'ORD-PENDING'],
            array_column($page['props']['orders']['data'], 'order_number'),
        );

        $response = $this->actingAs($user)->get('/orders?status=pending');
        $page = $response->assertOk()->viewData('page');
        $this->assertSame('Orders/Index', $page['component']);
        $this->assertSame('pending', $page['props']['status']);
        $this->assertCount(1, $page['props']['orders']['data']);
        $this->assertSame($pendingOrder->order_number, $page['props']['orders']['data'][0]['order_number']);
    }

    public function test_customer_cannot_view_another_users_order(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $order = $this->createOrder($owner, 'paid', 'ORD-PRIVATE');

        $this->actingAs($otherUser)->get('/orders/'.$order->id)->assertForbidden();
    }

    public function test_order_detail_returns_a_reached_status_timeline(): void
    {
        $user = User::factory()->create();
        $order = $this->createOrder($user, 'processing', 'ORD-TIMELINE');
        $order->statusHistories()->createMany([
            ['status' => 'pending', 'note' => 'Created'],
            ['status' => 'paid', 'note' => 'Paid'],
            ['status' => 'processing', 'note' => 'Processing'],
        ]);

        $response = $this->actingAs($user)->get('/orders/'.$order->id);
        $page = $response->assertOk()->viewData('page');
        $this->assertSame('Orders/Show', $page['component']);
        $this->assertCount(5, $page['props']['timeline']);
        $this->assertSame('pending', $page['props']['timeline'][0]['status']);
        $this->assertTrue($page['props']['timeline'][0]['reached']);
        $this->assertTrue($page['props']['timeline'][2]['reached']);
        $this->assertFalse($page['props']['timeline'][3]['reached']);
        $this->assertFalse($page['props']['timeline'][4]['reached']);
    }

    private function createOrder(User $user, string $status, string $orderNumber): Order
    {
        return Order::create([
            'user_id' => $user->id,
            'order_number' => $orderNumber,
            'status' => $status,
            'total_amount' => 100,
            'shipping_address' => 'Test address',
        ]);
    }

}