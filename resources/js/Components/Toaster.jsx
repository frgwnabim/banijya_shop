import { useEffect, useRef, useState } from 'react';

const TOAST_EVENT = 'banijya:toast';

export function toast(message, type = 'success') {
    window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }));
}

const styles = {
    success: 'bg-slate-900 text-white',
    error: 'bg-red-600 text-white',
};

export default function Toaster() {
    const [toasts, setToasts] = useState([]);
    const idRef = useRef(0);

    useEffect(() => {
        const handler = (event) => {
            const id = ++idRef.current;
            setToasts((current) => [...current, { id, ...event.detail }]);
            window.setTimeout(() => {
                setToasts((current) => current.filter((item) => item.id !== id));
            }, 2600);
        };

        window.addEventListener(TOAST_EVENT, handler);

        return () => window.removeEventListener(TOAST_EVENT, handler);
    }, []);

    const dismiss = (id) => setToasts((current) => current.filter((item) => item.id !== id));

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-6 sm:top-6 sm:items-end" aria-live="polite">
            {toasts.map((item) => (
                <div
                    key={item.id}
                    role="status"
                    className={`toast-enter pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ring-black/5 ${styles[item.type] ?? styles.success}`}
                >
                    <svg className="h-5 w-5 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M20.8 8.7c0 5.1-8.8 10-8.8 10s-8.8-4.9-8.8-10A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z" />
                    </svg>
                    <span className="flex-1">{item.message}</span>
                    <button type="button" onClick={() => dismiss(item.id)} className="text-white/60 transition hover:text-white" aria-label="Tutup notifikasi">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" /></svg>
                    </button>
                </div>
            ))}
        </div>
    );
}
