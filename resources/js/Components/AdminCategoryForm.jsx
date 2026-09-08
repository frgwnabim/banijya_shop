import { Link, useForm } from '@inertiajs/react';

export default function AdminCategoryForm({ category = null, categories = [] }) {
    const isEditing = Boolean(category);
    const { data, setData, post, processing, errors } = useForm({
        name: category?.name ?? '',
        parent_id: category?.parent_id ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        if (isEditing) {
            data._method = 'put';
            post(route('admin.categories.update', category.id));
        } else {
            post(route('admin.categories.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div><label className="text-sm font-medium text-slate-700">Nama kategori</label><input value={data.name} onChange={(event) => setData('name', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}</div>
            <div><label className="text-sm font-medium text-slate-700">Parent kategori <span className="font-normal text-slate-400">(opsional)</span></label><select value={data.parent_id} onChange={(event) => setData('parent_id', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300"><option value="">Tidak ada, kategori utama</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{errors.parent_id && <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>}</div>
            <div className="flex gap-3 border-t border-slate-100 pt-6"><button type="submit" disabled={processing} className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-300">{processing ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Tambah kategori'}</button><Link href={route('admin.categories.index')} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</Link></div>
        </form>
    );
}