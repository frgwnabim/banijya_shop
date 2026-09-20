<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdateMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $newStatus,
        public ?string $note = null,
    ) {
        $this->order->loadMissing('items.product');
    }

    public function envelope(): Envelope
    {
        $labels = [
            'paid' => 'Pembayaran Diterima',
            'processing' => 'Pesanan Diproses',
            'shipped' => 'Pesanan Dikirim',
            'delivered' => 'Pesanan Selesai',
        ];

        $label = $labels[$this->newStatus] ?? 'Update Status Pesanan';

        return new Envelope(
            subject: "{$label} - Pesanan {$this->order->order_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.orders.status-update',
            with: [
                'order' => $this->order,
                'status' => $this->newStatus,
                'note' => $this->note,
            ],
        );
    }
}
