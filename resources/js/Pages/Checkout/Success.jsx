import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

export default function Success({ order }) {
    const { flash = {}, errors = {} } = usePage().props;

    const simulatePayment = () => {
        router.post(route('orders.simulate-payment', order.id), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Konfirmasi Pesanan</h2>
                    <Link href={route('products.index')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">Lanjut belanja</Link>
                </div>
            }
        >
            <Head title={`Pesanan ${order.order_number} - Banijya Shop`} />
            <div className="py-10">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    {flash.success && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{flash.success}</div>}
                    {errors.status && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{errors.status}</div>}
                    {Object.entries(errors).filter(([key]) => key.startsWith('items.')).map(([key, message]) => <div key={key} className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">{message}</div>)}

                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Pesanan berhasil dibuat</p>
                                <h1 className="mt-2 text-2xl font-semibold text-slate-950">{order.order_number}</h1>
                            </div>
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold capitalize text-amber-800">{order.status}</span>
                        </div>

                        <div className="mt-6 space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                                    <div><p className="font-medium text-slate-800">{item.product.name}</p><p className="mt-1 text-slate-500">{item.quantity} x {formatRupiah(item.price_snapshot)}</p></div>
                                    <span className="font-semibold text-slate-900">{formatRupiah(item.subtotal)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-6 border-t border-slate-100 pt-6 sm:grid-cols-2">
                            <div><h2 className="text-sm font-semibold text-slate-700">Alamat pengiriman</h2><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{order.shipping_address}</p></div>
                            <div className="sm:text-right"><h2 className="text-sm font-semibold text-slate-700">Total</h2><p className="mt-2 text-2xl font-semibold text-slate-950">{formatRupiah(order.total_amount)}</p></div>
                        </div>

                        {order.status === 'pending' && (
                            <div className="mt-8 border-t border-slate-100 pt-6">
                                <p className="text-sm text-slate-600">Pembayaran belum diproses. Gunakan simulasi untuk melanjutkan pesanan ke status Paid.</p>
                                <button type="button" onClick={simulatePayment} className="mt-4 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Simulasikan Pembayaran Berhasil</button>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}