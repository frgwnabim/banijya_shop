<?php

use App\Jobs\CleanupExpiredCartsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new CleanupExpiredCartsJob)
    ->dailyAt('02:00')
    ->name('cleanup-expired-carts')
    ->onOneServer();
