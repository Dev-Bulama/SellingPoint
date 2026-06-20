<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@sellingpoint.com'],
            [
                'name'              => 'Admin User',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ]
        );
        $admin->assignRole('admin');

        $customer = User::updateOrCreate(
            ['email' => 'customer@sellingpoint.com'],
            [
                'name'              => 'Test Customer',
                'phone'             => '08012345678',
                'password'          => Hash::make('password'),
                'email_verified_at' => now(),
                'is_active'         => true,
            ]
        );
        $customer->assignRole('customer');
    }
}
