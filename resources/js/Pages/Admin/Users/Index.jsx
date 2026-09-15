import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';

const roleLabels = { customer: 'Customer', admin: 'Admin' };
const roleClasses = { customer: 'bg-slate-200 text-slate-700', admin: 'bg-amber-100 text-amber-800' };

const formatDate = (value) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value));

export default function Index({ users, search = '', role = null }) {
    const { flash = {} } = usePage().props;

    const submitFilters = (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        router.get(
            route('admin.users.index'),
            {
                search: form.elements.search.value || undefined,
                role: form.elements.role.value || undefined,
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout title="Users">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-600">User management</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">Users</h1>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
                {flash.success && <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{flash.success}</div>}
                {flash.error && <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{flash.error}</div>}

                <form onSubmit={submitFilters} className="mb-6 flex flex-wrap items-end gap-3">
                    <div>
                        <label className="block text-xs font-medium text-slate-600">Cari nama/email</label>
                        <input name="search" defaultValue={search} placeholder="Nama atau email" className="mt-1 w-64 rounded-lg border-slate-300" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600">Role</label>
                        <select name="role" defaultValue={role ?? ''} className="mt-1 rounded-lg border-slate-300">
                            <option value="">Semua</option>
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Terapkan</button>
                </form>

                <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <table className="min-w-full divide-y divide-slate-100 text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                {['Nama', 'Email', 'Role', 'Status', 'Jumlah Order', 'Bergabung', 'Aksi'].map((heading) => (
                                    <th key={heading} className="px-5 py-3 text-left font-semibold text-slate-600">{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.data.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-5 py-4 font-medium text-slate-900">{user.name}</td>
                                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleClasses[user.role]}`}>{roleLabels[user.role]}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-600">{user.orders_count}</td>
                                    <td className="px-5 py-4 text-slate-600">{formatDate(user.created_at)}</td>
                                    <td className="px-5 py-4">
                                        <Link href={route('admin.users.show', user.id)} className="text-sm text-blue-600 hover:text-blue-800">Lihat Detail</Link>
                                    </td>
                                </tr>
                            ))}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-slate-500">Tidak ada user yang cocok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6">
                    <Pagination links={users.links} />
                </div>
            </div>
        </AdminLayout>
    );
}
