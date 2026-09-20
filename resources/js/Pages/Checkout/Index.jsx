import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

export default function Index({ items = [], total = 0 }) {
    const { flash = {} } = usePage().props;
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        recipient_name: '',
        shipping_address: '',
        phone: '',
        discount_code: '',
    });

    const discountForm = useForm({ code: '' });

    useEffect(() => {
        if (flash.discount) {
            setAppliedDiscount(flash.discount);
            setData('discount_code', flash.discount.code);
        }
    }, [flash.discount]);

    const applyDiscount = (event) => {
        event.preventDefault();
        discountForm.post(route('checkout.apply-discount'), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const removeDiscount = () => {
        setAppliedDiscount(null);
        setData('discount_code', '');
        discountForm.setData('code', '');
        discountForm.clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        post(route('checkout.store'));
    };

    const discountAmount = appliedDiscount ? Number(appliedDiscount.amount) : 0;
    const grandTotal = Math.max(0, total - discountAmount);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Checkout</h2>
                    <Link href={route('cart.index')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">Kembali ke cart</Link>
                </div>
            }
        >
            <Head title="Checkout - Banijya Shop" />
            <div className="py-10">
                <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                        <h1 className="text-xl font-semibold text-slate-900">Alamat pengiriman</h1>
                        <p className="mt-2 text-sm text-slate-500">Pastikan data penerima sudah benar sebelum membuat pesanan.</p>
                        <form onSubmit={submit} className="mt-6 space-y-5">
                            <div>
                                <label htmlFor="recipient_name" className="text-sm font-medium text-slate-700">Nama penerima</label>
                                <input id="recipient_name" value={data.recipient_name} onChange={(event) => setData('recipient_name', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500" autoComplete="name" />
                                {errors.recipient_name && <p className="mt-1 text-sm text-red-600">{errors.recipient_name}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className="text-sm font-medium text-slate-700">No. telepon</label>
                                <input id="phone" type="tel" value={data.phone} onChange={(event) => setData('phone', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500" autoComplete="tel" />
                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                            </div>
                            <div>
                                <label htmlFor="shipping_address" className="text-sm font-medium text-slate-700">Alamat lengkap</label>
                                <textarea id="shipping_address" rows="5" value={data.shipping_address} onChange={(event) => setData('shipping_address', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500" autoComplete="street-address" />
                                {errors.shipping_address && <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>}
                            </div>
                            <button type="submit" disabled={processing} className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-300">
                                {processing ? 'Membuat pesanan...' : 'Buat Pesanan'}
                            </button>
                        </form>
                    </section>

                    <aside className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:sticky lg:top-6">
                        <h2 className="text-lg font-semibold text-slate-900">Ringkasan pesanan</h2>
                        <div className="mt-5 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-800">{item.product.name}</p>
                                        <p className="mt-1 text-slate-500">{item.quantity} x {formatRupiah(item.price)}</p>
                                    </div>
                                    <span className="shrink-0 font-semibold text-slate-900">{formatRupiah(item.subtotal)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-5">
                            <label htmlFor="discount_code_input" className="text-sm font-medium text-slate-700">Kode diskon</label>
                            {appliedDiscount ? (
                                <div className="mt-2 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                                    <span className="font-semibold">{appliedDiscount.code}</span>
                                    <button type="button" onClick={removeDiscount} className="font-semibold text-emerald-700 underline hover:text-emerald-900">
                                        Hapus
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={applyDiscount} className="mt-2 flex gap-2">
                                    <input
                                        id="discount_code_input"
                                        value={discountForm.data.code}
                                        onChange={(event) => discountForm.setData('code', event.target.value.toUpperCase())}
                                        placeholder="Masukkan kode"
                                        className="min-w-0 flex-1 rounded-lg border-slate-300 text-sm focus:border-amber-500 focus:ring-amber-500"
                                    />
                                    <button type="submit" disabled={discountForm.processing} className="rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-300">
                                        Terapkan
                                    </button>
                                </form>
                            )}
                            {discountForm.errors.code && <p className="mt-1 text-sm text-red-600">{discountForm.errors.code}</p>}
                        </div>

                        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-600">Subtotal</span>
                                <span className="font-semibold text-slate-900">{formatRupiah(total)}</span>
                            </div>
                            {appliedDiscount && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600">Diskon ({appliedDiscount.code})</span>
                                    <span className="font-semibold text-emerald-700">-{formatRupiah(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="font-medium text-slate-600">Total</span>
                                <span className="text-xl font-semibold text-slate-950">{formatRupiah(grandTotal)}</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}