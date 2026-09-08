import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, usePage } from '@inertiajs/react';

const links = [
    { label: 'Dashboard', routeName: 'admin.dashboard', active: 'admin.dashboard' },
    { label: 'Produk', routeName: 'admin.products.index', active: 'admin.products.*' },
    { label: 'Kategori', routeName: 'admin.categories.index', active: 'admin.categories.*' },
];

const upcoming = ['Inventory', 'Orders', 'Users', 'Discounts', 'Sales Dashboard'];

export default function AdminLayout({ children, title = 'Admin' }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title={`${title} - Banijya Shop`} />
            <div className="min-h-screen bg-slate-100 lg:flex">
                <aside className="w-full shrink-0 border-b border-slate-200 bg-slate-950 text-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
                    <div className="flex items-center justify-between px-5 py-5 lg:block">
                        <Link href={route('admin.dashboard')} className="flex items-center gap-3 text-lg font-semibold tracking-tight">
                            <ApplicationLogo className="h-8 w-auto fill-current text-amber-400" />
                            Banijya Admin
                        </Link>
                        <span className="text-xs text-slate-400 lg:hidden">{auth.user.name}</span>
                    </div>
                    <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:px-3" aria-label="Admin navigation">
                        {links.map((link) => (
                            <Link key={link.routeName} href={route(link.routeName)} className={`block whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition ${route().current(link.active) ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                                {link.label}
                            </Link>
                        ))}
                        <div className="hidden border-t border-slate-800 pt-4 lg:block">
                            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Segera hadir</p>
                            {upcoming.map((label) => <span key={label} className="block rounded-lg px-3 py-2 text-sm text-slate-500">{label}</span>)}
                        </div>
                    </nav>
                    <div className="hidden border-t border-slate-800 px-5 py-5 lg:block">
                        <p className="text-sm font-medium text-white">{auth.user.name}</p>
                        <Link href={route('products.index')} className="mt-2 block text-xs text-slate-400 hover:text-amber-400">Lihat toko customer</Link>
                    </div>
                </aside>
                <main className="min-w-0 flex-1">{children}</main>
            </div>
        </>
    );
}