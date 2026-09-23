import InputError from '@/Components/InputError';
import { Link, useForm } from '@inertiajs/react';

const toDatetimeLocal = (value) => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    const pad = (num) => String(num).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Simpan angka mentah (tanpa titik) untuk dikirim ke server.
const toDigits = (value) => {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(String(value))) {
        return String(Math.round(Number(value)));
    }

    return String(value).replace(/\D/g, '');
};

// Tampilkan angka dengan pemisah ribuan titik, contoh: 100000 -> 100.000.
const formatThousands = (digits) => (digits === '' ? '' : Number(digits).toLocaleString('id-ID'));

export default function AdminDiscountForm({ discount = null }) {
    const isEditing = Boolean(discount);
    const { data, setData, post, processing, errors } = useForm({
        code: discount?.code ?? '',
        type: discount?.type ?? 'percentage',
        value: discount?.value ?? '',
        min_purchase: toDigits(discount?.min_purchase),
        starts_at: toDatetimeLocal(discount?.starts_at) ?? '',
        expires_at: toDatetimeLocal(discount?.expires_at) ?? '',
        is_active: discount?.is_active ?? true,
    });

    const submit = (event) => {
        event.preventDefault();
        if (isEditing) {
            data._method = 'put';
            post(route('admin.discounts.update', discount.id));
        } else {
            post(route('admin.discounts.store'));
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <div>
                <label className="text-sm font-medium text-slate-700">Kode diskon</label>
                <input
                    value={data.code}
                    onChange={(event) => setData('code', event.target.value.toUpperCase())}
                    className="mt-2 block w-full rounded-lg border-slate-300 uppercase"
                    placeholder="Contoh: BANIJYA10"
                />
                <InputError message={errors.code} className="mt-1" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-medium text-slate-700">Tipe</label>
                    <select value={data.type} onChange={(event) => setData('type', event.target.value)} className="mt-2 block w-full rounded-lg border-slate-300">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (Rp)</option>
                    </select>
                    <InputError message={errors.type} className="mt-1" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">
                        Value {data.type === 'percentage' ? '(1-100)' : '(Rp)'}
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={data.value}
                        onChange={(event) => setData('value', event.target.value)}
                        className="mt-2 block w-full rounded-lg border-slate-300"
                    />
                    <InputError message={errors.value} className="mt-1" />
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-slate-700">
                    Minimal belanja <span className="font-normal text-slate-400">(opsional)</span>
                </label>
                <input
                    type="text"
                    inputMode="numeric"
                    value={formatThousands(data.min_purchase)}
                    onChange={(event) => setData('min_purchase', event.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, ''))}
                    className="mt-2 block w-full rounded-lg border-slate-300"
                    placeholder="Kosongkan kalau tidak ada minimal"
                />
                <InputError message={errors.min_purchase} className="mt-1" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label className="text-sm font-medium text-slate-700">Berlaku mulai</label>
                    <input
                        type="datetime-local"
                        value={data.starts_at}
                        onChange={(event) => setData('starts_at', event.target.value)}
                        className="mt-2 block w-full rounded-lg border-slate-300"
                    />
                    <InputError message={errors.starts_at} className="mt-1" />
                </div>
                <div>
                    <label className="text-sm font-medium text-slate-700">Berlaku sampai</label>
                    <input
                        type="datetime-local"
                        value={data.expires_at}
                        onChange={(event) => setData('expires_at', event.target.value)}
                        className="mt-2 block w-full rounded-lg border-slate-300"
                    />
                    <InputError message={errors.expires_at} className="mt-1" />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <input
                    id="is_active"
                    type="checkbox"
                    checked={data.is_active}
                    onChange={(event) => setData('is_active', event.target.checked)}
                    className="rounded border-slate-300"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">Aktifkan discount ini</label>
                <InputError message={errors.is_active} className="mt-1" />
            </div>

            <div className="flex gap-3 border-t border-slate-100 pt-6">
                <button type="submit" disabled={processing} className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-300">
                    {processing ? 'Menyimpan...' : isEditing ? 'Simpan perubahan' : 'Tambah discount'}
                </button>
                <Link href={route('admin.discounts.index')} className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Batal
                </Link>
            </div>
        </form>
    );
}
