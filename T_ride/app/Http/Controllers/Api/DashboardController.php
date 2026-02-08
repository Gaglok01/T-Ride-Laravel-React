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
        // 1. Total Revenue (Fixed Dummy Logic as requested)
        // Hardcode a base revenue to align with the "add $30000" request, 
        // but still use the DB ratios if possible, or just force the split.
        // We will calculate a multiplier to scale actual DB values to reach ~$30,000 if needed, 
        // OR just simulate it. 
        // Let's assume the user wants to SEE $30,000 as the total.

        $dbRideRevenue = Ride::sum('fare');
        $dbDeliveryRevenue = DeliveryOrder::sum('total_amount');
        $dbTotal = $dbRideRevenue + $dbDeliveryRevenue;

        // If DB has 0 (fresh seed might not have worked or empty), we set defaults.
        // But since we ran seeder, we should have values. 
        // Re-reading user request: "add the some dummy balance for example $30000... then you have to divide this..."
        // This implies we should SHOW $30,000 regardless of DB, OR seed enough to get $30,000.
        // I seeded enough to get ~$30,000. So I will rely on DB sums.
        
        $totalRevenue = $dbTotal; 
        $rideRevenue = $dbRideRevenue;
        $deliveryRevenue = $dbDeliveryRevenue;

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

        // Earnings Summary - Same as Referral Performance design
        $thisWeekStart = Carbon::now()->startOfWeek();
        $lastWeekStart = Carbon::now()->subWeek()->startOfWeek();
        $lastWeekEnd = Carbon::now()->subWeek()->endOfWeek();
        
        $thisMonthStart = Carbon::now()->startOfMonth();
        $lastMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();
        
        $thisQuarterStart = Carbon::now()->firstOfQuarter();
        $lastQuarterStart = Carbon::now()->subQuarter()->firstOfQuarter();
        $lastQuarterEnd = Carbon::now()->subQuarter()->lastOfQuarter();

        // Calculate This Week
        $thisWeekRide = Ride::where('created_at', '>=', $thisWeekStart)->sum('fare');
        $thisWeekDelivery = DeliveryOrder::where('created_at', '>=', $thisWeekStart)->sum('total_amount');
        $thisWeekTotal = $thisWeekRide + $thisWeekDelivery;

        // Calculate Last Week
        $lastWeekRide = Ride::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->sum('fare');
        $lastWeekDelivery = DeliveryOrder::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->sum('total_amount');
        $lastWeekTotal = $lastWeekRide + $lastWeekDelivery;
        $weekChange = $lastWeekTotal > 0 ? round((($thisWeekTotal - $lastWeekTotal) / $lastWeekTotal) * 100, 1) : 0;

        // Calculate This Month
        $thisMonthRide = Ride::where('created_at', '>=', $thisMonthStart)->sum('fare');
        $thisMonthDelivery = DeliveryOrder::where('created_at', '>=', $thisMonthStart)->sum('total_amount');
        $thisMonthTotal = $thisMonthRide + $thisMonthDelivery;

        // Calculate Last Month
        $lastMonthRide = Ride::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('fare');
        $lastMonthDelivery = DeliveryOrder::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount');
        $lastMonthTotal = $lastMonthRide + $lastMonthDelivery;
        $monthChange = $lastMonthTotal > 0 ? round((($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100, 1) : 0;

        // Calculate This Quarter
        $thisQuarterRide = Ride::where('created_at', '>=', $thisQuarterStart)->sum('fare');
        $thisQuarterDelivery = DeliveryOrder::where('created_at', '>=', $thisQuarterStart)->sum('total_amount');
        $thisQuarterTotal = $thisQuarterRide + $thisQuarterDelivery;

        // Calculate Last Quarter
        $lastQuarterRide = Ride::whereBetween('created_at', [$lastQuarterStart, $lastQuarterEnd])->sum('fare');
        $lastQuarterDelivery = DeliveryOrder::whereBetween('created_at', [$lastQuarterStart, $lastQuarterEnd])->sum('total_amount');
        $lastQuarterTotal = $lastQuarterRide + $lastQuarterDelivery;
        $quarterChange = $lastQuarterTotal > 0 ? round((($thisQuarterTotal - $lastQuarterTotal) / $lastQuarterTotal) * 100, 1) : 0;

        $earningsSummary = [
            'this_week' => (float) $thisWeekTotal,
            'week_change' => (float) $weekChange,
            'this_month' => (float) $thisMonthTotal,
            'month_change' => (float) $monthChange,
            'this_quarter' => (float) $thisQuarterTotal,
            'quarter_change' => (float) $quarterChange,
            'all_time' => (float) $totalRevenue,
        ];

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
                'earningsSummary' => $earningsSummary,
                'liveActivity' => $liveActivity
            ]
        ]);
    }
}
