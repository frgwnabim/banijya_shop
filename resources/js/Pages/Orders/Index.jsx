import Pagination from '@/Components/Pagination';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

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

const formatDate = (value) => new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
}).format(new Date(value));

export default function Index({ orders, status = null, statuses = [] }) {
    const filterStatus = (nextStatus) => {
        router.get(route('orders.index'), nextStatus ? { status: nextStatus } : {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Riwayat Pesanan</h2>}
        >
            <Head title="Riwayat Pesanan - Banijya Shop" />
            <div className="py-10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-wrap gap-2">
                        <button type="button" onClick={() => filterStatus(null)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!status ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>Semua</button>
                        {statuses.map((item) => (
                            <button key={item} type="button" onClick={() => filterStatus(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === item ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
                                {statusLabels[item] ?? item}
                            </button>
                        ))}
                    </div>

                    {orders.data.length === 0 ? (
                        <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
                            <p className="text-lg font-semibold text-slate-900">Kamu belum punya riwayat pesanan</p>
                            <p className="mt-2 text-sm text-slate-500">Pesanan yang kamu buat akan muncul di sini.</p>
                            <Link href={route('products.index')} className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Lihat produk</Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orders.data.map((order) => (
                                <Link key={order.id} href={route('orders.show', order.id)} className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-slate-900">{order.order_number}</p>
                                            <p className="mt-1 text-sm text-slate-500">{formatDate(order.created_at)} · {order.items_count} item</p>
                                        </div>
                                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusClasses[order.status] ?? 'bg-slate-100 text-slate-700'}`}>{statusLabels[order.status] ?? order.status}</span>
                                    </div>
                                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                        <span className="text-sm font-medium text-slate-500">Total pesanan</span>
                                        <span className="font-semibold text-slate-950">{formatRupiah(order.total_amount)}</span>
                                    </div>
                                </Link>
                            ))}
                            <Pagination links={orders.links} />
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}