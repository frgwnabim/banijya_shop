import WishlistButton from '@/Components/WishlistButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

export default function Index({ products = [] }) {
    const { flash = {} } = usePage().props;
    const [addingProductId, setAddingProductId] = useState(null);

    const addToCart = (product) => {
        setAddingProductId(product.id);
        router.post(route('cart.add'), { product_id: product.id, quantity: 1 }, {
            preserveScroll: true,
            onFinish: () => setAddingProductId(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Wishlist</h2>
                    <Link href={route('products.index')} className="text-sm font-semibold text-amber-700 hover:text-amber-900">Lanjut belanja</Link>
                </div>
            }
        >
            <Head title="Wishlist - Banijya Shop" />
            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash.success && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{flash.success}</div>}
                    {products.length === 0 ? (
                        <div className="rounded-xl bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-200">
                            <p className="text-lg font-semibold text-slate-900">Wishlist kamu masih kosong</p>
                            <Link href={route('products.index')} className="mt-6 inline-flex rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">Lihat produk</Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((product) => (
                                <article key={product.id} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                                    <div className="relative aspect-[4/3] bg-slate-100">
                                        <Link href={route('products.show', product.slug)} aria-label={product.name}>
                                            {product.image_path ? <img src={product.image_path} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100 text-sm font-medium text-amber-800">Banijya Shop</div>}
                                        </Link>
                                        <WishlistButton productId={product.id} isWishlisted className="absolute right-3 top-3 h-10 w-10 shadow-sm" />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.category?.name ?? 'Tanpa kategori'}</p>
                                        <Link href={route('products.show', product.slug)} className="mt-2 block line-clamp-2 min-h-12 text-lg font-semibold text-slate-900">{product.name}</Link>
                                        <p className="mt-4 font-semibold text-slate-950">{formatRupiah(product.price)}</p>
                                        <button type="button" onClick={() => addToCart(product)} disabled={product.stock < 1 || addingProductId === product.id} className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                                            {product.stock < 1 ? 'Stok habis' : addingProductId === product.id ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}