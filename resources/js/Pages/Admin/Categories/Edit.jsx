import AdminCategoryForm from '@/Components/AdminCategoryForm';
import AdminLayout from '@/Layouts/AdminLayout';

export default function Edit({ category, categories = [] }) {
    return <AdminLayout title="Edit Kategori"><div className="border-b border-slate-200 bg-white px-6 py-6 lg:px-10"><h1 className="text-2xl font-semibold text-slate-950">Edit Kategori</h1><p className="mt-1 text-sm text-slate-500">{category.name}</p></div><div className="mx-auto max-w-3xl px-6 py-10 lg:px-10"><div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><AdminCategoryForm category={category} categories={categories} /></div></div></AdminLayout>;
}