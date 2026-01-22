<?php

namespace Database\Seeders;

use App\Models\CommissionEarning;
use App\Models\CommissionRule;
use App\Models\CommissionTier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Commission Rules

        // Rides
        $rideRules = [
            [
                'type' => 'ride',
                'name' => 'Economy',
                'base_rate' => 15.00,
                'min_commission' => 0.50,
                'max_commission' => 50.00,
                'surge_multiplier' => 'Same Rate',
                'status' => 'active'
            ],
            [
                'type' => 'ride',
                'name' => 'Comfort',
                'base_rate' => 18.00,
                'min_commission' => 1.00,
                'max_commission' => 75.00,
                'surge_multiplier' => '1.5x Rate',
                'status' => 'active'
            ],
            [
                'type' => 'ride',
                'name' => 'Premium',
                'base_rate' => 20.00,
                'min_commission' => 2.00,
                'max_commission' => 100.00,
                'surge_multiplier' => '1.5x Rate',
                'status' => 'active'
            ],
            [
                'type' => 'ride',
                'name' => 'SUV',
                'base_rate' => 18.00,
                'min_commission' => 1.50,
                'max_commission' => 80.00,
                'surge_multiplier' => 'Same Rate',
                'status' => 'active'
            ],
            [
                'type' => 'ride',
                'name' => 'Shared',
                'base_rate' => 12.00,
                'min_commission' => 0.30,
                'max_commission' => 30.00,
                'surge_multiplier' => 'N/A',
                'status' => 'inactive'
            ],
        ];

        foreach ($rideRules as $rule) {
            CommissionRule::create($rule);
        }

        // Vendor Rules
        $vendorRules = [
            [
                'type' => 'vendor',
                'name' => 'Restaurants',
                'base_rate' => 25.00,
                'attributes' => [
                    'featured_rate' => 30,
                    'new_vendor_rate' => 15,
                    'promo_period' => '30 days',
                    'vendors_count' => 456,
                    'monthly_revenue' => 125000
                ],
                'status' => 'active'
            ],
            [
                'type' => 'vendor',
                'name' => 'Fast Food',
                'base_rate' => 22.00,
                'attributes' => [
                    'featured_rate' => 28,
                    'new_vendor_rate' => 12,
                    'promo_period' => '45 days',
                    'vendors_count' => 234,
                    'monthly_revenue' => 89000
                ],
                'status' => 'active'
            ],
            [
                'type' => 'vendor',
                'name' => 'Grocery',
                'base_rate' => 18.00,
                'attributes' => [
                    'featured_rate' => 22,
                    'new_vendor_rate' => 10,
                    'promo_period' => '60 days',
                    'vendors_count' => 123,
                    'monthly_revenue' => 45000
                ],
                'status' => 'active'
            ],
            [
                'type' => 'vendor',
                'name' => 'Pharmacy',
                'base_rate' => 15.00,
                'attributes' => [
                    'featured_rate' => 18,
                    'new_vendor_rate' => 8,
                    'promo_period' => '30 days',
                    'vendors_count' => 67,
                    'monthly_revenue' => 23000
                ],
                'status' => 'active'
            ],
            [
                'type' => 'vendor',
                'name' => 'Shops',
                'base_rate' => 20.00,
                'attributes' => [
                    'featured_rate' => 25,
                    'new_vendor_rate' => 12,
                    'promo_period' => '30 days',
                    'vendors_count' => 189,
                    'monthly_revenue' => 56000
                ],
                'status' => 'active'
            ],
        ];

        foreach ($vendorRules as $rule) {
            CommissionRule::create($rule);
        }

        // Delivery & Courier Rules (Sample)
        CommissionRule::create([
            'type' => 'delivery',
            'name' => 'Standard Delivery',
            'base_rate' => 20.00,
            'min_commission' => 2.00,
            'max_commission' => 20.00,
            'surge_multiplier' => '1.2x',
            'status' => 'active'
        ]);

        CommissionRule::create([
            'type' => 'courier',
            'name' => 'Express Courier',
            'base_rate' => 15.00,
            'min_commission' => 3.00,
            'max_commission' => 30.00,
            'surge_multiplier' => '1.5x',
            'status' => 'active'
        ]);


        // 2. Commission Tiers

        // Driver Tiers
        $driverTiers = [
            [
                'type' => 'driver',
                'name' => 'Bronze',
                'min_threshold' => 0,
                'max_threshold' => 100,
                'rate' => 15.00,
                'description' => '0-100 trips/month'
            ],
            [
                'type' => 'driver',
                'name' => 'Silver',
                'min_threshold' => 101,
                'max_threshold' => 500,
                'rate' => 13.00,
                'description' => '101-500 trips/month'
            ],
            [
                'type' => 'driver',
                'name' => 'Gold',
                'min_threshold' => 501,
                'max_threshold' => 1000,
                'rate' => 11.00,
                'description' => '501-1000 trips/month'
            ],
            [
                'type' => 'driver',
                'name' => 'Platinum',
                'min_threshold' => 1001,
                'max_threshold' => null, // 1000+
                'rate' => 9.00,
                'description' => '1000+ trips/month'
            ],
        ];

        foreach ($driverTiers as $tier) {
            CommissionTier::create($tier);
        }

        // Vendor Loyalty Tiers (Negative rate means discount)
        $vendorTiers = [
            [
                'type' => 'vendor',
                'name' => 'Starter',
                'min_threshold' => 0,
                'max_threshold' => 500,
                'rate' => 0.00,
                'description' => '0-500 orders/month'
            ],
            [
                'type' => 'vendor',
                'name' => 'Growing',
                'min_threshold' => 501,
                'max_threshold' => 2000,
                'rate' => -2.00,
                'description' => '501-2000 orders/month'
            ],
            [
                'type' => 'vendor',
                'name' => 'Established',
                'min_threshold' => 2001,
                'max_threshold' => 5000,
                'rate' => -5.00,
                'description' => '2001-5000 orders/month'
            ],
            [
                'type' => 'vendor',
                'name' => 'Enterprise',
                'min_threshold' => 5001,
                'max_threshold' => null,
                'rate' => -8.00,
                'description' => '5000+ orders/month'
            ],
        ];

        foreach ($vendorTiers as $tier) {
            CommissionTier::create($tier);
        }


        // 3. Earnings History
        $earnings = [
            [
                'period' => 'Nov 2024',
                'period_date' => '2024-11-01',
                'rides_revenue' => 1200000,
                'delivery_revenue' => 890000,
                'courier_revenue' => 450000,
                'total_revenue' => 2540000,
                'commission_earned' => 456000,
                'avg_rate' => 17.9,
                'growth_percentage' => 12.0
            ],
            [
                'period' => 'Oct 2024',
                'period_date' => '2024-10-01',
                'rides_revenue' => 1100000,
                'delivery_revenue' => 780000,
                'courier_revenue' => 410000,
                'total_revenue' => 2290000,
                'commission_earned' => 412000,
                'avg_rate' => 18.0,
                'growth_percentage' => 8.0
            ],
            [
                'period' => 'Sep 2024',
                'period_date' => '2024-09-01',
                'rides_revenue' => 980000,
                'delivery_revenue' => 720000,
                'courier_revenue' => 380000,
                'total_revenue' => 2080000,
                'commission_earned' => 374000,
                'avg_rate' => 18.0,
                'growth_percentage' => 15.0
            ],
            [
                'period' => 'Aug 2024',
                'period_date' => '2024-08-01',
                'rides_revenue' => 890000,
                'delivery_revenue' => 650000,
                'courier_revenue' => 340000,
                'total_revenue' => 1880000,
                'commission_earned' => 338000,
                'avg_rate' => 18.0,
                'growth_percentage' => 6.0
            ],
            [
                'period' => 'Jul 2024',
                'period_date' => '2024-07-01',
                'rides_revenue' => 820000,
                'delivery_revenue' => 610000,
                'courier_revenue' => 320000,
                'total_revenue' => 1750000,
                'commission_earned' => 315000,
                'avg_rate' => 18.0,
                'growth_percentage' => -10.0
            ],
        ];

        foreach ($earnings as $earning) {
            CommissionEarning::create($earning);
        }
    }
}
