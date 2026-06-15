<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverChallenge;
use Illuminate\Support\Facades\DB;

class AdminChallengeProgressController extends Controller
{
    public function show($id)
    {
        $challenge = DriverChallenge::findOrFail($id);

        $participants = DB::table('driver_challenge_participants as p')
            ->join('drivers as d', 'd.id', '=', 'p.driver_id')
            ->select(
                'p.id',
                'p.driver_id',
                'd.name',
                'p.current_progress',
                'p.joined_at',
                'p.completed_at',
                'p.claimed_at'
            )
            ->where('p.challenge_id', $id)
            ->orderByDesc('p.current_progress')
            ->get();

        return response()->json([
            'status' => true,
            'challenge' => $challenge,
            'stats' => [
                'participants' => $participants->count(),
                'completed' => $participants->whereNotNull('completed_at')->count(),
                'claimed' => $participants->whereNotNull('claimed_at')->count(),
            ],
            'participants_data' => $participants,
        ]);
    }
}
