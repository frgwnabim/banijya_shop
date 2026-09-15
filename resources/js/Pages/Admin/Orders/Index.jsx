import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';

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
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));

const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));

export default function Index({ orders, status = null, search = '', dateFrom = '', dateTo = '', statuses = [], summary = {} }) {
    const { flash = {} } = usePage().props;

    const applyFilters = (overrides = {}) => {
        const form = document.getElementById('order-filter-form');
        const formData = new FormData(form);
        const nextStatus = Object.prototype.hasOwnProperty.call(overrides, 'status') ? overrides.status : status;

        router.get(
            route('admin.orders.index'),
            {
                status: nextStatus || undefined,
                search: formData.get('search') || undefined,
                date_from: formData.get('date_from') || undefined,
                date_to: formData.get('date_to') || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const submitFilters = (event) => {
        event.preventDefault();
        applyFilters();
    };

    return (
        <AdminLayout title="Orders">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Order management</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">Orders</h1>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                {flash.success && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{flash.success}</div>}
                {flash.error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{flash.error}</div>}

                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {statuses.map((item) => (
                        <div key={item} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{statusLabels[item]}</p>
                            <p className="mt-1 text-2xl font-semibold text-slate-950">{summary[item] ?? 0}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => applyFilters({ status: undefined })}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition ${!status ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
                    >
                        Semua
                    </button>
                    {statuses.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => applyFilters({ status: item })}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === item ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
                        >
                            {statusLabels[item]}
                        </button>
                    ))}
                </div>

                <form id="order-filter-form" onSubmit={submitFilters} className="mb-6 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600">Cari order/customer</label>
                        <input name="search" defaultValue={search} placeholder="Nomor order, nama, atau email" className="mt-1 w-64 rounded-lg border-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600">Dari tanggal</label>
                        <input type="date" name="date_from" defaultValue={dateFrom} className="mt-1 rounded-lg border-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600">Sampai tanggal</label>
                        <input type="date" name="date_to" defaultValue={dateTo} className="mt-1 rounded-lg border-slate-300" />
                    </div>
                    <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Terapkan</button>
                </form>

                <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Order', 'Customer', 'Tanggal', 'Item', 'Total', 'Status', 'Aksi'].map((heading) => (
                                    <th key={heading} className="px-5 py-3 text-left font-semibold text-slate-600">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.data.map((order) => (
                                <tr key={order.id}>
                                    <td className="px-5 py-4 font-medium text-slate-900">{order.order_number}</td>
                                    <td className="px-5 py-4 text-slate-600">
                                        <p>{order.user?.name}</p>
                                        <p className="text-xs text-slate-400">{order.user?.email}</p>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{formatDate(order.created_at)}</td>
                                    <td className="px-5 py-4 text-slate-600">{order.items_count}</td>
                                    <td className="px-5 py-4 text-slate-600">{formatRupiah(order.total_amount)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                            {statusLabels[order.status] ?? order.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <Link href={route('admin.orders.show', order.id)} className="text-sm text-blue-600 hover:text-blue-800">
                                            Detail
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Tidak ada order yang cocok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={orders.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
