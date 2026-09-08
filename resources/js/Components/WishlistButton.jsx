import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function WishlistButton({ productId, isWishlisted = false, className = '' }) {
    const [active, setActive] = useState(isWishlisted);
    const [isBusy, setIsBusy] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        setActive(isWishlisted);
    }, [isWishlisted]);

    const toggle = () => {
        setIsBusy(true);
        router.post(route('wishlist.toggle', productId), {
            return_to: `${window.location.pathname}${window.location.search}`,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const nextActive = !active;
                setActive(nextActive);
                setFeedback(nextActive ? 'Ditambahkan ke wishlist' : 'Dihapus dari wishlist');
                window.setTimeout(() => setFeedback(''), 2200);
            },
            onFinish: () => setIsBusy(false),
        });
    };

    return (
        <span className="relative inline-flex">
            <button
                type="button"
                onClick={toggle}
                disabled={isBusy}
                className={`inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-rose-500 transition hover:border-rose-400 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60 ${className}`}
                aria-label={active ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
                title={active ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
            >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.8 8.7c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />
                </svg>
            </button>
            {feedback && (
                <span className="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg" role="status">
                    {feedback}
                </span>
            )}
        </span>
    );
}