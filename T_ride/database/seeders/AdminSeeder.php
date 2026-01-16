<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'phone_number' => '03001234567',
                'status' => 'active',
                'wallet_balance' => 0.00,
                'email_verified_at' => now(),
            ]
        );

        $adminRole = Role::findByName('admin', 'api');
        $admin->assignRole($adminRole);
    }
}
