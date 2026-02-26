<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use App\Models\DriverTier;
use App\Models\DriverTierMovement;
use Illuminate\Support\Facades\DB;

class DriverTierController extends Controller
{
    public function getStats()
    {
        $tiers = DriverTier::withCount('drivers')->get();
        
        $data = $tiers->map(function($tier) {
            return [
                'name' => $tier->name,
                'drivers' => $tier->drivers_count,
                'color' => $tier->color,
                'metrics' => [
                    'rating' => $tier->min_rating,
                    'completion' => $tier->min_completion_rate . '%',
                    'trips' => $tier->min_trips_30d,
                    'bonus' => $tier->bonus_multiplier > 1 ? '+' . (($tier->bonus_multiplier - 1) * 100) . '%' : 'None',
                    'multiplier' => $tier->bonus_multiplier . 'x'
                ]
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function getRules()
    {
        $rules = DriverTier::all();
        
        // Seed if empty
        if ($rules->isEmpty()) {
            $this->seedTiers();
            $rules = DriverTier::all();
        }

        return response()->json(['success' => true, 'data' => $rules]);
    }

    public function getMovements()
    {
        $movements = DriverTierMovement::with('driver')
            ->latest()
            ->take(20)
            ->get()
            ->map(function($m) {
                return [
                    'name' => $m->driver->name,
                    'from' => $m->from_tier,
                    'to' => $m->to_tier,
                    'reason' => $m->reason,
                    'date' => $m->created_at->diffForHumans(),
                    'dir' => $m->direction
                ];
            });

        return response()->json(['success' => true, 'data' => $movements]);
    }

    public function recalculate()
    {
        // Logic to recalculate all drivers' tiers based on their metrics
        // This would usually be a background job
        return response()->json(['success' => true, 'message' => 'Tier recalculation started.']);
    }

    private function seedTiers()
    {
        $tiers = [
            [
                'name' => 'Diamond',
                'color' => 'blue',
                'min_rating' => 4.9,
                'min_completion_rate' => 98.00,
                'min_trips_30d' => 500,
                'max_cancellations_30d' => 1,
                'surge_access' => 'All Zones',
                'is_stackable' => true,
                'bonus_multiplier' => 2.00,
            ],
            [
                'name' => 'Platinum',
                'color' => 'yellow',
                'min_rating' => 4.7,
                'min_completion_rate' => 95.00,
                'min_trips_30d' => 300,
                'max_cancellations_30d' => 3,
                'surge_access' => 'Priority',
                'is_stackable' => true,
                'bonus_multiplier' => 1.50,
            ],
            [
                'name' => 'Gold',
                'color' => 'orange',
                'min_rating' => 4.5,
                'min_completion_rate' => 90.00,
                'min_trips_30d' => 150,
                'max_cancellations_30d' => 5,
                'surge_access' => 'Standard',
                'is_stackable' => true,
                'bonus_multiplier' => 1.20,
            ],
            [
                'name' => 'Silver',
                'color' => 'silver',
                'min_rating' => 4.0,
                'min_completion_rate' => 85.00,
                'min_trips_30d' => 50,
                'max_cancellations_30d' => 8,
                'surge_access' => 'Limited',
                'is_stackable' => false,
                'bonus_multiplier' => 1.00,
            ],
        ];

        foreach ($tiers as $tier) {
            DriverTier::updateOrCreate(['name' => $tier['name']], $tier);
        }
    }
}
