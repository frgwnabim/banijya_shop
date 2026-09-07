import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

function ProductImage({ src, alt, className = '' }) {
    if (src) {
        return <img src={src} alt={alt} className={className} />;
    }

    return (
        <div className={`flex items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100 text-sm font-medium text-amber-800 ${className}`}>
            Banijya Shop
        </div>
    );
}

function RelatedProductCard({ product }) {
    return (
        <Link
            href={route('products.show', product.slug)}
            className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
        >
            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                <ProductImage
                    src={product.image_path}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
            </div>
            <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {product.category?.name ?? 'Tanpa kategori'}
                </p>
                <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold text-slate-900">
                    {product.name}
                </h3>
                <p className="mt-3 font-semibold text-slate-950">
                    {formatRupiah(product.price)}
                </p>
            </div>
        </Link>
    );
}

export default function Show({ product, relatedProducts = [] }) {
    const galleryImages = product.images?.length
        ? product.images.map((image) => image.path)
        : product.image_path
          ? [product.image_path]
          : [];
    const [selectedImage, setSelectedImage] = useState(galleryImages[0] ?? null);
    const [quantity, setQuantity] = useState(product.stock > 0 ? 1 : 0);

    useEffect(() => {
        setSelectedImage(galleryImages[0] ?? null);
        setQuantity(product.stock > 0 ? 1 : 0);
    }, [product.id]);

    const averageRating = product.reviews_avg_rating
        ? Number(product.reviews_avg_rating)
        : null;
    const stockAvailable = product.stock > 0;

    const showComingSoon = (feature) => {
        window.alert(`Fitur ${feature} akan segera hadir.`);
    };

    return (
        <>
            <Head title={`${product.name} - Banijya Shop`} />

            <div className="min-h-screen bg-slate-50">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <Link href="/products" className="text-xl font-semibold tracking-tight text-slate-900">
                            Banijya Shop
                        </Link>
                        <Link
                            href={route('products.index')}
                            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                        >
                            Kembali ke Produk
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                    <nav className="mb-8 text-sm text-slate-500" aria-label="Breadcrumb">
                        <Link href="/products" className="transition hover:text-slate-900">
                            Home
                        </Link>
                        <span className="mx-2">/</span>
                        <Link
                            href={route('products.index')}
                            className="transition hover:text-slate-900"
                        >
                            {product.category?.name ?? 'Produk'}
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900">{product.name}</span>
                    </nav>

                    <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start">
                        <div>
                            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                                <ProductImage
                                    src={selectedImage}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {galleryImages.length > 0 && (
                                <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                                    {galleryImages.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setSelectedImage(image)}
                                            className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white ring-2 transition ${
                                                selectedImage === image
                                                    ? 'ring-amber-500'
                                                    : 'ring-transparent hover:ring-slate-300'
                                            }`}
                                            aria-label={`Pilih gambar ${index + 1}`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} ${index + 1}`}
                                                className="h-full w-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                                {product.category?.name ?? 'Tanpa kategori'}
                            </p>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                {product.name}
                            </h1>
                            <p className="mt-5 text-3xl font-semibold text-slate-950">
                                {formatRupiah(product.price)}
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                                <span className="text-amber-500" aria-label="Rating produk">
                                    {'★★★★★'.split('').map((star, index) => (
                                        <span
                                            key={index}
                                            className={
                                                averageRating && index < Math.round(averageRating)
                                                    ? ''
                                                    : 'text-slate-300'
                                            }
                                        >
                                            {star}
                                        </span>
                                    ))}
                                </span>
                                <span className="text-slate-500">
                                    {averageRating
                                        ? `${averageRating.toFixed(1)} dari ${product.reviews_count} review`
                                        : 'Belum ada review'}
                                </span>
                            </div>

                            <div className="mt-7 border-t border-slate-100 pt-6">
                                <p className="whitespace-pre-line leading-7 text-slate-600">
                                    {product.description || 'Belum ada deskripsi untuk produk ini.'}
                                </p>
                            </div>

                            <div className="mt-7 flex items-center gap-3">
                                {stockAvailable ? (
                                    <span className="font-medium text-emerald-700">
                                        Stok tersedia ({product.stock})
                                    </span>
                                ) : (
                                    <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
                                        Stok Habis
                                    </span>
                                )}
                            </div>

                            <div className="mt-6 flex flex-wrap gap-3">
                                <div className="flex h-11 items-center rounded-lg border border-slate-300 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                                        disabled={!stockAvailable || quantity <= 1}
                                        className="h-full w-10 text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                        aria-label="Kurangi jumlah"
                                    >
                                        -
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold text-slate-900">
                                        {stockAvailable ? quantity : 0}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setQuantity((current) => Math.min(product.stock, current + 1))}
                                        disabled={!stockAvailable || quantity >= product.stock}
                                        className="h-full w-10 text-lg text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                                        aria-label="Tambah jumlah"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => showComingSoon('cart')}
                                    disabled={!stockAvailable}
                                    className="min-h-11 flex-1 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    Tambah ke Keranjang
                                </button>
                                <button
                                    type="button"
                                    onClick={() => showComingSoon('wishlist')}
                                    className="min-h-11 rounded-lg border border-slate-300 px-4 text-xl text-slate-700 transition hover:border-amber-500 hover:text-amber-600"
                                    aria-label="Tambah ke Wishlist"
                                    title="Tambah ke Wishlist"
                                >
                                    ♡
                                </button>
                            </div>
                        </div>
                    </section>

                    {relatedProducts.length > 0 && (
                        <section className="mt-16">
                            <div className="mb-6">
                                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">
                                    Pilihan lainnya
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                                    Produk Terkait
                                </h2>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedProducts.map((relatedProduct) => (
                                    <RelatedProductCard
                                        key={relatedProduct.id}
                                        product={relatedProduct}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            </div>
        </>
    );
}
