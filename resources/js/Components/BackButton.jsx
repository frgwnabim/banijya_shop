import { router } from '@inertiajs/react';

let visitedPages = 0;

// Dipanggil sekali dari app.jsx supaya tombol kembali tahu apakah ada halaman sebelumnya di dalam aplikasi.
export function trackNavigation() {
    router.on('navigate', () => {
        visitedPages += 1;
    });
}

const cameFromThisSite = () => {
    try {
        return Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch {
        return false;
    }
};

export default function BackButton({ fallback = '/', className = '', label = 'Kembali' }) {
    const goBack = () => {
        if (window.history.length > 1 && (visitedPages > 1 || cameFromThisSite())) {
            window.history.back();
            return;
        }

        router.visit(fallback);
    };

    return (
        <button
            type="button"
            onClick={goBack}
            className={`inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-900 ${className}`}
        >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            {label}
        </button>
    );
}
