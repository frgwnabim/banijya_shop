import { Link } from '@inertiajs/react';

export default function CartLink({ count = 0, className = '' }) {
    return (
        <Link
            href={route('cart.index')}
            className={`relative inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 ${className}`}
            aria-label={`Keranjang, ${count} item`}
        >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l1.6 10.2a2 2 0 0 0 2 1.8h7.8a2 2 0 0 0 1.9-1.4L21 7H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
            </svg>
            <span>Keranjang</span>
            {count > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-white">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}