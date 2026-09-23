import CartLink from '@/Components/CartLink';
import BackButton from '@/Components/BackButton';
import WishlistButton from '@/Components/WishlistButton';
import WishlistLink from '@/Components/WishlistLink';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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

function ReviewStars({ rating, interactive = false, onChange }) {
    return (
        <div className="flex items-center gap-1" aria-label={`${rating} dari 5 bintang`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? 'button' : undefined}
                    onClick={interactive ? () => onChange(star) : undefined}
                    className={interactive ? 'text-2xl leading-none transition hover:scale-110' : 'text-lg leading-none'}
                    aria-label={interactive ? `Beri rating ${star} dari 5` : undefined}
                    tabIndex={interactive ? 0 : -1}
                >
                    <span className={star <= rating ? 'text-amber-500' : 'text-slate-300'}>★</span>
                </button>
            ))}
        </div>
    );
}

function ReviewSection({ product, reviews, userReview, canReview, eligibleToReview }) {
    const { auth } = usePage().props;
    const [editing, setEditing] = useState(false);
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        rating: userReview?.rating ?? 5,
        comment: userReview?.comment ?? '',
    });

    useEffect(() => {
        setEditing(false);
        reset('rating', 'comment');
        setData({
            rating: userReview?.rating ?? 5,
            comment: userReview?.comment ?? '',
        });
    }, [userReview?.id]);

    const submitReview = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(false);
                reset();
            },
        };

        if (editing && userReview) {
            patch(route('reviews.update', userReview.id), options);
        } else {
            post(route('reviews.store', product.id), options);
        }
    };

    const deleteReview = () => {
        if (window.confirm('Hapus ulasan ini?')) {
            router.delete(route('reviews.destroy', userReview.id), { preserveScroll: true });
        }
    };

    const averageRating = Number(product.reviews_avg_rating ?? 0);

    return (
        <section className="mt-16 rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9" aria-labelledby="reviews-heading">
            <div className="flex flex-col gap-5 border-b border-slate-100 pb-7 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Pengalaman pelanggan</p>
                    <h2 id="reviews-heading" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Ulasan Produk</h2>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-3xl font-semibold text-slate-950">{averageRating ? averageRating.toFixed(1) : '0.0'}</span>
                    <div><ReviewStars rating={Math.round(averageRating)} /><p className="mt-1 text-sm text-slate-500">{reviews.length} ulasan</p></div>
                </div>
            </div>

            {auth?.user && userReview && !editing && (
                <div className="mt-7 rounded-xl bg-amber-50 p-5 ring-1 ring-amber-100">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div><p className="text-sm font-semibold text-amber-900">Ulasan kamu</p><ReviewStars rating={userReview.rating} /><p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{userReview.comment || 'Tanpa komentar.'}</p></div>
                        <div className="flex gap-3 text-sm font-semibold"><button type="button" onClick={() => setEditing(true)} className="text-amber-800 hover:text-amber-950">Edit</button><button type="button" onClick={deleteReview} className="text-red-600 hover:text-red-800">Hapus</button></div>
                    </div>
                </div>
            )}

            {auth?.user && (canReview || editing) && (
                <form onSubmit={submitReview} className="mt-7 rounded-xl border border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-900">{editing ? 'Edit ulasan kamu' : 'Tulis ulasan'}</h3>
                    <div className="mt-4"><span className="text-sm font-medium text-slate-700">Rating</span><ReviewStars rating={data.rating} interactive onChange={(rating) => setData('rating', rating)} />{errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating}</p>}</div>
                    <label htmlFor="review-comment" className="mt-4 block text-sm font-medium text-slate-700">Komentar <span className="font-normal text-slate-400">(opsional)</span></label>
                    <textarea id="review-comment" rows="4" value={data.comment} onChange={(event) => setData('comment', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300 focus:border-amber-500 focus:ring-amber-500" placeholder="Bagikan pengalaman kamu dengan produk ini" />
                    {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment}</p>}
                    {errors.review && <p className="mt-1 text-sm text-red-600">{errors.review}</p>}
                    <div className="mt-4 flex gap-3"><button type="submit" disabled={processing} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-300">{processing ? 'Menyimpan...' : editing ? 'Simpan perubahan' : 'Kirim ulasan'}</button>{editing && <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>}</div>
                </form>
            )}

            {auth?.user && !userReview && !canReview && (
                <p className="mt-7 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">{eligibleToReview ? 'Kamu sudah memiliki ulasan untuk produk ini.' : 'Beli dan terima produk ini dulu untuk bisa memberi ulasan.'}</p>
            )}
            {!auth?.user && <p className="mt-7 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">Login dan terima produk ini dulu untuk bisa memberi ulasan.</p>}

            <div className="mt-8 space-y-6">
                {reviews.length === 0 ? <p className="text-sm text-slate-500">Belum ada ulasan untuk produk ini</p> : reviews.map((review) => (
                    <article key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{review.user.name}</p><ReviewStars rating={review.rating} /></div><time className="text-xs text-slate-400" dateTime={review.created_at}>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(review.created_at))}</time></div>
                        {review.comment && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">{review.comment}</p>}
                    </article>
                ))}
            </div>
        </section>
    );
}

export default function Show({ product, relatedProducts = [], isWishlisted = false, reviews = [], userReview = null, canReview = false, eligibleToReview = false }) {
    const { auth, cart_count: cartCount = 0, wishlist_count: wishlistCount = 0, flash = {} } = usePage().props;
    const galleryImages = product.images?.length
        ? product.images.map((image) => image.path)
        : product.image_path
          ? [product.image_path]
          : [];
    const [selectedImage, setSelectedImage] = useState(galleryImages[0] ?? null);
    const [quantity, setQuantity] = useState(product.stock > 0 ? 1 : 0);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        setSelectedImage(galleryImages[0] ?? null);
        setQuantity(product.stock > 0 ? 1 : 0);
    }, [product.id]);

    const averageRating = product.reviews_avg_rating
        ? Number(product.reviews_avg_rating)
        : null;
    const stockAvailable = product.stock > 0;

    const addToCart = () => {
        setIsAdding(true);
        router.post(route('cart.add'), {
            product_id: product.id,
            quantity,
            return_to: `${window.location.pathname}${window.location.search}`,
        }, {
            preserveScroll: true,
            onFinish: () => setIsAdding(false),
        });
    };

    return (
        <>
            <Head title={`${product.name} - Banijya Shop`} />

            <div className="min-h-screen bg-slate-50">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <Link href={route('products.index')} className="text-xl font-semibold tracking-tight text-slate-900">
                            Banijya Shop
                        </Link>
                        <div className="flex items-center gap-5">
                            {auth?.user && <><WishlistLink count={wishlistCount} /><CartLink count={cartCount} /></>}
                            <BackButton fallback={route('products.index')} />
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                    <nav className="mb-8 text-sm text-slate-500" aria-label="Breadcrumb">
                        <Link href={route('products.index')} className="transition hover:text-slate-900">
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
                                    onClick={addToCart}
                                    disabled={!stockAvailable || isAdding}
                                    className="min-h-11 flex-1 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                    {isAdding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                                </button>
                                <WishlistButton productId={product.id} isWishlisted={auth?.user ? isWishlisted : false} className="min-h-11 w-12" />
                            </div>
                            {flash.success && (
                                <p className="mt-4 text-sm font-medium text-emerald-700" role="status">{flash.success}</p>
                            )}
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
                    <ReviewSection
                        product={product}
                        reviews={reviews}
                        userReview={userReview}
                        canReview={canReview}
                        eligibleToReview={eligibleToReview}
                    />
                </main>
            </div>
        </>
    );
}
