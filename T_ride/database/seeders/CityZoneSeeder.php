<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\ServiceZone;
use App\Models\TransportationHub;
use App\Models\RestrictedArea;
use App\Models\ExpansionPlan;

class CityZoneSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Cities
        $accra = City::create([
            'name' => 'Accra',
            'country' => 'Ghana',
            'timezone' => 'Africa/Accra',
            'currency' => 'GHS',
            'services' => ['Ride', 'Delivery', 'Courier'],
            'status' => 'active'
        ]);

        $lagos = City::create([
            'name' => 'Lagos',
            'country' => 'Nigeria',
            'timezone' => 'Africa/Lagos',
            'currency' => 'NGN',
            'services' => ['Ride', 'Delivery'],
            'status' => 'active'
        ]);

        $nairobi = City::create([
            'name' => 'Nairobi',
            'country' => 'Kenya',
            'timezone' => 'Africa/Nairobi',
            'currency' => 'KES',
            'services' => ['Ride', 'Delivery', 'Courier'],
            'status' => 'active'
        ]);

        $capeTown = City::create([
            'name' => 'Cape Town',
            'country' => 'South Africa',
            'timezone' => 'Africa/Johannesburg',
            'currency' => 'ZAR',
            'services' => ['Ride'],
            'status' => 'active'
        ]);

        $cairo = City::create([
            'name' => 'Cairo',
            'country' => 'Egypt',
            'timezone' => 'Africa/Cairo',
            'currency' => 'EGP',
            'services' => ['Ride', 'Delivery'],
            'status' => 'active'
        ]);

        // Create Service Zones for Accra
        $accraZones = [
            ['name' => 'Central Business District', 'price_multiplier' => 1.0],
            ['name' => 'Airport Zone', 'price_multiplier' => 1.5],
            ['name' => 'East Legon', 'price_multiplier' => 1.2],
            ['name' => 'Tema', 'price_multiplier' => 1.0],
            ['name' => 'Osu', 'price_multiplier' => 1.3],
            ['name' => 'Madina', 'price_multiplier' => 1.0],
        ];

        foreach ($accraZones as $zone) {
            ServiceZone::create([
                'city_id' => $accra->id,
                'name' => $zone['name'],
                'price_multiplier' => $zone['price_multiplier'],
                'status' => 'active'
            ]);
        }

        // Create Service Zones for Lagos
        $lagosZones = [
            ['name' => 'Victoria Island', 'price_multiplier' => 1.5],
            ['name' => 'Ikeja', 'price_multiplier' => 1.0],
            ['name' => 'Lekki', 'price_multiplier' => 1.3],
            ['name' => 'Surulere', 'price_multiplier' => 1.0],
        ];

        foreach ($lagosZones as $zone) {
            ServiceZone::create([
                'city_id' => $lagos->id,
                'name' => $zone['name'],
                'price_multiplier' => $zone['price_multiplier'],
                'status' => 'active'
            ]);
        }

        // Create Transportation Hubs
        TransportationHub::create([
            'city_id' => $accra->id,
            'name' => 'Kotoka International Airport',
            'type' => 'airport',
            'pickup_fee' => 5.00,
            'queue_capacity' => 50,
            'status' => 'active'
        ]);

        TransportationHub::create([
            'city_id' => $lagos->id,
            'name' => 'Murtala Mohammed International',
            'type' => 'airport',
            'pickup_fee' => 4.50,
            'queue_capacity' => 80,
            'status' => 'active'
        ]);

        TransportationHub::create([
            'city_id' => $nairobi->id,
            'name' => 'JKIA - Jomo Kenyatta International',
            'type' => 'airport',
            'pickup_fee' => 4.00,
            'queue_capacity' => 60,
            'status' => 'active'
        ]);

        TransportationHub::create([
            'city_id' => $capeTown->id,
            'name' => 'Cape Town International',
            'type' => 'airport',
            'pickup_fee' => 6.00,
            'queue_capacity' => 40,
            'status' => 'active'
        ]);

        TransportationHub::create([
            'city_id' => $accra->id,
            'name' => 'Accra Mall Hub',
            'type' => 'hub',
            'pickup_fee' => 0.00,
            'queue_capacity' => 20,
            'status' => 'active'
        ]);

        TransportationHub::create([
            'city_id' => $accra->id,
            'name' => 'Circle Interchange Station',
            'type' => 'station',
            'pickup_fee' => 0.00,
            'queue_capacity' => 30,
            'status' => 'active'
        ]);

        // Create Restricted Areas
        RestrictedArea::create([
            'city_id' => $accra->id,
            'name' => 'Military Zone A',
            'restriction_type' => 'no_entry',
            'reason' => 'Security',
            'effective_period' => 'Permanent',
            'status' => 'active'
        ]);

        RestrictedArea::create([
            'city_id' => $lagos->id,
            'name' => 'Stadium Area',
            'restriction_type' => 'time_based',
            'reason' => 'Events',
            'effective_period' => 'Match Days',
            'status' => 'active'
        ]);

        RestrictedArea::create([
            'city_id' => $nairobi->id,
            'name' => 'Presidential Area',
            'restriction_type' => 'no_entry',
            'reason' => 'Security',
            'effective_period' => 'Permanent',
            'status' => 'active'
        ]);

        RestrictedArea::create([
            'city_id' => $accra->id,
            'name' => 'Construction Zone B',
            'restriction_type' => 'pickup_only',
            'reason' => 'Road Work',
            'effective_period' => 'Until Dec 2026',
            'status' => 'active'
        ]);

        // Create Expansion Plans
        ExpansionPlan::create([
            'city_name' => 'Kumasi',
            'country' => 'Ghana',
            'stage' => 'research',
            'progress' => 25,
            'target_launch_date' => '2026-06-01',
            'notes' => 'Market research in progress'
        ]);

        ExpansionPlan::create([
            'city_name' => 'Kigali',
            'country' => 'Rwanda',
            'stage' => 'partnerships',
            'progress' => 50,
            'target_launch_date' => '2026-04-01',
            'notes' => 'Negotiating local partnerships'
        ]);

        ExpansionPlan::create([
            'city_name' => 'Addis Ababa',
            'country' => 'Ethiopia',
            'stage' => 'licensing',
            'progress' => 75,
            'target_launch_date' => '2026-03-01',
            'notes' => 'Awaiting final license approval'
        ]);

        ExpansionPlan::create([
            'city_name' => 'Dakar',
            'country' => 'Senegal',
            'stage' => 'launch_prep',
            'progress' => 90,
            'target_launch_date' => '2026-02-01',
            'notes' => 'Final preparations for launch'
        ]);

        $this->command->info('Cities and Zones seeded successfully!');
    }
}
