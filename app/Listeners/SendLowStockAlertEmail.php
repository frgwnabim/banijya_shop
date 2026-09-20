<?php

namespace App\Listeners;

use App\Events\StockRunningLow;
use App\Mail\LowStockAlertMail;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendLowStockAlertEmail implements ShouldQueue
{
    public int $tries = 3;

    public function handle(StockRunningLow $event): void
    {
        $threshold = config('inventory.low_stock_threshold');

        User::where('role', 'admin')->get()->each(function (User $admin) use ($event, $threshold) {
            Mail::to($admin->email)->send(new LowStockAlertMail($event->product, $threshold));
        });
    }
}
