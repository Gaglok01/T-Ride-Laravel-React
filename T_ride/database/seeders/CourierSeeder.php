<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;

class CourierSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Generate ~50 courier orders
        for ($i = 0; $i < 50; $i++) {
            DB::table('orders')->insert([
                'order_id' => 'ORD-' . strtoupper($faker->bothify('##??##')),
                'sender' => $faker->name,
                'recipient' => $faker->name,
                'package_type' => $faker->randomElement(['Document', 'Box', 'Fragile', 'Electronics']),
                'courier' => $faker->name, // Assuming this is courier name for now, or could be ID if linked
                'fee' => $faker->randomFloat(2, 5, 25),
                'status' => $faker->randomElement(['pending', 'processing', 'picked_up', 'delivered', 'cancelled']),
                'created_at' => $faker->dateTimeBetween('-30 days', 'now'),
                'updated_at' => now(),
            ]);
        }
    }
}
