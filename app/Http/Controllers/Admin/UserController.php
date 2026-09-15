<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminUserUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $role = $request->query('role');
        $role = in_array($role, ['customer', 'admin'], true) ? $role : null;

        $users = User::query()
            ->withCount('orders')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'ILIKE', "%{$search}%")->orWhere('email', 'ILIKE', "%{$search}%");
            }))
            ->when($role, fn ($query) => $query->where('role', $role))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'search' => $search,
            'role' => $role,
        ]);
    }

    public function show(User $user): Response
    {
        $user->loadCount('orders');

        return Inertia::render('Admin/Users/Show', [
            'user' => $user,
            'orders' => $user->orders()
                ->withCount('items')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($order) => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'total_amount' => (float) $order->total_amount,
                    'items_count' => $order->items_count,
                    'created_at' => $order->created_at?->toISOString(),
                ]),
        ]);
    }

    public function update(AdminUserUpdateRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if ($user->id === $request->user()->id && ($data['role'] !== 'admin' || ! $data['is_active'])) {
            throw ValidationException::withMessages([
                'role' => 'Kamu tidak bisa mengubah role atau menonaktifkan akunmu sendiri.',
            ]);
        }

        $user->update($data);

        return back()->with('success', 'Data user berhasil diperbarui.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            throw ValidationException::withMessages([
                'user' => 'Kamu tidak bisa menghapus akunmu sendiri.',
            ]);
        }

        if ($user->orders()->exists()) {
            throw ValidationException::withMessages([
                'user' => 'User ini punya riwayat order dan tidak bisa dihapus. Nonaktifkan akun sebagai gantinya.',
            ]);
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus.');
    }
}
