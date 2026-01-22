<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommissionRule;
use App\Models\CommissionTier;
use App\Models\CommissionEarning;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommissionController extends Controller
{
    // ==================== DASHBOARD STATS ====================
    
    public function getDashboardStats(): JsonResponse
    {
        $totalEarned = CommissionEarning::sum('commission_earned');
        $avgCommission = CommissionRule::where('status', 'active')->avg('base_rate');
        
        // Get current month and previous month earnings for trend calculation
        $currentMonthStart = now()->startOfMonth();
        $previousMonthStart = now()->subMonth()->startOfMonth();
        $previousMonthEnd = now()->subMonth()->endOfMonth();
        
        // Current month earnings
        $currentMonthEarning = CommissionEarning::where('period_date', '>=', $currentMonthStart)->first();
        $previousMonthEarning = CommissionEarning::whereBetween('period_date', [$previousMonthStart, $previousMonthEnd])->first();
        
        // Calculate trends
        $totalEarnedTrend = 0;
        $avgCommissionTrend = 0;
        $driverCommissionTrend = 0;
        $vendorCommissionTrend = 0;
        $courierCommissionTrend = 0;
        
        if ($previousMonthEarning && $previousMonthEarning->commission_earned > 0) {
            $currentCommission = $currentMonthEarning ? $currentMonthEarning->commission_earned : 0;
            $totalEarnedTrend = round((($currentCommission - $previousMonthEarning->commission_earned) / $previousMonthEarning->commission_earned) * 100, 1);
        }
        
        if ($previousMonthEarning && $previousMonthEarning->avg_rate > 0 && $currentMonthEarning) {
            $avgCommissionTrend = round((($currentMonthEarning->avg_rate - $previousMonthEarning->avg_rate) / $previousMonthEarning->avg_rate) * 100, 1);
        }
        
        if ($previousMonthEarning && $previousMonthEarning->rides_revenue > 0) {
            $currentRides = $currentMonthEarning ? $currentMonthEarning->rides_revenue : 0;
            $driverCommissionTrend = round((($currentRides - $previousMonthEarning->rides_revenue) / $previousMonthEarning->rides_revenue) * 100, 1);
        }
        
        if ($previousMonthEarning && $previousMonthEarning->delivery_revenue > 0) {
            $currentDelivery = $currentMonthEarning ? $currentMonthEarning->delivery_revenue : 0;
            $vendorCommissionTrend = round((($currentDelivery - $previousMonthEarning->delivery_revenue) / $previousMonthEarning->delivery_revenue) * 100, 1);
        }
        
        if ($previousMonthEarning && $previousMonthEarning->courier_revenue > 0) {
            $currentCourier = $currentMonthEarning ? $currentMonthEarning->courier_revenue : 0;
            $courierCommissionTrend = round((($currentCourier - $previousMonthEarning->courier_revenue) / $previousMonthEarning->courier_revenue) * 100, 1);
        }
        
        $driverCommission = CommissionEarning::sum('rides_revenue') * (($avgCommission ?? 15) / 100);
        $vendorCommission = CommissionEarning::sum('delivery_revenue') * (($avgCommission ?? 15) / 100);
        $courierCommission = CommissionEarning::sum('courier_revenue') * (($avgCommission ?? 15) / 100);

        // Revenue breakdown
        $ridesRevenue = CommissionEarning::sum('rides_revenue');
        $deliveryRevenue = CommissionEarning::sum('delivery_revenue');
        $courierRevenue = CommissionEarning::sum('courier_revenue');
        $totalRevenue = $ridesRevenue + $deliveryRevenue + $courierRevenue;
        
        // Calculate percentages for revenue breakdown
        $ridesPercent = $totalRevenue > 0 ? round(($ridesRevenue / $totalRevenue) * 100) : 0;
        $deliveryPercent = $totalRevenue > 0 ? round(($deliveryRevenue / $totalRevenue) * 100) : 0;
        $courierPercent = $totalRevenue > 0 ? round(($courierRevenue / $totalRevenue) * 100) : 0;

        // Service category stats from actual commission rules
        $rideRulesQuery = CommissionRule::where('type', 'ride')->where('status', 'active');
        $deliveryRulesQuery = CommissionRule::where('type', 'delivery')->where('status', 'active');
        $courierRulesQuery = CommissionRule::where('type', 'courier')->where('status', 'active');
        
        // Get rates from actual rules or use defaults
        $standardRideRate = $rideRulesQuery->clone()->where('name', 'LIKE', '%Standard%')->value('base_rate') 
            ?? $rideRulesQuery->clone()->where('name', 'LIKE', '%Economy%')->value('base_rate') 
            ?? $rideRulesQuery->clone()->first()?->base_rate 
            ?? 15;
        
        $premiumRideRate = $rideRulesQuery->clone()->where('name', 'LIKE', '%Premium%')->value('base_rate') 
            ?? $rideRulesQuery->clone()->where('name', 'LIKE', '%Luxury%')->value('base_rate')
            ?? 18;
        
        $foodDeliveryRate = $deliveryRulesQuery->avg('base_rate') ?? 25;
        $courierServicesRate = $courierRulesQuery->avg('base_rate') ?? 12;

        return response()->json([
            'total_earned' => $totalEarned,
            'total_earned_trend' => $totalEarnedTrend,
            'avg_commission' => round($avgCommission ?? 15, 1),
            'avg_commission_trend' => $avgCommissionTrend,
            'driver_commission' => $driverCommission,
            'driver_commission_trend' => $driverCommissionTrend,
            'vendor_commission' => $vendorCommission,
            'vendor_commission_trend' => $vendorCommissionTrend,
            'courier_commission' => $courierCommission,
            'courier_commission_trend' => $courierCommissionTrend,
            'revenue_breakdown' => [
                'rides' => $ridesRevenue,
                'rides_percent' => $ridesPercent,
                'delivery' => $deliveryRevenue,
                'delivery_percent' => $deliveryPercent,
                'courier' => $courierRevenue,
                'courier_percent' => $courierPercent,
                'total' => $totalRevenue,
            ],
            'service_stats' => [
                'standard_rides' => [
                    'rate' => round($standardRideRate, 1),
                    'volume' => $ridesRevenue * 0.6,
                    'earned' => $ridesRevenue * 0.6 * ($standardRideRate / 100),
                ],
                'premium_rides' => [
                    'rate' => round($premiumRideRate, 1),
                    'volume' => $ridesRevenue * 0.4,
                    'earned' => $ridesRevenue * 0.4 * ($premiumRideRate / 100),
                ],
                'food_delivery' => [
                    'rate' => round($foodDeliveryRate, 1),
                    'volume' => $deliveryRevenue,
                    'earned' => $deliveryRevenue * ($foodDeliveryRate / 100),
                ],
                'courier_services' => [
                    'rate' => round($courierServicesRate, 1),
                    'volume' => $courierRevenue,
                    'earned' => $courierRevenue * ($courierServicesRate / 100),
                ],
            ]
        ]);
    }

    public function calculateProjections(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'growth_rate' => 'required|numeric|min:-100|max:500',
            'months' => 'required|integer|min:1|max:24',
            'rate_adjustment' => 'nullable|numeric|min:-50|max:50',
        ]);

        $growthRate = $validated['growth_rate'] / 100;
        $months = $validated['months'];
        $rateAdjustment = ($validated['rate_adjustment'] ?? 0) / 100;

        // Get current stats
        $currentMonthlyEarned = CommissionEarning::orderBy('period_date', 'desc')->first();
        $currentRevenue = $currentMonthlyEarned ? 
            (float)$currentMonthlyEarned->total_revenue : 100000; // Default if no data
        $currentCommission = $currentMonthlyEarned ? 
            (float)$currentMonthlyEarned->commission_earned : 15000;
        $currentRate = CommissionRule::where('status', 'active')->avg('base_rate') ?? 15;
        $newRate = $currentRate * (1 + $rateAdjustment);

        // Calculate projections
        $projections = [];
        $totalProjectedRevenue = 0;
        $totalProjectedCommission = 0;

        for ($i = 1; $i <= $months; $i++) {
            $projectedRevenue = $currentRevenue * pow(1 + ($growthRate / 12), $i);
            $projectedCommission = $projectedRevenue * ($newRate / 100);
            
            $projections[] = [
                'month' => $i,
                'projected_revenue' => round($projectedRevenue, 2),
                'projected_commission' => round($projectedCommission, 2),
            ];
            
            $totalProjectedRevenue += $projectedRevenue;
            $totalProjectedCommission += $projectedCommission;
        }

        // Calculate comparison with current data
        $currentTotalRevenue = $currentRevenue * $months;
        $currentTotalCommission = $currentCommission * $months;
        $revenueGrowth = $currentTotalRevenue > 0 ? 
            (($totalProjectedRevenue - $currentTotalRevenue) / $currentTotalRevenue) * 100 : 0;
        $commissionGrowth = $currentTotalCommission > 0 ? 
            (($totalProjectedCommission - $currentTotalCommission) / $currentTotalCommission) * 100 : 0;

        return response()->json([
            'current' => [
                'monthly_revenue' => $currentRevenue,
                'monthly_commission' => $currentCommission,
                'base_rate' => round($currentRate, 1),
            ],
            'projected' => [
                'total_revenue' => round($totalProjectedRevenue, 2),
                'total_commission' => round($totalProjectedCommission, 2),
                'new_rate' => round($newRate, 1),
            ],
            'growth' => [
                'revenue_growth_percent' => round($revenueGrowth, 1),
                'commission_growth_percent' => round($commissionGrowth, 1),
            ],
            'monthly_breakdown' => $projections,
        ]);
    }

    // ==================== COMMISSION RULES ====================

    public function getRules(Request $request): JsonResponse
    {
        $type = $request->query('type'); // ride, delivery, courier, vendor
        
        $query = CommissionRule::with('city');
        
        if ($type) {
            $query->where('type', $type);
        }

        $rules = $query->orderBy('created_at', 'desc')->get();

        return response()->json($rules);
    }

    public function storeRule(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:ride,delivery,courier,vendor',
            'name' => 'required|string|max:255',
            'base_rate' => 'required|numeric|min:0|max:100',
            'min_commission' => 'nullable|numeric|min:0',
            'max_commission' => 'nullable|numeric|min:0',
            'surge_multiplier' => 'nullable|string|max:50',
            'attributes' => 'nullable|array',
            'city_id' => 'nullable|exists:cities,id',
            'status' => 'required|in:active,inactive'
        ]);

        $rule = CommissionRule::create($validated);

        return response()->json($rule->load('city'), 201);
    }

    public function showRule(int $id): JsonResponse
    {
        $rule = CommissionRule::with('city')->findOrFail($id);
        return response()->json($rule);
    }

    public function updateRule(Request $request, int $id): JsonResponse
    {
        $rule = CommissionRule::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:ride,delivery,courier,vendor',
            'name' => 'sometimes|string|max:255',
            'base_rate' => 'sometimes|numeric|min:0|max:100',
            'min_commission' => 'nullable|numeric|min:0',
            'max_commission' => 'nullable|numeric|min:0',
            'surge_multiplier' => 'nullable|string|max:50',
            'attributes' => 'nullable|array',
            'city_id' => 'nullable|exists:cities,id',
            'status' => 'sometimes|in:active,inactive'
        ]);

        $rule->update($validated);

        return response()->json($rule->load('city'));
    }

    public function deleteRule(int $id): JsonResponse
    {
        $rule = CommissionRule::findOrFail($id);
        $rule->delete();

        return response()->json(['message' => 'Commission rule deleted successfully']);
    }

    public function updateRuleStatus(Request $request, int $id): JsonResponse
    {
        $rule = CommissionRule::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $rule->update(['status' => $validated['status']]);

        return response()->json($rule->load('city'));
    }

    // ==================== COMMISSION TIERS ====================

    public function getTiers(Request $request): JsonResponse
    {
        $type = $request->query('type'); // driver, vendor
        
        $query = CommissionTier::query();
        
        if ($type) {
            $query->where('type', $type);
        }

        $tiers = $query->orderBy('min_threshold', 'asc')->get();

        return response()->json($tiers);
    }

    public function storeTier(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:driver,vendor',
            'name' => 'required|string|max:255',
            'min_threshold' => 'required|integer|min:0',
            'max_threshold' => 'nullable|integer|min:0',
            'rate' => 'required|numeric',
            'description' => 'nullable|string|max:255'
        ]);

        $tier = CommissionTier::create($validated);

        return response()->json($tier, 201);
    }

    public function showTier(int $id): JsonResponse
    {
        $tier = CommissionTier::findOrFail($id);
        return response()->json($tier);
    }

    public function updateTier(Request $request, int $id): JsonResponse
    {
        $tier = CommissionTier::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|in:driver,vendor',
            'name' => 'sometimes|string|max:255',
            'min_threshold' => 'sometimes|integer|min:0',
            'max_threshold' => 'nullable|integer|min:0',
            'rate' => 'sometimes|numeric',
            'description' => 'nullable|string|max:255'
        ]);

        $tier->update($validated);

        return response()->json($tier);
    }

    public function deleteTier(int $id): JsonResponse
    {
        $tier = CommissionTier::findOrFail($id);
        $tier->delete();

        return response()->json(['message' => 'Commission tier deleted successfully']);
    }

    // ==================== EARNINGS HISTORY ====================

    public function getEarnings(Request $request): JsonResponse
    {
        $earnings = CommissionEarning::orderBy('period_date', 'desc')
            ->limit(12)
            ->get();

        return response()->json($earnings);
    }

    public function storeEarning(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => 'required|string|max:50',
            'period_date' => 'required|date',
            'rides_revenue' => 'required|numeric|min:0',
            'delivery_revenue' => 'required|numeric|min:0',
            'courier_revenue' => 'required|numeric|min:0',
            'total_revenue' => 'required|numeric|min:0',
            'commission_earned' => 'required|numeric|min:0',
            'avg_rate' => 'required|numeric|min:0|max:100',
            'growth_percentage' => 'required|numeric'
        ]);

        $earning = CommissionEarning::create($validated);

        return response()->json($earning, 201);
    }

    public function deleteEarning(int $id): JsonResponse
    {
        $earning = CommissionEarning::findOrFail($id);
        $earning->delete();

        return response()->json(['message' => 'Earning record deleted successfully']);
    }
}
