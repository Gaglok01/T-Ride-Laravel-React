<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->call(AdminSeeder::class);
        $this->call(CategorySeeder::class); // Add this
        $this->call(VendorSeeder::class);   // Add this
        $this->call(RideSeeder::class);
        $this->call(CourierSeeder::class);
        $this->call(RentalSeeder::class);
    }
}
