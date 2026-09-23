import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

function ProductImage({ src, alt }) {
    return src ? (
        <img src={src} alt={alt} className="h-24 w-24 rounded-lg object-cover" />
    ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100 text-center text-xs font-semibold text-amber-800">
            Banijya Shop
        </div>
    );
}

export default function Index({ items = [], total = 0 }) {
    const { errors = {}, flash = {} } = usePage().props;

    const updateQuantity = (item, quantity) => {
        if (quantity < 1) {
            return;
        }

        router.patch(route('cart.update', item.id), { quantity }, {
            preserveScroll: true,
        });
    };

    const [itemToRemove, setItemToRemove] = useState(null);
    const [isRemoving, setIsRemoving] = useState(false);
    // Simpan item terakhir agar isi modal tidak kosong saat animasi menutup.
    const lastItemRef = useRef(null);
    if (itemToRemove) {
        lastItemRef.current = itemToRemove;
    }
    const modalItem = itemToRemove ?? lastItemRef.current;

    const closeRemoveModal = () => {
        if (!isRemoving) {
            setItemToRemove(null);
        }
    };

    const removeItem = () => {
        setIsRemoving(true);
        router.delete(route('cart.remove', itemToRemove.id), {
            preserveScroll: true,
            onFinish: () => {
                setIsRemoving(false);
                setItemToRemove(null);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Keranjang</h2>
                    <Link href={route('products.index')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">
                        Lanjut belanja
                    </Link>
                </div>
            }
        >
            <Head title="Keranjang - Banijya Shop" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash.success && (
                        <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
                            {flash.success}
                        </div>
                    )}
                    {flash.error && (
                        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
                            {flash.error}
                        </div>
                    )}
                    {errors.quantity && (
                        <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800" role="alert">
                            {errors.quantity}
                        </div>
                    )}

                    {items.length === 0 ? (
                        <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
                            <p className="text-lg font-semibold text-slate-900">Keranjang kamu masih kosong</p>
                            <p className="mt-2 text-sm text-slate-500">Temukan produk yang ingin kamu bawa pulang.</p>
                            <Link href={route('products.index')} className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
                                Lihat produk
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
                            <section className="space-y-4">
                                {items.map((item) => {
                                    const stockWarning = item.quantity > item.product.stock;

                                    return (
                                        <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                                <ProductImage src={item.product.image_path} alt={item.product.name} />
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-semibold text-slate-900">{item.product.name}</h3>
                                                    <p className="mt-1 text-sm text-slate-500">{formatRupiah(item.price)} / item</p>
                                                    {stockWarning && (
                                                        <p className="mt-2 text-sm font-medium text-amber-700" role="alert">
                                                            Stok saat ini tinggal {item.product.stock}. Jumlah di keranjang melebihi stok tersedia.
                                                        </p>
                                                    )}
                                                    <p className="mt-2 text-sm font-semibold text-slate-900">Subtotal: {formatRupiah(item.subtotal)}</p>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                                                    <div className="flex h-10 items-center rounded-lg border border-slate-300">
                                                        <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} disabled={item.quantity <= 1} className="h-full w-9 text-lg text-slate-600 hover:bg-slate-50 disabled:text-slate-300" aria-label={`Kurangi ${item.product.name}`}>-</button>
                                                        <span className="w-9 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                                                        <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="h-full w-9 text-lg text-slate-600 hover:bg-slate-50 disabled:text-slate-300" aria-label={`Tambah ${item.product.name}`}>+</button>
                                                    </div>
                                                    <button type="button" onClick={() => setItemToRemove(item)} className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-800" aria-label={`Hapus ${item.product.name}`}>
                                                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16m-10 4v6m4-6v6M9 7V4h6v3m-9 0 1 14h8l1-14" /></svg>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>

                            <aside className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-6">
                                <h2 className="text-lg font-semibold text-slate-900">Ringkasan</h2>
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                                    <span className="font-medium text-slate-600">Total</span>
                                    <span className="text-xl font-semibold text-slate-950">{formatRupiah(total)}</span>
                                </div>
                                <Link href={route('checkout.create')} className="mt-5 block w-full rounded-lg bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-amber-600">
                                    Checkout
                                </Link>
                            </aside>
                        </div>
                    )}
                </div>
            </div>

            <Modal show={itemToRemove !== null} onClose={closeRemoveModal} maxWidth="md">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">Hapus produk dari keranjang?</h2>
                    <p className="mt-2 text-sm text-slate-600">
                        <span className="font-semibold text-slate-900">{modalItem?.product.name}</span>
                        {modalItem ? ` (${modalItem.quantity} item)` : ''} akan dihapus dari keranjang kamu.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeRemoveModal} disabled={isRemoving}>
                            Batal
                        </SecondaryButton>
                        <DangerButton onClick={removeItem} disabled={isRemoving}>
                            {isRemoving ? 'Menghapus...' : 'Ya, hapus'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}