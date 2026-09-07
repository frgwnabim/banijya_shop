<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Discount extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'type', 'value', 'min_purchase', 'starts_at', 'expires_at', 'is_active'];

    protected function casts(): array
    {
        return ['value' => 'decimal:2', 'min_purchase' => 'decimal:2', 'starts_at' => 'datetime', 'expires_at' => 'datetime', 'is_active' => 'boolean'];
    }

    public function usages(): HasMany
    {
        return $this->hasMany(DiscountUsage::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'discount_usages')->withPivot('order_id', 'used_at')->withTimestamps();
    }
}
