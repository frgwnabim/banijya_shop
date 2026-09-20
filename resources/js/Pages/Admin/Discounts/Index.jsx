import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';

const typeLabels = { percentage: 'Percentage', fixed: 'Fixed' };

const formatValue = (discount) =>
    discount.type === 'percentage'
        ? `${discount.value}%`
        : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(discount.value));

const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

const isExpired = (discount) => new Date(discount.expires_at) < new Date();

export default function Index({ discounts, search = '', filter = 'all' }) {
    const { flash = {} } = usePage().props;

    const submitSearch = (event) => {
        event.preventDefault();
        router.get(
            route('admin.discounts.index'),
            { search: event.currentTarget.elements.search.value || undefined, filter },
            { preserveState: true, replace: true },
        );
    };

    const changeFilter = (key) => {
        router.get(route('admin.discounts.index'), { search: search || undefined, filter: key }, { preserveState: true, replace: true });
    };

    const destroy = (discount) => {
        if (window.confirm(`Hapus discount ${discount.code}? Kalau sudah pernah dipakai, discount hanya akan dinonaktifkan.`)) {
            router.delete(route('admin.discounts.destroy', discount.id));
        }
    };

    return (
        <AdminLayout title="Discounts">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Promotions</p>
                        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Discounts</h1>
                    </div>
                    <Link href={route('admin.discounts.create')} className="rounded-lg bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700">
                        Tambah Discount
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-6 py-8 lg:px-10">
                {flash.success && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{flash.success}</div>}
                {flash.error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{flash.error}</div>}

                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex gap-2">
                        {[
                            { key: 'all', label: 'Semua' },
                            { key: 'active', label: 'Aktif' },
                            { key: 'expired', label: 'Kadaluarsa/Nonaktif' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => changeFilter(item.key)}
                                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                                    filter === item.key ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={submitSearch} className="flex max-w-xl gap-3">
                        <input name="search" defaultValue={search} placeholder="Cari kode" className="min-w-0 flex-1 rounded-lg border-slate-300" />
                        <button className="rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Kode', 'Tipe', 'Value', 'Periode', 'Status', 'Terpakai', 'Aksi'].map((heading) => (
                                    <th key={heading} className="px-5 py-3 text-left font-semibold text-slate-600">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {discounts.data.map((discount) => {
                                const expired = isExpired(discount);
                                const statusLabel = !discount.is_active ? 'Nonaktif' : expired ? 'Kadaluarsa' : 'Aktif';
                                const statusClass = !discount.is_active || expired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700';

                                return (
                                    <tr key={discount.id}>
                                        <td className="px-5 py-4 font-semibold text-slate-900">{discount.code}</td>
                                        <td className="px-5 py-4 text-slate-600">{typeLabels[discount.type]}</td>
                                        <td className="px-5 py-4 text-slate-600">{formatValue(discount)}</td>
                                        <td className="px-5 py-4 text-slate-600">
                                            {formatDate(discount.starts_at)} — {formatDate(discount.expires_at)}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600">{discount.usages_count}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-3">
                                                <Link href={route('admin.discounts.edit', discount.id)} className="font-semibold text-amber-700 hover:text-amber-900">Edit</Link>
                                                <button type="button" onClick={() => destroy(discount)} className="font-semibold text-red-600 hover:text-red-800">Hapus</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {discounts.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Belum ada discount.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={discounts.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
