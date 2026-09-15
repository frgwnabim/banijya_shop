import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';

const typeLabels = {
    restock: 'Restock',
    adjustment: 'Koreksi',
    sale: 'Penjualan',
    return: 'Retur',
};

const typeBadgeClass = {
    restock: 'bg-emerald-100 text-emerald-700',
    adjustment: 'bg-amber-100 text-amber-700',
    sale: 'bg-slate-200 text-slate-700',
    return: 'bg-blue-100 text-blue-700',
};

export default function History({ product, movements }) {
    return (
        <AdminLayout title="Riwayat Stok">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Stock management</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">Riwayat Stok — {product.name}</h1>
                <p className="mt-1 text-sm text-slate-500">SKU: {product.sku} · Stok saat ini: {product.stock}</p>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                <Link href={route('admin.inventory.index')} className="mb-6 inline-block text-sm text-blue-600 hover:text-blue-800">
                    ← Kembali ke Inventory
                </Link>

                <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Tanggal', 'Tipe', 'Perubahan', 'Stok Sebelum', 'Stok Sesudah', 'Catatan', 'Admin'].map((heading) => (
                                    <th key={heading} className="px-5 py-3 text-left font-semibold text-slate-600">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movements.data.map((movement) => (
                                <tr key={movement.id}>
                                    <td className="px-5 py-4 text-slate-600">{new Date(movement.created_at).toLocaleString('id-ID')}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${typeBadgeClass[movement.type]}`}>
                                            {typeLabels[movement.type]}
                                        </span>
                                    </td>
                                    <td className={`px-5 py-4 font-medium ${movement.quantity_change < 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                                        {movement.quantity_change > 0 ? `+${movement.quantity_change}` : movement.quantity_change}
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{movement.stock_before}</td>
                                    <td className="px-5 py-4 text-slate-600">{movement.stock_after}</td>
                                    <td className="px-5 py-4 max-w-xs text-slate-600">{movement.note ?? '-'}</td>
                                    <td className="px-5 py-4 text-slate-600">{movement.user?.name ?? 'Sistem'}</td>
                                </tr>
                            ))}
                            {movements.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Belum ada riwayat perubahan stok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={movements.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
