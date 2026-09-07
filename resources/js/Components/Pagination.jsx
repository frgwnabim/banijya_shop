import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex flex-wrap justify-center gap-2" aria-label="Pagination">
            {links.map((link, index) => (
                <Link
                    key={`${link.label}-${index}`}
                    href={link.url || '#'}
                    preserveScroll
                    className={`rounded-md px-3 py-2 text-sm transition ${
                        link.active
                            ? 'bg-slate-900 text-white'
                            : link.url
                              ? 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                              : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    aria-current={link.active ? 'page' : undefined}
                    aria-disabled={!link.url}
                />
            ))}
        </nav>
    );
}
