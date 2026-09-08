import Pagination from '@/Components/Pagination';
import CartLink from '@/Components/CartLink';
import WishlistButton from '@/Components/WishlistButton';
import WishlistLink from '@/Components/WishlistLink';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value));

const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'price_asc', label: 'Harga: Termurah' },
    { value: 'price_desc', label: 'Harga: Termahal' },
    { value: 'name_asc', label: 'Nama: A-Z' },
    { value: 'name_desc', label: 'Nama: Z-A' },
];

export default function Index({
    products,
    search = '',
    sort = 'newest',
    categories = [],
    filters = {},
    wishlistedProductIds = [],
}) {
    const { auth, cart_count: cartCount = 0, wishlist_count: wishlistCount = 0 } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(search);
    const [filterState, setFilterState] = useState({
        category: filters.category ?? [],
        min_price: filters.min_price ?? '',
        max_price: filters.max_price ?? '',
        in_stock: filters.in_stock ?? false,
    });
    const [activeFilters, setActiveFilters] = useState(filterState);
    const [sortValue, setSortValue] = useState(sort);
    const [isSearching, setIsSearching] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const cancelTokenRef = useRef(null);
    const requestIdRef = useRef(0);
    const initialRenderRef = useRef(true);

    const visitWithFilters = (
        nextFilters,
        nextSearch = searchTerm,
        nextSort = sortValue,
    ) => {
        cancelTokenRef.current?.cancel();
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setIsFiltering(true);

        router.get(
            route('products.index'),
            {
                search: nextSearch.trim() || undefined,
                category: nextFilters.category.length ? nextFilters.category : undefined,
                min_price: nextFilters.min_price || undefined,
                max_price: nextFilters.max_price || undefined,
                in_stock: nextFilters.in_stock ? 1 : undefined,
                sort: nextSort,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onCancelToken: (cancelToken) => {
                    cancelTokenRef.current = cancelToken;
                },
                onFinish: () => {
                    if (requestIdRef.current === requestId) {
                        setIsFiltering(false);
                    }
                },
            },
        );
    };

    useEffect(() => {
        if (initialRenderRef.current) {
            initialRenderRef.current = false;
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            cancelTokenRef.current?.cancel();
            const requestId = requestIdRef.current + 1;
            requestIdRef.current = requestId;
            setIsSearching(true);

            router.get(
                route('products.index'),
                {
                    search: searchTerm.trim() || undefined,
                    category: activeFilters.category.length
                        ? activeFilters.category
                        : undefined,
                    min_price: activeFilters.min_price || undefined,
                    max_price: activeFilters.max_price || undefined,
                    in_stock: activeFilters.in_stock ? 1 : undefined,
                    sort: sortValue,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onCancelToken: (cancelToken) => {
                        cancelTokenRef.current = cancelToken;
                    },
                    onFinish: () => {
                        if (requestIdRef.current === requestId) {
                            setIsSearching(false);
                        }
                    },
                },
            );
        }, 400);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm]);

    const applyFilters = () => {
        setActiveFilters(filterState);
        visitWithFilters(filterState);
    };

    const changeSort = (nextSort) => {
        setSortValue(nextSort);
        visitWithFilters(activeFilters, searchTerm, nextSort);
    };

    const resetFilters = () => {
        const emptyFilters = {
            category: [],
            min_price: '',
            max_price: '',
            in_stock: false,
        };

        setFilterState(emptyFilters);
        setActiveFilters(emptyFilters);
        visitWithFilters(emptyFilters);
    };

    const removeCategoryFilter = (categoryId) => {
        const nextFilters = {
            ...activeFilters,
            category: activeFilters.category.filter((id) => id !== categoryId),
        };

        setFilterState(nextFilters);
        setActiveFilters(nextFilters);
        visitWithFilters(nextFilters);
    };

    const removeValueFilter = (key) => {
        const nextFilters = { ...activeFilters, [key]: key === 'in_stock' ? false : '' };

        setFilterState(nextFilters);
        setActiveFilters(nextFilters);
        visitWithFilters(nextFilters);
    };

    return (
        <>
            <Head title="Produk - Banijya Shop" />

            <div className="min-h-screen bg-slate-50">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                        <Link href="/" className="text-xl font-semibold tracking-tight text-slate-900">
                            Banijya Shop
                        </Link>
                        <div className="flex items-center gap-5">
                            {auth?.user ? (
                                <>
                                    <WishlistLink count={wishlistCount} />
                                    <CartLink count={cartCount} />
                                </>
                            ) : <Link href={route('login')} className="text-sm font-medium text-slate-600 transition hover:text-slate-900">Masuk</Link>}
                        </div>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                    <div className="mb-10 flex items-end justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                                Koleksi Banijya
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                Jelajahi produk pilihan
                            </h1>
                            <p className="mt-3 max-w-xl text-slate-600">
                                Temukan kebutuhan sehari-hari yang dipilih untuk menemani ritme Anda.
                            </p>
                        </div>
                        <span className="hidden text-sm text-slate-500 sm:block">
                            {products.total} produk
                        </span>
                    </div>

                    <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
                        <aside className="lg:sticky lg:top-6">
                            <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                                        Filter produk
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="text-xs font-semibold text-slate-500 transition hover:text-slate-900"
                                    >
                                        Reset
                                    </button>
                                </div>

                                <div className="mt-5 space-y-6">
                                    <fieldset>
                                        <legend className="text-sm font-medium text-slate-800">
                                            Kategori
                                        </legend>
                                        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
                                            {categories.map((category) => (
                                                <label
                                                    key={category.id}
                                                    className="flex items-center gap-2 text-sm text-slate-600"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filterState.category.includes(category.id)}
                                                        onChange={() =>
                                                            setFilterState((current) => ({
                                                                ...current,
                                                                category: current.category.includes(category.id)
                                                                    ? current.category.filter((id) => id !== category.id)
                                                                    : [...current.category, category.id],
                                                            }))
                                                        }
                                                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                                    />
                                                    {category.name}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <legend className="text-sm font-medium text-slate-800">
                                            Rentang harga
                                        </legend>
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                value={filterState.min_price}
                                                onChange={(event) =>
                                                    setFilterState((current) => ({
                                                        ...current,
                                                        min_price: event.target.value,
                                                    }))
                                                }
                                                placeholder="Min"
                                                className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                                                aria-label="Harga minimum"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                value={filterState.max_price}
                                                onChange={(event) =>
                                                    setFilterState((current) => ({
                                                        ...current,
                                                        max_price: event.target.value,
                                                    }))
                                                }
                                                placeholder="Maks"
                                                className="w-full rounded-lg border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
                                                aria-label="Harga maksimum"
                                            />
                                        </div>
                                    </fieldset>

                                    <fieldset>
                                        <label className="flex items-start gap-2 text-sm leading-5 text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={filterState.in_stock}
                                                onChange={(event) =>
                                                    setFilterState((current) => ({
                                                        ...current,
                                                        in_stock: event.target.checked,
                                                    }))
                                                }
                                                className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                            />
                                            Hanya tampilkan yang tersedia
                                        </label>
                                    </fieldset>
                                </div>

                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                    Terapkan Filter
                                </button>
                            </section>
                        </aside>

                        <div className="min-w-0">
                            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="relative min-w-0 flex-1">
                                    <label htmlFor="product-search" className="sr-only">
                                        Cari produk
                                    </label>
                                    <input
                                        id="product-search"
                                        type="search"
                                        value={searchTerm}
                                        onChange={(event) => setSearchTerm(event.target.value)}
                                        placeholder="Cari nama atau deskripsi produk"
                                        className="block w-full rounded-lg border-slate-300 bg-white px-4 py-3 pe-12 text-sm text-slate-900 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        aria-busy={isSearching || isFiltering}
                                    />
                                    {(isSearching || isFiltering) && (
                                        <span
                                            className="absolute inset-y-0 end-4 flex items-center"
                                            aria-label="Mencari produk"
                                        >
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
                                        </span>
                                    )}
                                </div>
                                <label className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-700">
                                    <span className="sr-only">Urutkan produk</span>
                                    <select
                                        value={sortValue}
                                        onChange={(event) => changeSort(event.target.value)}
                                        className="rounded-lg border-slate-300 bg-white py-3 pl-3 pr-9 text-sm text-slate-700 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        aria-label="Urutkan produk"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                        {(activeFilters.category.length > 0 ||
                        activeFilters.min_price ||
                        activeFilters.max_price ||
                        activeFilters.in_stock) && (
                        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
                            <span className="font-medium text-slate-600">Filter aktif:</span>
                            {activeFilters.category.map((categoryId) => {
                                const category = categories.find((item) => item.id === categoryId);

                                return (
                                    <button
                                        key={categoryId}
                                        type="button"
                                        onClick={() => removeCategoryFilter(categoryId)}
                                        className="rounded-full bg-amber-100 px-3 py-1 text-amber-900"
                                    >
                                        Kategori: {category?.name ?? categoryId} ×
                                    </button>
                                );
                            })}
                            {activeFilters.min_price && (
                                <button
                                    type="button"
                                    onClick={() => removeValueFilter('min_price')}
                                    className="rounded-full bg-slate-200 px-3 py-1 text-slate-700"
                                >
                                    Min: {formatRupiah(activeFilters.min_price)} ×
                                </button>
                            )}
                            {activeFilters.max_price && (
                                <button
                                    type="button"
                                    onClick={() => removeValueFilter('max_price')}
                                    className="rounded-full bg-slate-200 px-3 py-1 text-slate-700"
                                >
                                    Max: {formatRupiah(activeFilters.max_price)} ×
                                </button>
                            )}
                            {activeFilters.in_stock && (
                                <button
                                    type="button"
                                    onClick={() => removeValueFilter('in_stock')}
                                    className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800"
                                >
                                    Tersedia saja ×
                                </button>
                            )}
                        </div>
                    )}

                    {products.data.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {products.data.map((product) => (
                                <article
                                    key={product.id}
                                    className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="relative">
                                        <Link href={route('products.show', product.slug)} aria-label={`${product.name}, detail produk segera tersedia`}>
                                            <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                                                {product.image_path ? (
                                                    <img src={product.image_path} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-slate-100 text-sm font-medium text-amber-800">Banijya Shop</div>
                                                )}
                                            </div>
                                        </Link>
                                        <WishlistButton
                                            productId={product.id}
                                            isWishlisted={auth?.user ? wishlistedProductIds.includes(product.id) : false}
                                            className="absolute right-3 top-3 h-10 w-10 shadow-sm"
                                        />
                                    </div>

                                    <Link href={route('products.show', product.slug)} className="block p-5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{product.category?.name ?? 'Tanpa kategori'}</p>
                                        <h2 className="mt-2 line-clamp-2 min-h-12 text-lg font-semibold text-slate-900">{product.name}</h2>
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <p className="font-semibold text-slate-950">{formatRupiah(product.price)}</p>
                                            {product.stock > 0 ? <span className="text-xs font-medium text-emerald-700">Tersedia</span> : <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">Stok habis</span>}
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl bg-white px-6 py-16 text-center ring-1 ring-slate-200">
                            <p className="text-slate-600">
                                {search
                                    ? `Produk tidak ditemukan untuk '${search}'`
                                    : 'Belum ada produk aktif.'}
                            </p>
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                >
                                    Tampilkan semua produk
                                </button>
                            )}
                        </div>
                    )}

                            <div className="mt-10">
                                <Pagination links={products.links} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
