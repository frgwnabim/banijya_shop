<?php

namespace App\Jobs;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class GenerateOrderInvoiceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $backoff = 30;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing('items.product', 'user');
        $this->onQueue('invoices');
    }

    public function handle(): void
    {
        $pdf = Pdf::loadView('invoices.order', ['order' => $this->order]);
        $path = "invoices/{$this->order->order_number}.pdf";

        Storage::disk('local')->put($path, $pdf->output());

        $this->order->update(['invoice_path' => $path]);
    }
}
