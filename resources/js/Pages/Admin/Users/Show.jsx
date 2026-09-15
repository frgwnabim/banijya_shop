import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const roleLabels = { customer: 'Customer', admin: 'Admin' };

const statusLabels = {
    pending: 'Pending',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
};

const statusClasses = {
    pending: 'bg-amber-100 text-amber-800',
    paid: 'bg-blue-100 text-blue-800',
    processing: 'bg-violet-100 text-violet-800',
    shipped: 'bg-orange-100 text-orange-800',
    delivered: 'bg-emerald-100 text-emerald-800',
};

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value));

const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));

export default function Show({ user, orders = [] }) {
    const { flash = {}, auth } = usePage().props;
    const isSelf = auth.user.id === user.id;
    const [pendingAction, setPendingAction] = useState(null);

    const { data, setData, patch, processing, errors, reset, clearErrors } = useForm({
        role: user.role,
        is_active: user.is_active,
    });

    const openToggleRole = () => {
        clearErrors();
        setData({ role: user.role === 'admin' ? 'customer' : 'admin', is_active: user.is_active });
        setPendingAction('role');
    };

    const openToggleActive = () => {
        clearErrors();
        setData({ role: user.role, is_active: !user.is_active });
        setPendingAction('active');
    };

    const close = () => {
        setPendingAction(null);
        reset();
        clearErrors();
    };

    const submit = (event) => {
        event.preventDefault();
        patch(route('admin.users.update', user.id), {
            preserveScroll: true,
            onSuccess: () => close(),
        });
    };

    const destroy = () => {
        if (window.confirm(`Hapus user ${user.name}? Aksi ini tidak bisa dibatalkan.`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AdminLayout title="Detail User">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">User management</p>
                        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{user.name}</h1>
                    </div>
                    <Link href={route('admin.users.index')} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                        ← Kembali ke daftar user
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 lg:px-10">
                {flash.success && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{flash.success}</div>}
                {flash.error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{flash.error}</div>}

                <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-sm text-slate-500">Email</p>
                            <p className="mt-1 font-medium text-slate-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Nomor telepon</p>
                            <p className="mt-1 font-medium text-slate-900">{user.phone ?? '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Role</p>
                            <p className="mt-1 font-medium text-slate-900">{roleLabels[user.role] ?? user.role}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Status akun</p>
                            <p className={`mt-1 font-medium ${user.is_active ? 'text-emerald-700' : 'text-red-700'}`}>{user.is_active ? 'Aktif' : 'Nonaktif'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Bergabung sejak</p>
                            <p className="mt-1 font-medium text-slate-900">{formatDate(user.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Jumlah order</p>
                            <p className="mt-1 font-medium text-slate-900">{user.orders_count ?? orders.length}</p>
                        </div>
                    </div>

                    {isSelf ? (
                        <p className="mt-8 border-t border-slate-100 pt-6 text-sm font-medium text-slate-500">
                            Ini adalah akunmu sendiri. Ubah role/status/hapus akun tidak tersedia untuk akun sendiri.
                        </p>
                    ) : (
                        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
                            <SecondaryButton onClick={openToggleRole}>
                                Ubah jadi {user.role === 'admin' ? 'Customer' : 'Admin'}
                            </SecondaryButton>
                            <SecondaryButton onClick={openToggleActive}>
                                {user.is_active ? 'Nonaktifkan Akun' : 'Aktifkan Akun'}
                            </SecondaryButton>
                            <DangerButton onClick={destroy}>Hapus User</DangerButton>
                        </div>
                    )}
                </section>

                <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <h2 className="text-lg font-semibold text-slate-900">Riwayat Order (terbaru)</h2>
                    <div className="mt-5 divide-y divide-slate-100">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={route('admin.orders.show', order.id)}
                                className="flex items-center justify-between gap-4 py-4 transition first:pt-0 last:pb-0 hover:bg-slate-50"
                            >
                                <div>
                                    <p className="font-medium text-slate-900">{order.order_number}</p>
                                    <p className="mt-1 text-sm text-slate-500">{formatDate(order.created_at)} · {order.items_count} item</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                        {statusLabels[order.status] ?? order.status}
                                    </span>
                                    <span className="font-semibold text-slate-900">{formatRupiah(order.total_amount)}</span>
                                </div>
                            </Link>
                        ))}
                        {orders.length === 0 && <p className="py-6 text-center text-sm text-slate-500">User ini belum pernah membuat order.</p>}
                    </div>
                </section>
            </div>

            <Modal show={pendingAction !== null} onClose={close}>
                <form onSubmit={submit} className="p-6">
                    {pendingAction === 'role' && (
                        <>
                            <h2 className="text-lg font-semibold text-slate-950">Ubah role user?</h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Role <strong>{user.name}</strong> akan diubah dari <strong>{roleLabels[user.role]}</strong> menjadi{' '}
                                <strong>{roleLabels[data.role]}</strong>.
                            </p>
                        </>
                    )}
                    {pendingAction === 'active' && (
                        <>
                            <h2 className="text-lg font-semibold text-slate-950">
                                {data.is_active ? 'Aktifkan' : 'Nonaktifkan'} akun ini?
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {data.is_active
                                    ? `${user.name} akan bisa login kembali ke sistem.`
                                    : `${user.name} tidak akan bisa login sampai diaktifkan kembali.`}
                            </p>
                        </>
                    )}
                    <InputError message={errors.role} className="mt-2" />
                    <InputError message={errors.is_active} className="mt-2" />

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton type="button" onClick={close}>Batal</SecondaryButton>
                        <PrimaryButton type="submit" disabled={processing}>Konfirmasi</PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
