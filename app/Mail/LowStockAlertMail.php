<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowStockAlertMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Product $product, public int $threshold)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Stok Rendah: {$this->product->name} - Banijya Shop",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.inventory.low-stock',
            with: [
                'product' => $this->product,
                'threshold' => $this->threshold,
            ],
        );
    }
}
