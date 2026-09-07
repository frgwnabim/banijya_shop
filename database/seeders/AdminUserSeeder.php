<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@banijyashop.com'],
            [
                'name' => 'Banijya Admin',
                'role' => 'admin',
                'password' => Hash::make('Admin@12345'),
                'email_verified_at' => now(),
            ],
        );
    }
}
