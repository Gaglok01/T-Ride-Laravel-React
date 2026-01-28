<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ReferralCampaign;
use App\Models\ReferralRule;
use App\Models\ReferrerTier;
use App\Models\UserReferral;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReferralController extends Controller
{
    // Dashboard Stats
    public function getStats()
    {
        $totalReferrals = UserReferral::count();
        $successfulSignups = UserReferral::where('status', 'completed')->count();
        $rewardsPaid = UserReferral::where('status', 'completed')->sum('reward_amount');
        
        // Calculate conversion rate
        $conversionRate = $totalReferrals > 0 ? ($successfulSignups / $totalReferrals) * 100 : 0;
        
        $activeReferrers = UserReferral::distinct('referrer_id')->count('referrer_id');
        $avgReward = $successfulSignups > 0 ? $rewardsPaid / $successfulSignups : 0;

        return response()->json([
            'total_referrals' => $totalReferrals,
            'successful_signups' => $successfulSignups,
            'conversion_rate' => round($conversionRate, 1),
            'rewards_paid' => $rewardsPaid,
            'avg_reward' => round($avgReward, 2),
            'active_referrers' => $activeReferrers,
            // Trends (dummy data for now or calculate from dates)
            'trends' => [
                'referrals' => '+18.5%',
                'signups' => '+22.3%',
                'conversion' => '+3.2%',
                'rewards' => '+15.8%',
                'avg_reward' => '+0.25',
                'referrers' => '+8.9%'
            ]
        ]);
    }

    // Campaigns
    public function getCampaigns()
    {
        return response()->json(ReferralCampaign::latest()->get());
    }

    public function storeCampaign(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'status' => 'required|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget' => 'required|numeric',
            'spent' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $campaign = ReferralCampaign::create($validated);
        return response()->json($campaign, 201);
    }

    public function updateCampaign(Request $request, $id)
    {
        $campaign = ReferralCampaign::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|string',
            'status' => 'sometimes|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'budget' => 'sometimes|numeric',
            'spent' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $campaign->update($validated);
        return response()->json($campaign);
    }

    public function deleteCampaign($id)
    {
        ReferralCampaign::findOrFail($id)->delete();
        return response()->json(['message' => 'Campaign deleted successfully']);
    }

    // Rules
    public function getRules()
    {
        return response()->json(ReferralRule::all()->groupBy('type'));
    }

    public function storeRule(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:referrer,referee',
            'trigger_event' => 'required|string',
            'reward_type' => 'required|string',
            'reward_amount' => 'required|numeric',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $rule = ReferralRule::create($validated);
        return response()->json($rule, 201);
    }

    public function updateRule(Request $request, $id)
    {
        $rule = ReferralRule::findOrFail($id);
        $rule->update($request->all());
        return response()->json($rule);
    }

    public function toggleRuleStatus($id)
    {
        $rule = ReferralRule::findOrFail($id);
        $rule->is_active = !$rule->is_active;
        $rule->save();
        return response()->json($rule);
    }

    // Tiers
    public function getTiers()
    {
        return response()->json(ReferrerTier::orderBy('min_referrals')->get());
    }

    public function storeTier(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'min_referrals' => 'required|integer',
            'max_referrals' => 'nullable|integer',
            'bonus_multiplier' => 'required|numeric',
            'benefits' => 'nullable|array',
            'color' => 'nullable|string',
        ]);

        $tier = ReferrerTier::create($validated);
        return response()->json($tier, 201);
    }

    public function updateTier(Request $request, $id)
    {
        $tier = ReferrerTier::findOrFail($id);
        $tier->update($request->all());
        return response()->json($tier);
    }

    public function deleteTier($id)
    {
        ReferrerTier::findOrFail($id)->delete();
        return response()->json(['message' => 'Tier deleted successfully']);
    }

    // Analytics / Leaderboard
    public function getTopReferrers()
    {
        // This is a simplified query. In a real app, you'd aggregate UserReferrals
        $topReferrers = User::select('users.id', 'users.name', 'users.email')
            ->join('user_referrals', 'users.id', '=', 'user_referrals.referrer_id')
            ->selectRaw('count(user_referrals.id) as total_referrals')
            ->selectRaw('count(case when user_referrals.status = "completed" then 1 end) as successful_referrals')
            ->selectRaw('sum(user_referrals.reward_amount) as total_earnings')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderByDesc('total_referrals')
            ->limit(10)
            ->get();

        // Attach Tier info (simplified logic)
        $tiers = ReferrerTier::orderBy('min_referrals')->get();
        
        $topReferrers->transform(function ($user) use ($tiers) {
            $user->tier = 'Bronze'; // Default
            foreach ($tiers as $tier) {
                if ($user->total_referrals >= $tier->min_referrals && ($tier->max_referrals === null || $user->total_referrals <= $tier->max_referrals)) {
                    $user->tier = $tier->name;
                    $user->tier_color = $tier->color;
                    break;
                }
            }
            // Calculate conversion rate
            $user->conversion_rate = $user->total_referrals > 0 ? round(($user->successful_referrals / $user->total_referrals) * 100, 1) : 0;
            return $user;
        });

        return response()->json($topReferrers);
    }

    public function getRecentReferrals()
    {
        $referrals = UserReferral::with(['referrer:id,name', 'referee:id,name'])
            ->latest()
            ->limit(10)
            ->get();
            
        return response()->json($referrals);
    }

    // Delete Rule
    public function deleteRule($id)
    {
        ReferralRule::findOrFail($id)->delete();
        return response()->json(['message' => 'Rule deleted successfully']);
    }

    // Referral Codes
    public function getReferralCodes(Request $request)
    {
        $query = UserReferral::with(['referrer:id,name,email', 'referee:id,name,email', 'campaign:id,name'])
            ->select('user_referrals.*')
            ->selectRaw('(SELECT COUNT(*) FROM user_referrals ur2 WHERE ur2.referral_code = user_referrals.referral_code) as usage_count');

        // Search filter
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('referral_code', 'like', "%{$search}%")
                    ->orWhereHas('referrer', function($rq) use ($search) {
                        $rq->where('name', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $referralCodes = $query->latest()->paginate(15);
        
        return response()->json($referralCodes);
    }

    // Generate new referral code for a user
    public function generateReferralCode(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'campaign_id' => 'nullable|exists:referral_campaigns,id',
        ]);

        $code = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        
        $referral = UserReferral::create([
            'referrer_id' => $validated['user_id'],
            'campaign_id' => $validated['campaign_id'] ?? null,
            'referral_code' => $code,
            'status' => 'pending',
            'reward_amount' => 0,
        ]);

        return response()->json($referral->load(['referrer:id,name,email']), 201);
    }

    // Analytics
    public function getAnalytics()
    {
        // Referral sources - based on campaigns or default sources
        $referralsByCampaign = UserReferral::selectRaw('campaign_id, COUNT(*) as count')
            ->groupBy('campaign_id')
            ->with('campaign:id,name,type')
            ->get();

        $totalReferrals = UserReferral::count();
        
        // Group by source type
        $sources = [
            ['name' => 'Direct Link', 'count' => 0, 'percentage' => 0, 'color' => 'bg-blue-500'],
            ['name' => 'Social Media', 'count' => 0, 'percentage' => 0, 'color' => 'bg-violet-500'],
            ['name' => 'WhatsApp Share', 'count' => 0, 'percentage' => 0, 'color' => 'bg-orange-500'],
            ['name' => 'QR Code', 'count' => 0, 'percentage' => 0, 'color' => 'bg-yellow-500'],
        ];

        // Distribute referrals across sources (simplified - you'd track actual sources in production)
        $i = 0;
        foreach ($referralsByCampaign as $group) {
            $idx = $i % 4;
            $sources[$idx]['count'] += $group->count;
            $i++;
        }

        // If no data, add some distribution
        if ($totalReferrals == 0) {
            $totalReferrals = 1; // Prevent division by zero
        }

        foreach ($sources as &$source) {
            $source['percentage'] = round(($source['count'] / max($totalReferrals, 1)) * 100, 1);
        }

        // Referrals by user type
        $referralsByUserType = [
            [
                'label' => 'Riders',
                'referrals' => UserReferral::whereHas('referee', function($q) {
                    $q->where('user_type', 'rider');
                })->count(),
                'conversions' => UserReferral::where('status', 'completed')
                    ->whereHas('referee', function($q) {
                        $q->where('user_type', 'rider');
                    })->count(),
            ],
            [
                'label' => 'Drivers',
                'referrals' => UserReferral::whereHas('referee', function($q) {
                    $q->where('user_type', 'driver');
                })->count(),
                'conversions' => UserReferral::where('status', 'completed')
                    ->whereHas('referee', function($q) {
                        $q->where('user_type', 'driver');
                    })->count(),
            ],
            [
                'label' => 'Vendors',
                'referrals' => UserReferral::whereHas('referee', function($q) {
                    $q->where('user_type', 'vendor');
                })->count(),
                'conversions' => UserReferral::where('status', 'completed')
                    ->whereHas('referee', function($q) {
                        $q->where('user_type', 'vendor');
                    })->count(),
            ],
            [
                'label' => 'Couriers',
                'referrals' => UserReferral::whereHas('referee', function($q) {
                    $q->where('user_type', 'courier');
                })->count(),
                'conversions' => UserReferral::where('status', 'completed')
                    ->whereHas('referee', function($q) {
                        $q->where('user_type', 'courier');
                    })->count(),
            ],
        ];

        return response()->json([
            'sources' => $sources,
            'total_referrals' => $totalReferrals,
            'by_user_type' => $referralsByUserType,
        ]);
    }

    // Performance Chart Data
    public function getPerformanceData(Request $request)
    {
        $period = $request->get('period', 'monthly'); // weekly, monthly, quarterly
        
        $data = [];
        $labels = [];
        
        if ($period === 'weekly') {
            // Last 7 days
            for ($i = 6; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $labels[] = $date->format('D');
                $data[] = UserReferral::whereDate('created_at', $date)->count();
            }
        } elseif ($period === 'monthly') {
            // Last 12 months
            for ($i = 11; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $labels[] = $date->format('M');
                $data[] = UserReferral::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count();
            }
        } else {
            // Quarterly - last 4 quarters
            for ($i = 3; $i >= 0; $i--) {
                $date = now()->subQuarters($i);
                $quarter = ceil($date->month / 3);
                $labels[] = "Q{$quarter} " . $date->format('Y');
                $startMonth = ($quarter - 1) * 3 + 1;
                $data[] = UserReferral::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', '>=', $startMonth)
                    ->whereMonth('created_at', '<=', $startMonth + 2)
                    ->count();
            }
        }

        // Summary stats for different periods
        $thisWeek = UserReferral::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count();
        $lastWeek = UserReferral::whereBetween('created_at', [now()->subWeek()->startOfWeek(), now()->subWeek()->endOfWeek()])->count();
        
        $thisMonth = UserReferral::whereMonth('created_at', now()->month)->whereYear('created_at', now()->year)->count();
        $lastMonth = UserReferral::whereMonth('created_at', now()->subMonth()->month)->whereYear('created_at', now()->subMonth()->year)->count();
        
        $thisQuarter = UserReferral::whereBetween('created_at', [now()->startOfQuarter(), now()->endOfQuarter()])->count();
        $lastQuarter = UserReferral::whereBetween('created_at', [now()->subQuarter()->startOfQuarter(), now()->subQuarter()->endOfQuarter()])->count();
        
        $allTime = UserReferral::count();

        return response()->json([
            'labels' => $labels,
            'data' => $data,
            'summary' => [
                'this_week' => $thisWeek,
                'week_change' => $lastWeek > 0 ? round((($thisWeek - $lastWeek) / $lastWeek) * 100, 1) : 0,
                'this_month' => $thisMonth,
                'month_change' => $lastMonth > 0 ? round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1) : 0,
                'this_quarter' => $thisQuarter,
                'quarter_change' => $lastQuarter > 0 ? round((($thisQuarter - $lastQuarter) / $lastQuarter) * 100, 1) : 0,
                'all_time' => $allTime,
            ]
        ]);
    }

    // Conversion Funnel
    public function getConversionFunnel()
    {
        // These would be tracked separately in production
        $linksShared = UserReferral::count() * 3; // Estimate: each referral code shared ~3 times
        $linksClicked = UserReferral::count() * 2; // Estimate
        $signupsStarted = UserReferral::count();
        $signupsCompleted = UserReferral::where('status', 'completed')->count();
        $firstTransaction = UserReferral::where('status', 'completed')
            ->where('reward_amount', '>', 0)
            ->count();

        $maxValue = max($linksShared, 1);

        return response()->json([
            ['label' => 'Links Shared', 'value' => $linksShared, 'percentage' => 100],
            ['label' => 'Links Clicked', 'value' => $linksClicked, 'percentage' => round(($linksClicked / $maxValue) * 100)],
            ['label' => 'Signups Started', 'value' => $signupsStarted, 'percentage' => round(($signupsStarted / $maxValue) * 100)],
            ['label' => 'Signups Completed', 'value' => $signupsCompleted, 'percentage' => round(($signupsCompleted / $maxValue) * 100)],
            ['label' => 'First Transaction', 'value' => $firstTransaction, 'percentage' => round(($firstTransaction / $maxValue) * 100)],
        ]);
    }

    // Settings
    public function getSettings()
    {
        // Get settings from config or database
        $settings = DB::table('referral_settings')->first();
        
        if (!$settings) {
            // Return defaults
            return response()->json([
                'program_active' => true,
                'auto_approve_rewards' => true,
                'allow_custom_codes' => true,
                'fraud_detection' => true,
                'daily_referral_limit' => 10,
                'monthly_earnings_cap' => 500,
                'reward_expiry_days' => 90,
                'minimum_payout' => 10,
            ]);
        }

        return response()->json([
            'program_active' => (bool) $settings->program_active,
            'auto_approve_rewards' => (bool) $settings->auto_approve_rewards,
            'allow_custom_codes' => (bool) $settings->allow_custom_codes,
            'fraud_detection' => (bool) $settings->fraud_detection,
            'daily_referral_limit' => $settings->daily_referral_limit,
            'monthly_earnings_cap' => $settings->monthly_earnings_cap,
            'reward_expiry_days' => $settings->reward_expiry_days,
            'minimum_payout' => $settings->minimum_payout,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'program_active' => 'sometimes|boolean',
            'auto_approve_rewards' => 'sometimes|boolean',
            'allow_custom_codes' => 'sometimes|boolean',
            'fraud_detection' => 'sometimes|boolean',
            'daily_referral_limit' => 'sometimes|integer|min:1',
            'monthly_earnings_cap' => 'sometimes|numeric|min:0',
            'reward_expiry_days' => 'sometimes|integer|min:1',
            'minimum_payout' => 'sometimes|numeric|min:0',
        ]);

        $exists = DB::table('referral_settings')->exists();

        if ($exists) {
            DB::table('referral_settings')->update($validated);
        } else {
            DB::table('referral_settings')->insert(array_merge([
                'program_active' => true,
                'auto_approve_rewards' => true,
                'allow_custom_codes' => true,
                'fraud_detection' => true,
                'daily_referral_limit' => 10,
                'monthly_earnings_cap' => 500,
                'reward_expiry_days' => 90,
                'minimum_payout' => 10,
            ], $validated));
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    public function updateLimit(Request $request)
    {
        $validated = $request->validate([
            'field' => 'required|in:daily_referral_limit,monthly_earnings_cap,reward_expiry_days,minimum_payout',
            'value' => 'required|numeric|min:0',
        ]);

        $exists = DB::table('referral_settings')->exists();

        if ($exists) {
            DB::table('referral_settings')->update([
                $validated['field'] => $validated['value']
            ]);
        } else {
            $defaults = [
                'program_active' => true,
                'auto_approve_rewards' => true,
                'allow_custom_codes' => true,
                'fraud_detection' => true,
                'daily_referral_limit' => 10,
                'monthly_earnings_cap' => 500,
                'reward_expiry_days' => 90,
                'minimum_payout' => 10,
            ];
            $defaults[$validated['field']] = $validated['value'];
            DB::table('referral_settings')->insert($defaults);
        }

        return response()->json(['message' => 'Limit updated successfully']);
    }
    // Single View Methods

    public function showCampaign($id)
    {
        $campaign = ReferralCampaign::findOrFail($id);
        
        // Attach stats
        $campaign->referrals = UserReferral::where('campaign_id', $id)
            ->with(['referrer:id,name', 'referee:id,name'])
            ->latest()
            ->limit(20)
            ->get();
            
        // Calculate stats
        $clicks = rand(100, 500); // Dummy for now
        $conversions = UserReferral::where('campaign_id', $id)->where('status', 'completed')->count();
        $conversion_rate = $clicks > 0 ? round(($conversions / $clicks) * 100, 1) : 0;
        
        $campaign->stats = [
            'clicks' => $clicks,
            'conversions' => $conversions,
            'conversion_rate' => $conversion_rate,
        ];

        return response()->json($campaign);
    }

    public function showReferrer($id)
    {
        $user = User::findOrFail($id);
        
        $totalReferrals = UserReferral::where('referrer_id', $id)->count();
        $successfulReferrals = UserReferral::where('referrer_id', $id)->where('status', 'completed')->count();
        $totalEarnings = UserReferral::where('referrer_id', $id)->where('status', 'completed')->sum('reward_amount');
        
        $conversionRate = $totalReferrals > 0 ? round(($successfulReferrals / $totalReferrals) * 100, 1) : 0;
        
        // Define Tier
        $tiers = ReferrerTier::orderBy('min_referrals')->get();
        $tierName = 'Bronze';
        foreach ($tiers as $tier) {
            if ($totalReferrals >= $tier->min_referrals && ($tier->max_referrals === null || $totalReferrals <= $tier->max_referrals)) {
                $tierName = $tier->name;
                break;
            }
        }

        $referralHistory = UserReferral::where('referrer_id', $id)
            ->with('referee:id,name,email')
            ->latest()
            ->get();
            
        // Earnings history - using referrals as proxy for now
        $earningsHistory = UserReferral::where('referrer_id', $id)
            ->where('status', 'completed')
            ->where('reward_amount', '>', 0)
            ->select('id', 'reward_amount as amount', 'created_at as date')
            ->selectRaw('"Referral Reward" as type, "Reward for referral" as description')
            ->get();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'tier' => $tierName,
            'total_referrals' => $totalReferrals,
            'successful_referrals' => $successfulReferrals,
            'total_earnings' => $totalEarnings,
            'conversion_rate' => $conversionRate,
            'joined_at' => $user->created_at,
            'referral_history' => $referralHistory,
            'earnings_history' => $earningsHistory,
            'rank' => rand(1, 100) // Dummy rank
        ]);
    }

    public function showReferralCode($id)
    {
        $referral = UserReferral::with(['referrer:id,name,email', 'referee:id,name,email', 'campaign:id,name,type'])
            ->findOrFail($id);
            
        // Get usage count of this code
        $usageCount = UserReferral::where('referral_code', $referral->referral_code)->count();
        
        // Return structured data matching frontend
        return response()->json([
            'id' => $referral->id,
            'code' => $referral->referral_code,
            'referral_code' => $referral->referral_code,
            'status' => $referral->status,
            'reward_amount' => $referral->reward_amount,
            'created_at' => $referral->created_at,
            'completed_at' => $referral->updated_at, // Approximate
            'expires_at' => null, // Not tracking expiry on code yet
            'usage_count' => $usageCount,
            'max_usage' => null,
            'referrer' => $referral->referrer,
            'referee' => $referral->referee,
            'campaign' => $referral->campaign,
        ]);
    }
}
