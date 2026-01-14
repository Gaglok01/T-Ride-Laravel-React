<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ride;
use Carbon\Carbon;

class RideController extends Controller
{
    public function getStats(Request $request)
    {
        $query = Ride::query();

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $totalRides = (clone $query)->count();
        $completedRides = (clone $query)->where('status', 'completed')->count();
        $inProgressRides = (clone $query)->where('status', 'in_progress')->count();
        $cancelledRides = (clone $query)->where('status', 'cancelled')->count();
        $revenue = (clone $query)->where('status', 'completed')->sum('fare');

        return response()->json([
            'status' => true,
            'data' => [
                'total_rides' => $totalRides,
                'completed' => $completedRides,
                'in_progress' => $inProgressRides,
                'cancelled' => $cancelledRides,
                'revenue' => number_format($revenue, 2, '.', ''),
                'trends' => [
                    'total' => '+8.2%',
                    'completed' => '+7.1%',
                    'in_progress' => '+2.3%',
                    'cancelled' => '-12.5%',
                    'revenue' => '+15.8%'
                ]
            ]
        ]);
    }

    public function index(Request $request)
    {
        $query = Ride::with(['rider:id,name', 'driver:id,name']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('ride_custom_id', 'like', "%$search%")
                  ->orWhereHas('rider', function($q2) use ($search) {
                      $q2->where('name', 'like', "%$search%");
                  })
                  ->orWhereHas('driver', function($q3) use ($search) {
                      $q3->where('name', 'like', "%$search%");
                  });
            });
        }

        if ($request->has('status') && $request->status != 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $rides = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json(['status' => true, 'message' => 'Rides retrieved successfully', 'data' => $rides]);
    }

    public function updateStatus(Request $request, $id)
    {
        $ride = Ride::find($id);
        if (!$ride) return response()->json(['status' => false, 'message' => 'Ride not found'], 404);

        $request->validate([
            'status' => 'required|in:in_progress,completed,cancelled'
        ]);

        $ride->status = $request->status;

        if ($request->status == 'completed') {
            $ride->completed_at = now();
            $ride->payment_status = 'paid';
        }

        $ride->save();

        return response()->json(['status' => true, 'message' => 'Ride status updated', 'data' => $ride]);
    }
}
