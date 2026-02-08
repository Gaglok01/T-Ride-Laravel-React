<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Driver;
use App\Models\Ride;
use App\Models\Vendor;
use App\Models\Category;
use App\Models\DeliveryOrder;
use Illuminate\Support\Facades\DB;

class RideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = \Faker\Factory::create();
        
        // Ensure we have some users and drivers
        $users = User::all();
        if($users->isEmpty()) {
            User::factory(20)->create();
            $users = User::all();
        }
        
        $drivers = Driver::all();
         if($drivers->isEmpty()) {
            // Create a dummy driver if none exist
             $user = User::factory()->create();
             $driver = Driver::create([
                 'user_id' => $user->id,
                 'status' => 'active',
                 'is_verified' => true,
                 'online' => true
             ]);
             $drivers = collect([$driver]);
        }

        // Vehicle Types
        $vehicleTypes = DB::table('types')->pluck('id');
        if($vehicleTypes->isEmpty()) {
             // Create a dummy type if none exist
             $typeId = DB::table('types')->insertGetId([
                 'name' => 'Standard',
                 'icon' => 'car',
                 'capacity' => 4,
                 'status' => 1
             ]);
             $vehicleTypes = collect([$typeId]);
        }

        // Base Coordinates (New York)
        $baseLat = 40.7549;
        $baseLng = -73.9840;

        // 1. COMPLETED RIDES (~50)
        for ($i = 0; $i < 50; $i++) {
            $created_at = $faker->dateTimeBetween('-30 days', '-1 hour');
            
            // Random offset for coordinates
            $pLat = $baseLat + ($faker->randomFloat(6, -0.05, 0.05));
            $pLng = $baseLng + ($faker->randomFloat(6, -0.05, 0.05));
            $dLat = $baseLat + ($faker->randomFloat(6, -0.05, 0.05));
            $dLng = $baseLng + ($faker->randomFloat(6, -0.05, 0.05));

            Ride::create([
                'ride_custom_id' => 'RIDE-' . strtoupper(uniqid()),
                'rider_id' => $users->random()->id,
                'driver_id' => $drivers->random()->id,
                'vehicle_type_id' => $vehicleTypes->random(),
                'pickup_address' => $faker->streetAddress . ', New York, NY',
                'dropoff_address' => $faker->streetAddress . ', New York, NY',
                'pickup_lat' => $pLat,
                'pickup_lng' => $pLng,
                'dropoff_lat' => $dLat,
                'dropoff_lng' => $dLng,
                'fare' => $faker->randomFloat(2, 10, 80),
                'payment_method' => $faker->randomElement(['Cash', 'Wallet', 'Card']),
                'payment_status' => 'paid',
                'status' => 'completed',
                'rating' => $faker->numberBetween(3, 5),
                'started_at' => $created_at,
                'completed_at' => (clone $created_at)->modify('+' . rand(10, 45) . ' minutes'),
                'created_at' => $created_at,
                'updated_at' => $created_at,
            ]);
        }

        // 2. ACTIVE RIDES (12+)
        // These are critical for the "Dispatch Panel" visualization
        for ($i = 0; $i < 12; $i++) {
            // Active rides started recently
            $started_at = now()->subMinutes(rand(1, 20));
            
            $pLat = $baseLat + ($faker->randomFloat(6, -0.03, 0.03));
            $pLng = $baseLng + ($faker->randomFloat(6, -0.03, 0.03));
            $dLat = $baseLat + ($faker->randomFloat(6, -0.03, 0.03));
            $dLng = $baseLng + ($faker->randomFloat(6, -0.03, 0.03));

            Ride::create([
                'ride_custom_id' => 'RIDE-ACT-' . strtoupper(uniqid()),
                'rider_id' => $users->random()->id,
                'driver_id' => $drivers->random()->id,
                'vehicle_type_id' => $vehicleTypes->random(),
                'pickup_address' => $faker->streetAddress . ', New York, NY',
                'dropoff_address' => $faker->streetAddress . ', New York, NY',
                'pickup_lat' => $pLat,
                'pickup_lng' => $pLng,
                'dropoff_lat' => $dLat,
                'dropoff_lng' => $dLng,
                'fare' => $faker->randomFloat(2, 15, 60),
                'payment_method' => 'Card',
                'payment_status' => 'pending',
                'status' => 'in_progress', // crucial
                'started_at' => $started_at,
                'created_at' => $started_at,
                'updated_at' => now(),
            ]);
        }

        // 3. PENDING RIDES (5)
        for ($i = 0; $i < 5; $i++) {
            $created_at = now()->subMinutes(rand(1, 10));
            
             $pLat = $baseLat + ($faker->randomFloat(6, -0.03, 0.03));
             $pLng = $baseLng + ($faker->randomFloat(6, -0.03, 0.03));
             $dLat = $baseLat + ($faker->randomFloat(6, -0.03, 0.03));
             $dLng = $baseLng + ($faker->randomFloat(6, -0.03, 0.03));
 
             Ride::create([
                 'ride_custom_id' => 'RIDE-PEN-' . strtoupper(uniqid()),
                 'rider_id' => $users->random()->id,
                 'driver_id' => null, // No driver yet
                 'vehicle_type_id' => $vehicleTypes->random(),
                 'pickup_address' => $faker->streetAddress . ', New York, NY',
                 'dropoff_address' => $faker->streetAddress . ', New York, NY',
                 'pickup_lat' => $pLat,
                 'pickup_lng' => $pLng,
                 'dropoff_lat' => $dLat,
                 'dropoff_lng' => $dLng,
                 'fare' => $faker->randomFloat(2, 15, 50),
                 'payment_method' => 'Cash',
                 'payment_status' => 'pending',
                 'status' => 'pending',
                 'created_at' => $created_at,
                 'updated_at' => $created_at,
             ]);
         }


        // --- DELIVERIES ---
        $vendors = Vendor::all();
        $categories = Category::all();

        if ($vendors->isNotEmpty() && $categories->isNotEmpty()) {
             for ($i = 0; $i < 20; $i++) {
                $created_at = $faker->dateTimeBetween('-30 days', 'now');
                
                DeliveryOrder::create([
                    'order_code' => 'DEL-' . strtoupper(uniqid()),
                    'customer_id' => $users->random()->id,
                    'vendor_id' => $vendors->random()->id,
                    'driver_id' => $drivers->random()->id,
                    'category_id' => $categories->random()->id,
                    'total_items' => $faker->numberBetween(1, 5),
                    'total_amount' => $faker->randomFloat(2, 20, 80), 
                    'status' => $faker->randomElement(['delivered', 'pending', 'on_the_way', 'cancelled']),
                    'created_at' => $created_at,
                    'updated_at' => $created_at,
                ]);
            }
        }
    }
}
