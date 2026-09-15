import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const filters = [
    { key: 'all', label: 'Semua' },
    { key: 'low_stock', label: 'Stok Rendah' },
    { key: 'out_of_stock', label: 'Stok Habis' },
];

function stockBadge(product, threshold) {
    if (product.stock === 0) {
        return { label: 'Habis', className: 'bg-red-100 text-red-700' };
    }

    if (product.stock <= threshold) {
        return { label: 'Rendah', className: 'bg-amber-100 text-amber-700' };
    }

    return { label: 'Aman', className: 'bg-emerald-100 text-emerald-700' };
}

export default function Index({ products, search = '', filter = 'all', lowStockThreshold, summary }) {
    const { flash = {} } = usePage().props;
    const [adjusting, setAdjusting] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        quantity_change: '',
        type: 'restock',
        note: '',
    });

    const submitSearch = (event) => {
        event.preventDefault();
        router.get(
            route('admin.inventory.index'),
            { search: event.currentTarget.elements.search.value || undefined, filter },
            { preserveState: true, replace: true },
        );
    };

    const changeFilter = (key) => {
        router.get(route('admin.inventory.index'), { search: search || undefined, filter: key }, { preserveState: true, replace: true });
    };

    const openAdjustModal = (product) => {
        clearErrors();
        reset();
        setAdjusting(product);
    };

    const closeAdjustModal = () => {
        setAdjusting(null);
        reset();
        clearErrors();
    };

    const submitAdjust = (event) => {
        event.preventDefault();
        post(route('admin.inventory.adjust', adjusting.id), {
            preserveScroll: true,
            onSuccess: () => closeAdjustModal(),
        });
    };

    const quantityChange = Number(data.quantity_change) || 0;
    const previewAfter = adjusting ? adjusting.stock + quantityChange : 0;

    return (
        <AdminLayout title="Inventory">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Stock management</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">Inventory</h1>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                {flash.success && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{flash.success}</div>}
                {flash.error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{flash.error}</div>}

                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Stok Habis</p>
                        <p className="mt-2 text-3xl font-semibold text-red-600">{summary.out_of_stock}</p>
                    </div>
                    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Stok Rendah (≤ {lowStockThreshold})</p>
                        <p className="mt-2 text-3xl font-semibold text-amber-600">{summary.low_stock}</p>
                    </div>
                </div>

                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex gap-2">
                        {filters.map((item) => (
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
                        <input name="search" defaultValue={search} placeholder="Cari nama atau SKU" className="min-w-0 flex-1 rounded-lg border-slate-300" />
                        <button className="rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-700">Cari</button>
                    </form>
                </div>

                <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Produk', 'SKU', 'Stok', 'Status', 'Aksi'].map((heading) => (
                                    <th key={heading} className="px-5 py-3 text-left font-semibold text-slate-600">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.data.map((product) => {
                                const badge = stockBadge(product, lowStockThreshold);

                                return (
                                    <tr key={product.id}>
                                        <td className="px-5 py-4 font-medium text-slate-900">{product.name}</td>
                                        <td className="px-5 py-4 text-slate-600">{product.sku}</td>
                                        <td className="px-5 py-4 text-slate-600">{product.stock}</td>
                                        <td className="px-5 py-4">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-3">
                                                <button onClick={() => openAdjustModal(product)} className="text-sm text-blue-600 hover:text-blue-800">
                                                    Sesuaikan Stok
                                                </button>
                                                <Link href={route('admin.inventory.history', product.id)} className="text-sm text-slate-600 hover:text-slate-900">
                                                    Riwayat
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={products.links} />
                </div>
            </div>

            <Modal show={adjusting !== null} onClose={closeAdjustModal}>
                {adjusting && (
                    <form onSubmit={submitAdjust} className="p-6">
                        <h2 className="text-lg font-semibold text-slate-950">Sesuaikan Stok — {adjusting.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">Stok saat ini: {adjusting.stock}</p>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700">Jumlah Perubahan</label>
                            <input
                                type="number"
                                value={data.quantity_change}
                                onChange={(event) => setData('quantity_change', event.target.value)}
                                placeholder="Contoh: 50 atau -5"
                                className="mt-1 w-full rounded-lg border-slate-300"
                            />
                            <p className="mt-1 text-xs text-slate-500">Gunakan angka positif untuk restock, negatif untuk koreksi/barang rusak.</p>
                            <InputError message={errors.quantity_change} className="mt-1" />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700">Tipe</label>
                            <select
                                value={data.type}
                                onChange={(event) => setData('type', event.target.value)}
                                className="mt-1 w-full rounded-lg border-slate-300"
                            >
                                <option value="restock">Restock</option>
                                <option value="adjustment">Koreksi/Barang Rusak</option>
                                <option value="return">Retur</option>
                            </select>
                            <InputError message={errors.type} className="mt-1" />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700">Catatan / Alasan</label>
                            <textarea
                                value={data.note}
                                onChange={(event) => setData('note', event.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-lg border-slate-300"
                                placeholder="Wajib diisi, contoh: restock dari supplier X"
                            />
                            <InputError message={errors.note} className="mt-1" />
                        </div>

                        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
                            Preview stok: <span className="font-semibold">{adjusting.stock}</span> →{' '}
                            <span className={`font-semibold ${previewAfter < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{previewAfter}</span>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton type="button" onClick={closeAdjustModal}>Batal</SecondaryButton>
                            <PrimaryButton type="submit" disabled={processing}>Simpan</PrimaryButton>
                        </div>
                    </form>
                )}
            </Modal>
        </AdminLayout>
    );
}
