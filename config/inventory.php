<?php

return [
    // Products with stock at or below this number are flagged as "low stock".
    'low_stock_threshold' => env('INVENTORY_LOW_STOCK_THRESHOLD', 10),
];
