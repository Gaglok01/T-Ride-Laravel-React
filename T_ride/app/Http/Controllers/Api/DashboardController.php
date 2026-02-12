<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ride;
use App\Models\Driver;
use App\Models\DeliveryOrder;
use App\Models\ManualBooking;
use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getStats()
    {
        // 1. Total Revenue
        $dbRideRevenue = Ride::sum('fare');
        $dbDeliveryRevenue = DeliveryOrder::sum('total_amount');
        $dbCourierRevenue = Order::where('status', 'delivered')->sum('fee');
        $dbTotal = $dbRideRevenue + $dbDeliveryRevenue + $dbCourierRevenue;

        $totalRevenue = $dbTotal; 

        // 2. Active Drivers
        $activeDrivers = Driver::where('status', 'active')->count();

        // 3. Active Trips (Ongoing rides, delivery orders, and courier orders)
        $activeRides = Ride::where('status', 'in_progress')->count();
        $activeDeliveries = DeliveryOrder::whereIn('status', ['preparing', 'on_the_way'])->count();
        $activeCouriers = Order::whereIn('status', ['picked_up', 'in_transit'])->count();
        $activeTrips = $activeRides + $activeDeliveries + $activeCouriers;

        // 4. Pending Issues
        $pendingBookings = ManualBooking::where('status', 'pending')->count();

        // Earning chart data (last 7 days)
        $earningsChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyRideRevenue = Ride::whereDate('created_at', $date)->sum('fare');
            $dailyDeliveryRevenue = DeliveryOrder::whereDate('created_at', $date)->sum('total_amount');
            $dailyCourierRevenue = Order::where('status', 'delivered')
                ->whereDate('created_at', $date)
                ->sum('fee');
            
            $earningsChart[] = [
                'name' => $date->format('D'),
                'earnings' => (float)($dailyRideRevenue + $dailyDeliveryRevenue + $dailyCourierRevenue),
            ];
        }

        // Earnings Summary
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
        $thisWeekCourier = Order::where('status', 'delivered')->where('created_at', '>=', $thisWeekStart)->sum('fee');
        $thisWeekTotal = $thisWeekRide + $thisWeekDelivery + $thisWeekCourier;

        // Calculate Last Week
        $lastWeekRide = Ride::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->sum('fare');
        $lastWeekDelivery = DeliveryOrder::whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->sum('total_amount');
        $lastWeekCourier = Order::where('status', 'delivered')->whereBetween('created_at', [$lastWeekStart, $lastWeekEnd])->sum('fee');
        $lastWeekTotal = $lastWeekRide + $lastWeekDelivery + $lastWeekCourier;
        $weekChange = $lastWeekTotal > 0 ? round((($thisWeekTotal - $lastWeekTotal) / $lastWeekTotal) * 100, 1) : 0;

        // Calculate This Month
        $thisMonthRide = Ride::where('created_at', '>=', $thisMonthStart)->sum('fare');
        $thisMonthDelivery = DeliveryOrder::where('created_at', '>=', $thisMonthStart)->sum('total_amount');
        $thisMonthCourier = Order::where('status', 'delivered')->where('created_at', '>=', $thisMonthStart)->sum('fee');
        $thisMonthTotal = $thisMonthRide + $thisMonthDelivery + $thisMonthCourier;

        // Calculate Last Month
        $lastMonthRide = Ride::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('fare');
        $lastMonthDelivery = DeliveryOrder::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount');
        $lastMonthCourier = Order::where('status', 'delivered')->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('fee');
        $lastMonthTotal = $lastMonthRide + $lastMonthDelivery + $lastMonthCourier;
        $monthChange = $lastMonthTotal > 0 ? round((($thisMonthTotal - $lastMonthTotal) / $lastMonthTotal) * 100, 1) : 0;

        // Calculate This Quarter
        $thisQuarterRide = Ride::where('created_at', '>=', $thisQuarterStart)->sum('fare');
        $thisQuarterDelivery = DeliveryOrder::where('created_at', '>=', $thisQuarterStart)->sum('total_amount');
        $thisQuarterCourier = Order::where('status', 'delivered')->where('created_at', '>=', $thisQuarterStart)->sum('fee');
        $thisQuarterTotal = $thisQuarterRide + $thisQuarterDelivery + $thisQuarterCourier;

        // Calculate Last Quarter
        $lastQuarterRide = Ride::whereBetween('created_at', [$lastQuarterStart, $lastQuarterEnd])->sum('fare');
        $lastQuarterDelivery = DeliveryOrder::whereBetween('created_at', [$lastQuarterStart, $lastQuarterEnd])->sum('total_amount');
        $lastQuarterCourier = Order::where('status', 'delivered')->whereBetween('created_at', [$lastQuarterStart, $lastQuarterEnd])->sum('fee');
        $lastQuarterTotal = $lastQuarterRide + $lastQuarterDelivery + $lastQuarterCourier;
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
