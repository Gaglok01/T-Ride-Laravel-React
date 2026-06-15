<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverPromotion;
use App\Models\DriverChallenge;
use App\Models\DriverChallengeParticipant;
use App\Models\Driver;
use App\Models\Ride;
use App\Models\WalletTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DriverOpportunityController extends Controller
{
    public function index()
    {
        $now = now();
        $user = Auth::user();
        $driver = Driver::where('user_id', $user->id)->firstOrFail();

        $promotions = DriverPromotion::where('status', 'active')
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderBy('ends_at')
            ->limit(10)
            ->get();

        $driverProfile = DB::table('drivers')
            ->where('user_id', $driver->id)
            ->first();

        $driverServiceType = 'ride';

        if ($driverProfile && $driverProfile->type_id) {
            $driverType = DB::table('types')
                ->where('id', $driverProfile->type_id)
                ->first();

            if ($driverType && $driverType->service_type) {
                $driverServiceType = $driverType->service_type;
            }
        }

        $challenges = DriverChallenge::where('status', 'active')
            ->where(function ($q) use ($driverServiceType) {
                $q->where('service_type', 'all')
                  ->orWhere('service_type', $driverServiceType);
            })
            ->where(function ($q) use ($driverProfile) {
                $driverTypeId = $driverProfile ? $driverProfile->type_id : null;
                $q->whereNull('type_id')
                  ->orWhere('type_id', $driverTypeId);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->orderBy('ends_at')
            ->limit(10)
            ->get()
            ->map(function ($challenge) use ($driver) {
                $participant = DriverChallengeParticipant::where('driver_id', $driver->id)
                    ->where('challenge_id', $challenge->id)
                    ->first();

                $progress = 0;

                if ($participant && $challenge->challenge_type === 'rides') {
                    $progress = Ride::where('driver_id', $driver->id)
                        ->where('status', 'completed')
                        ->whereNotNull('completed_at')
                        ->where('completed_at', '>=', $participant->joined_at)
                        ->count();
                }

                $target = (int) $challenge->target_value;
                $completed = $participant && $target > 0 && $progress >= $target;

                if ($completed && !$participant->completed_at) {
                    $participant->completed_at = now();
                    $participant->save();
                }

                return [
                    'id' => $challenge->id,
                    'title' => $challenge->title,
                    'description' => $challenge->description,
                    'reward_amount' => $challenge->reward_amount,
                    'challenge_type' => $challenge->challenge_type,
                    'target_value' => $target,
                    'service_type' => $challenge->service_type,
                    'type_id' => $challenge->type_id,
                    'starts_at' => $challenge->starts_at,
                    'ends_at' => $challenge->ends_at,
                    'status' => $challenge->status,
                    'joined' => (bool) $participant,
                    'progress' => $progress,
                    'completed' => (bool) $completed,
                    'claimed' => $participant && $participant->claimed_at ? true : false,
                    'joined_at' => $participant ? $participant->joined_at : null,
                    'completed_at' => $participant ? $participant->completed_at : null,
                    'claimed_at' => $participant ? $participant->claimed_at : null,
                ];
            });

        return response()->json([
            'status' => true,
            'data' => [
                'promotions_count' => $promotions->count(),
                'challenges_count' => $challenges->count(),
                'scheduled_count' => 0,
                'promotions' => $promotions,
                'challenges' => $challenges,
                'scheduled_rides' => [],
            ],
        ]);
    }

    public function joinChallenge($id)
    {
        $user = Auth::user();
        $driver = Driver::where('user_id', $user->id)->firstOrFail();

        $challenge = DriverChallenge::where('id', $id)
            ->where('status', 'active')
            ->firstOrFail();

        $participant = DriverChallengeParticipant::firstOrCreate(
            [
                'driver_id' => $driver->id,
                'challenge_id' => $challenge->id,
            ],
            [
                'joined_at' => now(),
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'Challenge joined successfully.',
            'data' => $participant,
        ]);
    }

    public function claimChallenge($id)
    {
        $user = Auth::user();
        $driver = Driver::where('user_id', $user->id)->firstOrFail();

        $challenge = DriverChallenge::where('id', $id)
            ->where('status', 'active')
            ->firstOrFail();

        $participant = DriverChallengeParticipant::where('driver_id', $driver->id)
            ->where('challenge_id', $challenge->id)
            ->first();

        if (!$participant) {
            return response()->json([
                'status' => false,
                'message' => 'You must join this challenge first.',
            ], 422);
        }

        if ($participant->claimed_at) {
            return response()->json([
                'status' => false,
                'message' => 'Bonus already claimed.',
            ], 422);
        }

        $progress = Ride::where('driver_id', $driver->id)
            ->where('status', 'completed')
            ->whereNotNull('completed_at')
            ->where('completed_at', '>=', $participant->joined_at)
            ->count();

        if ($progress < $challenge->target_value) {
            return response()->json([
                'status' => false,
                'message' => 'Challenge not completed yet.',
                'data' => [
                    'progress' => $progress,
                    'target' => $challenge->target_value,
                ],
            ], 422);
        }

        $driverUser = $user;

        $balanceBefore = (float) $driverUser->wallet_balance;

        $driverUser->wallet_balance =
            $balanceBefore + (float) $challenge->reward_amount;

        $driverUser->save();

        WalletTransaction::create([
            'user_id' => $driverUser->id,
            'amount' => $challenge->reward_amount,
            'balance_before' => $balanceBefore,
            'balance_after' => $driverUser->wallet_balance,
            'type' => 'credit',
            'transaction_type' => 'challenge_reward',
            'status' => 'completed',
            'description' => 'Challenge Reward: ' . $challenge->title,
            'reference_id' => $challenge->id,
        ]);

        $participant->completed_at = $participant->completed_at ?: now();
        $participant->claimed_at = now();
        $participant->save();

        return response()->json([
            'status' => true,
            'message' => 'Bonus claimed successfully.',
            'data' => [
                'reward_amount' => $challenge->reward_amount,
                'progress' => $progress,
                'target' => $challenge->target_value,
                'participant' => $participant,
            ],
        ]);
    }
}
