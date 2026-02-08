<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Vendor;
use App\Models\Category;
use Faker\Factory;

class VendorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = Category::all();

        if ($categories->isEmpty()) {
            return;
        }

        $faker = Factory::create();

        for ($i = 0; $i < 20; $i++) {
            Vendor::create([
                'name' => $faker->company,
                'category_id' => $categories->random()->id,
                'address' => $faker->address,
                'logo' => null,
                'total_orders' => $faker->numberBetween(0, 500),
                'total_revenue' => $faker->randomFloat(2, 0, 5000),
                'rating' => $faker->randomFloat(1, 3, 5),
                'commission_rate' => 10.00,
                'status' => 1,
                'is_open' => true,
            ]);
        }
    }
}
