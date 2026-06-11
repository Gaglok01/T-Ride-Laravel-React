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
use Illuminate\Support\Facades\Storage;

class AppCourierController extends Controller
{
    /**
     * Get delivery estimates for courier services
     */
    public function getEstimates(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'dropoff_lat' => 'required|numeric',
            'dropoff_lng' => 'required|numeric',
            'package_size' => 'nullable|string', // Optional filter
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

        // Retrieve courier types
        $courierTypes = Type::where('status', 'active')
            ->where('service_type', 'courier')
            ->get();

        if ($courierTypes->isEmpty()) {
            return response()->json(['status' => false, 'message' => 'No courier services available'], 404);
        }

        $estimates = [];
        $baseFare = $zone ? $zone->base_fare : 10; // Default fallback
        $perKm = $zone ? $zone->per_km : 2;       // Default fallback
        $minFare = $zone ? $zone->min_fare : 15;  // Default fallback

        foreach ($courierTypes as $type) {
            $multiplier = 1;
            if ($zone && $zone->vehicleMultipliers) {
                $multiplierObj = $zone->vehicleMultipliers->where('vehicle_type', $type->type_name)->first();
                $multiplier = $multiplierObj ? $multiplierObj->multiplier : 1;
            }

            $fare = $baseFare + ($distance * $perKm);
            $fare = $fare * $multiplier;

            if ($fare < $minFare) {
                $fare = $minFare;
            }

            $estimates[] = [
                'type_id' => $type->id,
                'name' => $type->type_name,
                'description' => $type->description ?? 'Fast and reliable delivery',
                'image' => $type->photo ? asset('storage/' . $type->photo) : null,
                'fare' => round($fare, 2),
                'distance' => round($distance, 2),
                'eta' => rand(10, 30) . ' mins', // Courier might take longer
                'capacity' => $type->capacity ? $type->capacity . ' kg' : 'Standard',
                'max_weight' => $type->max_weight ? $type->max_weight . ' kg' : null
            ];
        }

        return response()->json([
            'status' => true,
            'data' => $estimates
        ]);
    }

    /**
     * Get nearby couriers
     */
    public function getNearbyCouriers(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat' => 'required|numeric',
            'pickup_lng' => 'required|numeric',
            'vehicle_type_id' => 'required|exists:types,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $drivers = Driver::where('status', 'active')
            ->where('type_id', $request->vehicle_type_id)
            ->whereHas('user', function ($query) use ($request) {
                $query->whereNotNull('lat')->whereNotNull('lng');
            })
            // Ensure driver supports courier service? 
            // Assuming driver's vehicle type determines service.
            // But Type has service_type. So we are good if we check type_id.
            ->with(['user', 'type'])
            ->get();

        $availableDrivers = [];
        foreach ($drivers as $driver) {
            // Filter by service type 'courier' just in case, though vehicle_type_id should handle it
            if ($driver->type->service_type !== 'courier') {
                continue;
            }

            $dist = $this->calculateDistance(
                $request->pickup_lat,
                $request->pickup_lng,
                $driver->user->lat,
                $driver->user->lng
            );

            if ($dist <= 10) { // Larger radius for couriers?
                $availableDrivers[] = [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'rating' => $driver->rating ?? 5.0,
                    'vehicle' => $driver->vehicle_model,
                    'photo' => $driver->image_url,
                    'lat' => $driver->user->lat,
                    'lng' => $driver->user->lng,
                    'eta' => round(($dist / 30) * 60) . ' mins',
                    'distance' => round($dist, 2) . ' km'
                ];
            }
        }

        return response()->json([
            'status' => true,
            'data' => $availableDrivers
        ]);
    }

    /**
     * Request a courier
     */
    public function requestCourier(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Sender & Receiver
            'sender_pickup_address' => 'required|string',
            'sender_pickup_lat' => 'required|numeric',
            'sender_pickup_lng' => 'required|numeric',
            'sender_phone' => 'nullable|string',
            'receiver_name' => 'required|string',
            'receiver_phone' => 'required|string',
            'receiver_dropoff_address' => 'required|string',
            'receiver_dropoff_lat' => 'required|numeric',
            'receiver_dropoff_lng' => 'required|numeric',
            
            // Package Details
            'package_size' => 'required|string', // small, medium, large
            'package_weight' => 'nullable|numeric',
            'package_photo' => 'nullable|string', // URL or path
            'package_description' => 'nullable|string', // Using pickup_instructions for description or creating new column? Let's use pickup_instructions or comment
            
            // Ride Details
            'vehicle_type_id' => 'required|exists:types,id',
            'estimated_fare' => 'required|numeric',
            'payment_method' => 'required|in:Cash,Wallet,Card',
            
            // Instructions
            'pickup_instructions' => 'nullable|string',
            'dropoff_instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        // Create the ride/delivery request
        $ride = Ride::create([
            'ride_custom_id' => 'DEL-' . strtoupper(Str::random(8)),
            'rider_id' => Auth::id(),
            'service_type' => 'courier',
            'status' => 'searching',
            
            // Locations
            'pickup_address' => $request->sender_pickup_address,
            'pickup_lat' => $request->sender_pickup_lat,
            'pickup_lng' => $request->sender_pickup_lng,
            'dropoff_address' => $request->receiver_dropoff_address,
            'dropoff_lat' => $request->receiver_dropoff_lat,
            'dropoff_lng' => $request->receiver_dropoff_lng,
            
            // Courier Specifics
            'receiver_name' => $request->receiver_name,
            'receiver_phone' => $request->receiver_phone,
            'package_size' => $request->package_size,
            'package_weight' => $request->package_weight,
            'package_photo' => $request->package_photo,
            'pickup_instructions' => $request->pickup_instructions,
            'dropoff_instructions' => $request->dropoff_instructions,
            
            // Payment & Vehicle
            'vehicle_type_id' => $request->vehicle_type_id,
            'fare' => $request->estimated_fare,
            'payment_method' => $request->payment_method,
            'payment_status' => 'pending',
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Courier request created successfully',
            'data' => $ride
        ]);
    }

    /**
     * Upload package photo
     */
    public function uploadPackagePhoto(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        if ($request->hasFile('photo')) {
            $path = $request->file('photo')->store('package_photos', 'public');
            return response()->json([
                'status' => true,
                'message' => 'Photo uploaded successfully',
                'url' => asset('storage/' . $path),
                'path' => $path
            ]);
        }

        return response()->json(['status' => false, 'message' => 'File not found'], 400);
    }

    /**
     * Get active courier deliveries for the user
     */
    public function getActiveDeliveries()
    {
        $deliveries = Ride::where('rider_id', Auth::id())
            ->where('service_type', 'courier')
            ->whereIn('status', ['searching', 'accepted', 'arrived', 'in_progress'])
            ->with(['driver.user', 'vehicleType'])
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'data' => $deliveries
        ]);
    }

    /**
     * Calculate distance helper
     */
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

    /**
     * Get specific delivery details
     */
    public function getDeliveryDetails($id)
    {
        $delivery = Ride::where('id', $id)
            ->where('rider_id', Auth::id())
            ->where('service_type', 'courier')
            ->with(['driver.user', 'vehicleType'])
            ->first();

        if (!$delivery) {
            return response()->json(['status' => false, 'message' => 'Delivery not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $delivery
        ]);
    }

    /**
     * Cancel a courier request
     */
    public function cancelCourier($id)
    {
        $ride = Ride::where('id', $id)
            ->where('rider_id', Auth::id())
            ->where('service_type', 'courier')
            ->first();

        if (!$ride) {
            return response()->json(['status' => false, 'message' => 'Delivery not found'], 404);
        }

        if (in_array($ride->status, ['completed', 'cancelled', 'in_progress', 'arrived'])) {
            return response()->json(['status' => false, 'message' => 'Delivery cannot be cancelled at this stage'], 422);
        }

        $ride->update(['status' => 'cancelled']);

        return response()->json([
            'status' => true,
            'message' => 'Delivery cancelled successfully'
        ]);
    }

    /**
     * Rate a courier delivery
     */
    public function rateCourier(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        $ride = Ride::where('id', $id)
            ->where('rider_id', Auth::id())
            ->where('service_type', 'courier')
            ->first();

        if (!$ride || $ride->status !== 'completed') {
            return response()->json(['status' => false, 'message' => 'Invalid delivery or not completed yet'], 422);
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
}
