import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AdminLayout title="Dashboard">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">Admin area</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
            </div>
            <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p className="text-slate-600">Pilih modul admin untuk mulai mengelola Banijya Shop.</p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Link href={route('admin.products.index')} className="rounded-lg border border-slate-200 p-5 transition hover:border-amber-400 hover:bg-amber-50"><p className="font-semibold text-slate-900">Produk</p><p className="mt-1 text-sm text-slate-500">Kelola katalog dan status produk.</p></Link>
                        <Link href={route('admin.categories.index')} className="rounded-lg border border-slate-200 p-5 transition hover:border-amber-400 hover:bg-amber-50"><p className="font-semibold text-slate-900">Kategori</p><p className="mt-1 text-sm text-slate-500">Kelola kategori dan sub-kategori.</p></Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
