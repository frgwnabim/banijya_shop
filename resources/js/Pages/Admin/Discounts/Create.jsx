import AdminDiscountForm from '@/Components/AdminDiscountForm';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Create() {
    return (
        <AdminLayout title="Tambah Discount">
            <div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10">
                <h1 className="text-2xl font-semibold text-slate-950">Tambah Discount</h1>
            </div>
            <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
                <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
                    <AdminDiscountForm />
                </div>
            </div>
        </AdminLayout>
    );
}
