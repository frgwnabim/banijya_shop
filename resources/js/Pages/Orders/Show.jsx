import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const statusLabels = {
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
};

const statusClasses = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-blue-100 text-blue-800',
    processing: 'bg-violet-100 text-violet-800',
    shipped: 'bg-orange-100 text-orange-800',
    delivered: 'bg-emerald-100 text-emerald-800',
};

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : null;

export default function Show({ order, timeline = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Pesanan</h2>
                    <Link href={route('orders.index')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">Kembali ke riwayat</Link>
                </div>
            }
        >
            <Head title={`${order.order_number} - Banijya Shop`} />
            <div className="py-10">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                        <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
                            <div><p className="text-sm text-slate-500">Nomor pesanan</p><h1 className="mt-1 text-2xl font-semibold text-slate-950">{order.order_number}</h1><p className="mt-2 text-sm text-slate-500">{formatDate(order.created_at)}</p></div>
                            <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClasses[order.status] ?? 'bg-slate-100 text-slate-700'}`}>{statusLabels[order.status] ?? order.status}</span>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-lg font-semibold text-slate-900">Status pesanan</h2>
                            <div className="mt-6 grid grid-cols-5 gap-1">
                                {timeline.map((step, index) => (
                                    <div key={step.status} className="relative text-center">
                                        {index < timeline.length - 1 && <span className={`absolute left-1/2 top-4 h-0.5 w-full ${step.reached && timeline[index + 1].reached ? 'bg-emerald-500' : 'bg-slate-200'}`} aria-hidden="true" />}
                                        <span className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step.reached ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                            {step.reached ? '✓' : index + 1}
                                        </span>
                                        <span className={`mt-2 block text-xs font-semibold ${step.reached ? 'text-emerald-700' : 'text-slate-400'}`}>{statusLabels[step.status]}</span>
                                        {step.changed_at && <span className="mt-1 hidden text-[11px] text-slate-400 sm:block">{formatDate(step.changed_at)}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
                        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">Produk dipesan</h2>
                            <div className="mt-5 divide-y divide-slate-100">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="min-w-0"><p className="font-medium text-slate-900">{item.product.name}</p><p className="mt-1 text-sm text-slate-500">{item.quantity} x {formatRupiah(item.price_snapshot)}</p></div>
                                        <span className="shrink-0 font-semibold text-slate-900">{formatRupiah(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                        <aside className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">Ringkasan</h2>
                            <p className="mt-5 text-sm font-semibold text-slate-700">Alamat pengiriman</p>
                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{order.shipping_address}</p>
                            {order.discount_code && (
                                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                                    <span className="font-medium text-slate-600">Diskon ({order.discount_code})</span>
                                    <span className="font-semibold text-emerald-700">-{formatRupiah(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4"><span className="font-medium text-slate-600">Total</span><span className="text-lg font-semibold text-slate-950">{formatRupiah(order.total_amount)}</span></div>
                        </aside>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}