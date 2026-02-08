<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use App\Models\Driver;

class RentalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // 1. Vehicles
        $vehicleTypes = ['Sedan', 'SUV', 'Minivan', 'Scooter', 'Electric Bike', 'Van'];
        
        for ($i = 0; $i < 10; $i++) {
            $vin = strtoupper($faker->bothify('VIN???######'));
            $plate = strtoupper($faker->bothify('ABC-####'));

            DB::table('vehicles')->insert([
                'name' => $faker->randomElement(['Toyota Prius', 'Honda Civic', 'Ford Transit', 'Nissan Leaf', 'Yamaha Scooter']),
                'year' => $faker->year(),
                'vin' => $vin,
                'plate_number' => $plate,
                'type' => $faker->randomElement($vehicleTypes),
                'daily_rate' => $faker->randomFloat(2, 25, 60),
                'status' => $faker->randomElement(['available', 'rented', 'maintenance']),
                'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
                'updated_at' => now(),
            ]);
        }

        // 2. Rentals (Contracts)
        $drivers = Driver::all();
        $vehicles = DB::table('vehicles')->get();

        if ($drivers->isNotEmpty() && $vehicles->isNotEmpty()) {
            for ($i = 0; $i < 15; $i++) {
                $vehicle = $vehicles->random();
                $driver = $drivers->random();

                // Simple check if vehicle is rented, but for dummy data we can skip strict logic or just filter
                // Let's just insert some contracts
                
                $startDate = $faker->dateTimeBetween('-3 months', 'now');
                $endDate = (clone $startDate)->modify('+' . rand(1, 4) . ' weeks');

                DB::table('rentals')->insert([
                    'contract_id' => 'CTR-' . strtoupper($faker->bothify('??####')),
                    'driver_id' => $driver->id,
                    'vehicle_id' => $vehicle->id,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'weekly_rate' => $vehicle->daily_rate * 7 * 0.9, // 10% discount for weekly
                    'outstanding_amount' => $faker->randomFloat(2, 0, 200),
                    'next_payment_date' => (clone $endDate)->modify('+1 week'), // simplified
                    'status' => $faker->randomElement(['active', 'expired', 'closed']),
                    'created_at' => $startDate,
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
