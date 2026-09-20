import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const statusLabels = {
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
};

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));

const formatDateShort = (value) => new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(new Date(value));

const formatMonthLabel = (value) => {
    const [year, month] = value.split('-');
    return new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(new Date(Number(year), Number(month) - 1, 1));
};

export default function Dashboard({
    totalRevenue = 0,
    totalCustomers = 0,
    orderSummary = {},
    stockAlert = { out_of_stock: 0, low_stock: 0 },
    lowStockThreshold = 10,
    revenueTrend = [],
    dateFrom = '',
    dateTo = '',
    topProducts = [],
    newCustomersPerMonth = [],
}) {
    const totalOrders = Object.values(orderSummary).reduce((sum, value) => sum + value, 0);

    const submitDateRange = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        router.get(
            route('admin.dashboard'),
            {
                date_from: form.elements.date_from.value || undefined,
                date_to: form.elements.date_to.value || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    const chartData = revenueTrend.map((row) => ({ ...row, label: formatDateShort(row.date) }));
    const customerChartData = newCustomersPerMonth.map((row) => ({ ...row, label: formatMonthLabel(row.month) }));

    return (
        <AdminLayout title="Dashboard">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Admin area</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Sales Dashboard</h1>
            </div>

            <div className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Revenue</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{formatRupiah(totalRevenue)}</p>
                        <p className="mt-1 text-xs text-slate-400">Status Paid, Processing, Shipped, Delivered</p>
                    </div>
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Order</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{totalOrders}</p>
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            {Object.entries(orderSummary).map(([status, count]) => (
                                <span key={status}>{statusLabels[status] ?? status}: <strong className="text-slate-700">{count}</strong></span>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Total Customer</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{totalCustomers}</p>
                    </div>
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Stok Bermasalah</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-950">{stockAlert.out_of_stock + stockAlert.low_stock}</p>
                        <div className="mt-2 flex gap-3 text-xs">
                            <span className="text-red-600">Habis: <strong>{stockAlert.out_of_stock}</strong></span>
                            <span className="text-amber-600">Rendah (≤{lowStockThreshold}): <strong>{stockAlert.low_stock}</strong></span>
                        </div>
                        <Link href={route('admin.inventory.index')} className="mt-2 inline-block text-xs font-semibold text-blue-600 hover:text-blue-800">Lihat inventory →</Link>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 className="text-lg font-semibold text-slate-900">Revenue Harian</h2>
                        <form onSubmit={submitDateRange} className="flex flex-wrap items-end gap-3">
                            <div>
                                <label className="block text-xs font-medium text-slate-600">Dari</label>
                                <input type="date" name="date_from" defaultValue={dateFrom} className="mt-1 rounded-lg border-slate-300 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600">Sampai</label>
                                <input type="date" name="date_to" defaultValue={dateTo} className="mt-1 rounded-lg border-slate-300 text-sm" />
                            </div>
                            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Terapkan</button>
                        </form>
                    </div>
                    <div className="mt-6 h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="label" fontSize={12} stroke="#64748b" />
                                <YAxis fontSize={12} stroke="#64748b" tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(value)} />
                                <Tooltip formatter={(value) => formatRupiah(value)} labelClassName="text-slate-700" />
                                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Customer Baru (6 Bulan Terakhir)</h2>
                        <div className="mt-6 h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={customerChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="label" fontSize={12} stroke="#64748b" />
                                    <YAxis fontSize={12} stroke="#64748b" allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#0f172a" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="text-lg font-semibold text-slate-900">Top 5 Produk Terlaris</h2>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-sm">
                                <thead>
                                    <tr>
                                        {['Produk', 'Terjual', 'Revenue'].map((heading) => (
                                            <th key={heading} className="px-3 py-2 text-left font-semibold text-slate-600">{heading}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {topProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-3 py-3 font-medium text-slate-900">{product.name}</td>
                                            <td className="px-3 py-3 text-slate-600">{product.total_qty}</td>
                                            <td className="px-3 py-3 text-slate-600">{formatRupiah(product.total_revenue)}</td>
                                        </tr>
                                    ))}
                                    {topProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-6 text-center text-slate-500">Belum ada data penjualan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
