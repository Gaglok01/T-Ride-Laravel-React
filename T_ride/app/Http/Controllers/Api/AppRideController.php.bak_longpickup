<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ride;
use App\Models\PricingZone;
use App\Models\Type;
use App\Models\Driver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AppRideController extends Controller
{
    public function getEstimates(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $distance = $this->calculateDistance(
            $request->pickup_lat,
            $request->pickup_lng,
            $request->dropoff_lat,
            $request->dropoff_lng
        );

        $zone = PricingZone::with('vehicleMultipliers')->first();

        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'No pricing zone found'], 404);
        }

        $estimates = [];
        $vehicleTypes = Type::where('status', 'active')->where('service_type', 'ride')->get();

        foreach ($vehicleTypes as $type) {
            $multiplierObj = $zone->vehicleMultipliers->where('vehicle_type', $type->type_name)->first();
            $multiplier = $multiplierObj ? $multiplierObj->multiplier : 1;

            $fare = $zone->base_fare + ($distance * $zone->per_km);
            $fare = $fare * $multiplier;

            if ($fare < $zone->min_fare) {
                $fare = $zone->min_fare;
            }

            $estimates[] = [
                'type_id' => $type->id,
                'name' => $type->type_name,
                'image' => $type->photo ? asset('storage/' . $type->photo) : null,
                'fare' => round($fare, 2),
                'distance' => round($distance, 2),
                'eta' => rand(2, 10) . ' mins'
            ];
        }

        return response()->json([
            'status' => true,
            'data' => $estimates
        ]);
    }

    public function getNearbyDrivers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'vehicle_type_id' => 'nullable|exists:types,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $driversQuery = Driver::where('status', 'active');

        if ($request->filled('vehicle_type_id')) {
            $driversQuery->where('type_id', $request->vehicle_type_id);
        }

        $drivers = $driversQuery->whereHas('user', function ($query) {
                $query->whereNotNull('lat')->whereNotNull('lng');
            })
            ->with(['user', 'type'])
            ->get();

        $availableDrivers = [];
        foreach ($drivers as $driver) {
            $dist = $this->calculateDistance(
                $request->pickup_lat,
                $request->pickup_lng,
                $driver->user->lat,
                $driver->user->lng
            );

            if ($dist <= 5) {
                $availableDrivers[] = [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'rating' => $driver->rating ?? 5.0,
                    'vehicle' => $driver->vehicle_model,
                    'photo' => $driver->image_url,
                    'eta' => round(($dist / 30) * 60) . ' mins', // Assuming 30km/h avg speed
                    'distance' => round($dist, 2) . ' km'
                ];
            }
        }

        return response()->json([
            'status' => true,
            'data' => $availableDrivers
        ]);
    }

    public function requestRide(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_address' => 'required|string',
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_address' => 'required|string',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'vehicle_type_id' => 'nullable|exists:types,id',
            'payment_method' => 'required|in:Cash,Wallet,Card',
            'fare' => 'required|numeric',
            'driver_id' => 'nullable|exists:drivers,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $ride = Ride::create([
            'ride_custom_id' => 'TR-' . strtoupper(Str::random(8)),
            'rider_id' => Auth::id(),
            'driver_id' => $request->driver_id,
            'vehicle_type_id' => $request->vehicle_type_id,
            'pickup_address' => $request->pickup_address,
            'pickup_lat' => $request->pickup_lat,
            'pickup_lng' => $request->pickup_lng,
            'dropoff_address' => $request->dropoff_address,
            'dropoff_lat' => $request->dropoff_lat,
            'dropoff_lng' => $request->dropoff_lng,
            'fare' => $request->fare,
            'payment_method' => $request->payment_method,
            'status' => $request->driver_id ? 'accepted' : 'searching',
            'started_at' => $request->driver_id ? now() : null,
        ]);

        return response()->json([
            'status' => true,
            'message' => $request->driver_id ? 'Ride confirmed with driver' : 'Ride requested, searching for driver...',
            'data' => $ride
        ]);
    }

    public function getActiveRide()
    {
        $ride = Ride::where('rider_id', Auth::id())
            ->whereIn('status', ['searching', 'accepted', 'arrived', 'in_progress'])
            ->with(['driver.user', 'vehicleType'])
            ->latest()
            ->first();

        if (!$ride) {
            return response()->json(['status' => false, 'message' => 'No active ride found']);
        }

        return response()->json([
            'status' => true,
            'data' => $ride
        ]);
    }

    public function cancelRide($id)
    {
        $ride = Ride::where('id', $id)->where('rider_id', Auth::id())->first();

        if (!$ride) {
            return response()->json(['status' => false, 'message' => 'Ride not found'], 404);
        }

        if (in_array($ride->status, ['completed', 'cancelled'])) {
            return response()->json(['status' => false, 'message' => 'Ride cannot be cancelled'], 422);
        }

        $ride->update(['status' => 'cancelled']);

        return response()->json([
            'status' => true,
            'message' => 'Ride cancelled successfully'
        ]);
    }

    public function rateRide(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        $ride = Ride::where('id', $id)->where('rider_id', Auth::id())->first();

        if (!$ride || $ride->status !== 'completed') {
            return response()->json(['status' => false, 'message' => 'Invalid ride'], 422);
        }

        $ride->update([
            'rating' => $request->rating,
            'comment' => $request->comment
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Rating submitted, thank you!'
        ]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earth_radius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earth_radius * $c;
    }
}
