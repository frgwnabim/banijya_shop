<?php

namespace App\Listeners;

use App\Events\OrderStatusUpdated;
use App\Mail\OrderStatusUpdateMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;

class SendOrderStatusUpdateEmail implements ShouldQueue
{
    public function handle(OrderStatusUpdated $event): void
    {
        Mail::to($event->order->user->email)->send(
            new OrderStatusUpdateMail($event->order, $event->newStatus, $event->note)
        );
    }
}
