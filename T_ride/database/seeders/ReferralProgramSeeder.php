<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ReferralCampaign;
use App\Models\ReferralRule;
use App\Models\ReferrerTier;
use App\Models\UserReferral;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReferralProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create referral campaigns
        $campaigns = [
            [
                'name' => 'Summer Referral Blast',
                'type' => 'general',
                'status' => 'active',
                'start_date' => Carbon::now()->subDays(30),
                'end_date' => Carbon::now()->addDays(60),
                'budget' => 10000.00,
                'spent' => 3250.00,
                'description' => 'Get double rewards for every successful referral this summer!',
            ],
            [
                'name' => 'Driver Recruitment Drive',
                'type' => 'driver',
                'status' => 'active',
                'start_date' => Carbon::now()->subDays(15),
                'end_date' => Carbon::now()->addDays(45),
                'budget' => 15000.00,
                'spent' => 4500.00,
                'description' => 'Recruit new drivers and earn bonus rewards for each successful signup.',
            ],
            [
                'name' => 'New Year Bonus Program',
                'type' => 'user',
                'status' => 'scheduled',
                'start_date' => Carbon::now()->addDays(30),
                'end_date' => Carbon::now()->addDays(90),
                'budget' => 8000.00,
                'spent' => 0.00,
                'description' => 'Special referral bonuses for the new year celebration.',
            ],
            [
                'name' => 'Early Bird Campaign',
                'type' => 'general',
                'status' => 'ended',
                'start_date' => Carbon::now()->subDays(90),
                'end_date' => Carbon::now()->subDays(30),
                'budget' => 5000.00,
                'spent' => 4890.00,
                'description' => 'Completed campaign for early adopters.',
            ],
            [
                'name' => 'Premium Partner Referrals',
                'type' => 'vendor',
                'status' => 'active',
                'start_date' => Carbon::now()->subDays(10),
                'end_date' => Carbon::now()->addDays(80),
                'budget' => 20000.00,
                'spent' => 1250.00,
                'description' => 'Special rewards for vendor partner referrals.',
            ],
        ];

        foreach ($campaigns as $campaign) {
            ReferralCampaign::create($campaign);
        }

        // Create referral rules
        $rules = [
            // Referrer rewards
            [
                'name' => 'First Referral Bonus',
                'type' => 'referrer',
                'trigger_event' => 'signup',
                'reward_type' => 'fixed',
                'reward_amount' => 10.00,
                'is_active' => true,
                'description' => 'Earn $10 when your referred friend signs up.',
            ],
            [
                'name' => 'Friend Completes First Ride',
                'type' => 'referrer',
                'trigger_event' => 'first_ride',
                'reward_type' => 'fixed',
                'reward_amount' => 15.00,
                'is_active' => true,
                'description' => 'Earn an extra $15 when your friend completes their first ride.',
            ],
            [
                'name' => 'Driver Referral Commission',
                'type' => 'referrer',
                'trigger_event' => 'driver_approved',
                'reward_type' => 'fixed',
                'reward_amount' => 50.00,
                'is_active' => true,
                'description' => 'Earn $50 when a referred driver gets approved.',
            ],
            [
                'name' => 'Friend Monthly Bonus',
                'type' => 'referrer',
                'trigger_event' => 'monthly_active',
                'reward_type' => 'percentage',
                'reward_amount' => 5.00,
                'is_active' => false,
                'description' => 'Earn 5% of your friend\'s spending for the first month.',
            ],
            // Referee rewards
            [
                'name' => 'Welcome Bonus',
                'type' => 'referee',
                'trigger_event' => 'signup',
                'reward_type' => 'credit',
                'reward_amount' => 5.00,
                'is_active' => true,
                'description' => 'Get $5 ride credit when you sign up with a referral code.',
            ],
            [
                'name' => 'First Ride Discount',
                'type' => 'referee',
                'trigger_event' => 'first_ride',
                'reward_type' => 'percentage',
                'reward_amount' => 20.00,
                'is_active' => true,
                'description' => 'Get 20% off your first ride as a new user.',
            ],
            [
                'name' => 'New Driver Sign-up Bonus',
                'type' => 'referee',
                'trigger_event' => 'driver_approved',
                'reward_type' => 'fixed',
                'reward_amount' => 25.00,
                'is_active' => true,
                'description' => 'New drivers get $25 bonus after approval.',
            ],
        ];

        foreach ($rules as $rule) {
            ReferralRule::create($rule);
        }

        // Create referrer tiers
        $tiers = [
            [
                'name' => 'Bronze',
                'min_referrals' => 0,
                'max_referrals' => 4,
                'bonus_multiplier' => 1.00,
                'benefits' => ['Standard rewards', 'Basic support'],
                'color' => '#CD7F32',
            ],
            [
                'name' => 'Silver',
                'min_referrals' => 5,
                'max_referrals' => 14,
                'bonus_multiplier' => 1.10,
                'benefits' => ['10% bonus on rewards', 'Priority support', 'Early access to campaigns'],
                'color' => '#C0C0C0',
            ],
            [
                'name' => 'Gold',
                'min_referrals' => 15,
                'max_referrals' => 29,
                'bonus_multiplier' => 1.25,
                'benefits' => ['25% bonus on rewards', 'Dedicated support', 'Exclusive campaigns', 'Custom referral codes'],
                'color' => '#FFD700',
            ],
            [
                'name' => 'Diamond',
                'min_referrals' => 30,
                'max_referrals' => null,
                'bonus_multiplier' => 1.50,
                'benefits' => ['50% bonus on rewards', 'VIP support', 'Partner status', 'Revenue sharing', 'Personal account manager'],
                'color' => '#B9F2FF',
            ],
        ];

        foreach ($tiers as $tier) {
            ReferrerTier::create($tier);
        }

        // Create dummy users if needed and referrals
        $existingUsers = User::take(20)->get();
        
        if ($existingUsers->count() < 2) {
            // Create some dummy users for referrals
            for ($i = 1; $i <= 10; $i++) {
                User::create([
                    'name' => "Test User $i",
                    'email' => "testuser$i@example.com",
                    'password' => bcrypt('password'),
                ]);
            }
            $existingUsers = User::take(20)->get();
        }

        $campaigns = ReferralCampaign::all();
        $statuses = ['pending', 'completed', 'expired', 'completed', 'completed', 'pending'];
        $referralCodes = ['SUMMER24', 'DRIVER50', 'FRIEND10', 'WELCOME5', 'BONUS25', 'RIDE2024', 'NEWYEAR', 'PARTNER'];

        // Create user referrals with realistic data
        foreach ($existingUsers as $index => $user) {
            if ($index === 0) continue; // Skip first user as they won't have a referrer
            
            $referrer = $existingUsers->random();
            if ($referrer->id === $user->id) {
                $referrer = $existingUsers->first();
            }

            $status = $statuses[array_rand($statuses)];
            $rewardAmount = $status === 'completed' ? rand(5, 50) : 0;
            $completedAt = $status === 'completed' ? Carbon::now()->subDays(rand(1, 60)) : null;

            UserReferral::create([
                'referrer_id' => $referrer->id,
                'referee_id' => $user->id,
                'campaign_id' => $campaigns->random()->id,
                'referral_code' => $referralCodes[array_rand($referralCodes)] . rand(100, 999),
                'status' => $status,
                'reward_amount' => $rewardAmount,
                'completed_at' => $completedAt,
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
            ]);
        }

        // Add more referrals for better data visualization
        for ($i = 0; $i < 30; $i++) {
            $referrer = $existingUsers->random();
            $referee = $existingUsers->random();
            
            if ($referrer->id === $referee->id) continue;

            $status = $statuses[array_rand($statuses)];
            $rewardAmount = $status === 'completed' ? rand(10, 75) : 0;
            $completedAt = $status === 'completed' ? Carbon::now()->subDays(rand(1, 45)) : null;

            UserReferral::create([
                'referrer_id' => $referrer->id,
                'referee_id' => $referee->id,
                'campaign_id' => $campaigns->random()->id,
                'referral_code' => strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 4)) . rand(1000, 9999),
                'status' => $status,
                'reward_amount' => $rewardAmount,
                'completed_at' => $completedAt,
                'created_at' => Carbon::now()->subDays(rand(1, 120)),
            ]);
        }

        // Add referral settings
        DB::table('referral_settings')->insert([
            'program_active' => true,
            'auto_approve_rewards' => true,
            'allow_custom_codes' => true,
            'fraud_detection' => true,
            'daily_referral_limit' => 15,
            'monthly_earnings_cap' => 750.00,
            'reward_expiry_days' => 90,
            'minimum_payout' => 10.00,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
