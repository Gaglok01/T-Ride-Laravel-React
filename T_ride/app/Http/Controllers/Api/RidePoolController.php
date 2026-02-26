<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RidePool;
use App\Models\PoolingSetting;
use App\Models\Driver;

class RidePoolController extends Controller
{
    public function getDashboardData()
    {
        $settings = PoolingSetting::first();
        
        // Seed if empty
        if (!$settings) {
            $settings = PoolingSetting::create([
                'min_route_overlap' => 60,
                'max_detour_distance' => 3,
                'max_detour_time' => 10,
                // ... other defaults already in migration but for safety 
                'is_pooling_enabled' => true,
            ]);
        }

        $pools = RidePool::with('driver')->get()->map(function($pool) {
            return [
                'id' => $pool->pool_custom_id,
                'db_id' => $pool->id,
                'riders' => $pool->riders,
                'driver' => $pool->driver->name,
                'overlap' => $pool->route_overlap . '%',
                'detour' => $pool->detour_distance . ' km',
                'savings' => '$' . number_format($pool->savings_per_rider, 2) . ' ea',
                'eta' => $pool->eta_minutes . ' min',
                'status' => $pool->status,
                'capacity' => count($pool->riders) . '/' . $pool->total_seats,
                'strategy' => $pool->allocation_strategy,
                'is_smart' => $pool->capacity_confirmed
            ];
        });

        // Demo stats
        $stats = [
            'active_pools' => RidePool::where('status', '!=', 'Completed')->count(),
            'match_rate' => 72,
            'rider_savings' => 1240,
            'avg_overlap' => 74,
            'avg_detour' => 1.4,
            'wait_match' => 3.2,
        ];

        // Seed pools if empty for demo
        if ($pools->isEmpty()) {
            $this->seedDemoPools();
            return $this->getDashboardData();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'pools' => $pools,
                'settings' => $settings
            ]
        ]);
    }

    public function show($id)
    {
        $pool = RidePool::with('driver')->where('id', $id)->orWhere('pool_custom_id', $id)->firstOrFail();
        
        return response()->json([
            'success' => true,
            'data' => $pool
        ]);
    }

    public function updateSettings(Request $request)
    {
        $settings = PoolingSetting::first();
        if (!$settings) {
            $settings = new PoolingSetting();
        }
        
        $settings->fill($request->all());
        $settings->save();

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
            'data' => $settings
        ]);
    }

    private function seedDemoPools()
    {
        $driver = Driver::first();
        if (!$driver) return;

        $demoPools = [
            [
                'pool_custom_id' => 'POOL-001',
                'driver_id' => $driver->id,
                'riders' => ['John D.', 'Jane S.'],
                'route_overlap' => 78,
                'detour_distance' => 1.2,
                'savings_per_rider' => 4.50,
                'eta_minutes' => 12,
                'status' => 'In Trip',
                'total_seats' => 4,
                'allocation_strategy' => 'Optimal Overlap',
                'capacity_confirmed' => true
            ],
            [
                'pool_custom_id' => 'POOL-002',
                'driver_id' => $driver->id,
                'riders' => ['Sarah W.', 'Tom B.', 'Lisa D.'],
                'route_overlap' => 65,
                'detour_distance' => 2.1,
                'savings_per_rider' => 6.00,
                'eta_minutes' => 18,
                'status' => 'Picking Up #2',
                'total_seats' => 4,
                'allocation_strategy' => 'Priority Match',
                'capacity_confirmed' => true
            ],
            [
                'pool_custom_id' => 'POOL-003',
                'driver_id' => $driver->id,
                'riders' => ['Chris L.'],
                'route_overlap' => 0,
                'detour_distance' => 0,
                'savings_per_rider' => 0,
                'eta_minutes' => 0,
                'status' => 'Waiting Match',
                'total_seats' => 4,
                'allocation_strategy' => 'Scanning Engine',
                'capacity_confirmed' => true
            ],
            [
                'pool_custom_id' => 'POOL-004',
                'driver_id' => $driver->id,
                'riders' => ['Amy C.', 'Mike J.'],
                'route_overlap' => 82,
                'detour_distance' => 0.8,
                'savings_per_rider' => 5.20,
                'eta_minutes' => 8,
                'status' => 'In Trip',
                'total_seats' => 4,
                'allocation_strategy' => 'Max Efficiency',
                'capacity_confirmed' => true
            ]
        ];

        foreach ($demoPools as $p) {
            RidePool::create($p);
        }
    }
}
