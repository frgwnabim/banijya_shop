<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class OrderConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public Order $order)
    {
        $this->order->loadMissing('items.product');
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Konfirmasi Pesanan {$this->order->order_number} - Banijya Shop",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.confirmation',
            with: ['order' => $this->order],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (! $this->order->invoice_path || ! Storage::disk('local')->exists($this->order->invoice_path)) {
            return [];
        }

        return [
            Attachment::fromStorage($this->order->invoice_path)
                ->as("Invoice-{$this->order->order_number}.pdf")
                ->withMime('application/pdf'),
        ];
    }
}
