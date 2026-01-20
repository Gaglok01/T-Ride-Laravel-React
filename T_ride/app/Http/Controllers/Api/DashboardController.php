<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\Driver;
use App\Models\DeliveryOrder;
use App\Models\ManualBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        // 1. Total Revenue
        $rideRevenue = Ride::sum('fare');
        $deliveryRevenue = DeliveryOrder::sum('total_amount');
        $totalRevenue = $rideRevenue + $deliveryRevenue;

        // 2. Active Drivers
        $activeDrivers = Driver::where('status', 'active')->count();

        // 3. Active Trips (Ongoing rides and delivery orders)
        $activeRides = Ride::where('status', 'in_progress')->count();
        $activeDeliveries = DeliveryOrder::whereIn('status', ['preparing', 'on_the_way'])->count();
        $activeTrips = $activeRides + $activeDeliveries;

        // 4. Pending Issues (Using manual bookings that are pending as a proxy for 'issues' or just use 0)
        $pendingBookings = ManualBooking::where('status', 'pending')->count();

        // Earning chart data (last 7 days)
        $earningsChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyRideRevenue = Ride::whereDate('created_at', $date)->sum('fare');
            $dailyDeliveryRevenue = DeliveryOrder::whereDate('created_at', $date)->sum('total_amount');
            
            $earningsChart[] = [
                'name' => $date->format('D'),
                'earnings' => (float)($dailyRideRevenue + $dailyDeliveryRevenue),
            ];
        }

        // Live activity (last 8 recent activities)
        $recentRides = Ride::with(['rider', 'driver'])
            ->latest()
            ->take(4)
            ->get()
            ->map(function($ride) {
                return [
                    'id' => 'ride-' . $ride->id,
                    'user' => $ride->rider->name ?? 'Unknown',
                    'driver' => $ride->driver->name ?? 'Searching...',
                    'type' => 'Ride',
                    'status' => $ride->status,
                    'time' => $ride->created_at->diffForHumans(),
                ];
            });

        $recentDeliveries = DeliveryOrder::with(['customer', 'driver'])
            ->latest()
            ->take(4)
            ->get()
            ->map(function($order) {
                return [
                    'id' => 'delivery-' . $order->id,
                    'user' => $order->customer->name ?? 'Unknown',
                    'driver' => $order->driver->name ?? 'Pending',
                    'type' => 'Delivery',
                    'status' => $order->status,
                    'time' => $order->created_at->diffForHumans(),
                ];
            });

        $liveActivity = $recentRides->concat($recentDeliveries)->sortByDesc('time')->values()->take(8);

        return response()->json([
            'status' => true,
            'data' => [
                'stats' => [
                    ['title' => 'Total Revenue', 'value' => '$' . number_format($totalRevenue, 2), 'trend' => '+12%', 'icon' => 'dollar'],
                    ['title' => 'Active Drivers', 'value' => (string)$activeDrivers, 'trend' => '+5%', 'icon' => 'car'],
                    ['title' => 'Active Trips', 'value' => (string)$activeTrips, 'trend' => 'Now', 'icon' => 'trip'],
                    ['title' => 'Pending Work', 'value' => (string)$pendingBookings, 'trend' => '-2', 'icon' => 'issue'],
                ],
                'earningsChart' => $earningsChart,
                'liveActivity' => $liveActivity
            ]
        ]);
    }
}
