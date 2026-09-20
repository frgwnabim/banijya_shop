<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = ['category_id', 'name', 'slug', 'description', 'price', 'stock', 'sku', 'image_path', 'thumbnail_path', 'status', 'cache_rating_average'];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'stock' => 'integer', 'cache_rating_average' => 'decimal:2'];
    }

    /**
     * Value is already a full URL (S3/MinIO/R2) or an app-relative legacy local path — both resolve fine as-is.
     */
    protected function imagePath(): Attribute
    {
        return Attribute::make(get: fn (?string $value) => $value ?: null);
    }

    /**
     * Fall back to the full-size image for products uploaded before thumbnails existed.
     */
    protected function thumbnailPath(): Attribute
    {
        return Attribute::make(get: fn (?string $value) => $value ?: ($this->attributes['image_path'] ?? null));
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function cartItems(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function wishlistedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'wishlists')->withTimestamps();
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
