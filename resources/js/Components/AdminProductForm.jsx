import { Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function AdminProductForm({ product = null, categories = [] }) {
    const isEditing = Boolean(product);
    const { data, setData, post, processing, errors } = useForm({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        stock: product?.stock ?? 0,
        category_id: product?.category_id ?? '',
        status: product?.status ?? 'active',
        sku: product?.sku ?? '',
        image: null,
    });
    const [preview, setPreview] = useState(product?.image_path ?? null);

    useEffect(() => () => preview?.startsWith('blob:') && URL.revokeObjectURL(preview), [preview]);

    const chooseImage = (event) => {
        const file = event.target.files?.[0] ?? null;
        setData('image', file);
        if (file) setPreview(URL.createObjectURL(file));
    };

    const submit = (event) => {
        event.preventDefault();
        const options = { forceFormData: true };
        if (isEditing) {
            data._method = 'put';
            post(route('admin.products.update', product.id), options);
        } else {
            post(route('admin.products.store'), options);
        }
    };

    const fieldError = (name) => errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>;

    return (
        <form onSubmit={submit} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                <div><label className="text-sm font-medium text-slate-700">Nama produk</label><input value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />{fieldError('name')}</div>
                <div><label className="text-sm font-medium text-slate-700">SKU <span className="font-normal text-slate-400">(opsional, otomatis jika kosong)</span></label><input value={data.sku} onChange={(e) => setData('sku', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />{fieldError('sku')}</div>
                <div><label className="text-sm font-medium text-slate-700">Harga</label><input type="number" min="0" step="0.01" value={data.price} onChange={(e) => setData('price', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />{fieldError('price')}</div>
                <div><label className="text-sm font-medium text-slate-700">Stok awal</label><input type="number" min="0" value={data.stock} onChange={(e) => setData('stock', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />{fieldError('stock')}</div>
                <div><label className="text-sm font-medium text-slate-700">Kategori</label><select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300"><option value="">Pilih kategori</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>{fieldError('category_id')}</div>
                <div><label className="text-sm font-medium text-slate-700">Status</label><select value={data.status} onChange={(e) => setData('status', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300"><option value="active">Active</option><option value="inactive">Inactive</option></select>{fieldError('status')}</div>
            </div>
            <div><label className="text-sm font-medium text-slate-700">Deskripsi</label><textarea rows="6" value={data.description} onChange={(e) => setData('description', e.target.value)} className="mt-2 block w-full rounded-lg border-slate-300" />{fieldError('description')}</div>
            <div><label className="text-sm font-medium text-slate-700">Gambar produk</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} className="mt-2 block w-full rounded-lg border-slate-300 text-sm" />{fieldError('image')}{preview && <img src={preview} alt="Preview produk" className="mt-4 h-40 w-40 rounded-lg object-cover ring-1 ring-slate-200" />}</div>
            <div className="flex gap-3 border-t border-slate-100 pt-6"><button type="submit" disabled={processing} className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-300">{processing ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Tambah produk'}</button><Link href={route('admin.products.index')} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</Link></div>
        </form>
    );
}