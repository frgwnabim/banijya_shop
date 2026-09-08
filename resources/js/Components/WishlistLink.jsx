import { Link } from '@inertiajs/react';

export default function WishlistLink({ count = 0, className = '' }) {
    return (
        <Link
            href={route('wishlist.index')}
            className={`relative inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 ${className}`}
            aria-label={`Wishlist, ${count} item`}
        >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.8 8.7c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />
            </svg>
            <span>Wishlist</span>
            {count > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}