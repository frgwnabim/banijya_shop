<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_home_page_shows_the_product_listing(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Products/Index'));
    }

    public function test_the_old_products_url_redirects_to_home_with_its_query(): void
    {
        $this->get('/products?search=kopi&sort=price_asc')
            ->assertRedirect('/?search=kopi&sort=price_asc');
    }
}
