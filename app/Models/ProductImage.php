<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    protected $fillable = ['product_id', 'path', 'is_primary'];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean'];
    }

    /**
     * Value is already a full URL (S3/MinIO/R2) or an app-relative legacy local path.
     */
    protected function path(): Attribute
    {
        return Attribute::make(get: fn (?string $value) => $value ?: null);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
