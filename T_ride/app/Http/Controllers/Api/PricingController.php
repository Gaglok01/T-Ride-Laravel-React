<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PricingZone;
use App\Models\VehicleTypeMultiplier;
use App\Models\PackagePricing;
use App\Models\DeliveryFee;
use App\Models\SurgeRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PricingController extends Controller
{
    /**
     * Get all pricing zones with vehicle multipliers
     */
    public function getPricingZones()
    {
        $zones = PricingZone::with('vehicleMultipliers')->latest()->get();

        return response()->json([
            'status' => true,
            'message' => 'Pricing zones fetched successfully',
            'data' => $zones
        ]);
    }

    /**
     * Store a new pricing zone
     */
    public function storePricingZone(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_fare' => 'required|numeric|min:0',
            'per_km' => 'required|numeric|min:0',
            'per_minute' => 'required|numeric|min:0',
            'min_fare' => 'required|numeric|min:0',
            'vehicle_multipliers' => 'nullable|array',
            'vehicle_multipliers.*.vehicle_type' => 'required|string',
            'vehicle_multipliers.*.multiplier' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $zone = PricingZone::create([
                'zone_id' => 'PZ-' . strtoupper(Str::random(6)),
                'name' => $request->name,
                'description' => $request->description,
                'base_fare' => $request->base_fare,
                'per_km' => $request->per_km,
                'per_minute' => $request->per_minute,
                'min_fare' => $request->min_fare,
                'status' => 'active'
            ]);

            // Add vehicle multipliers
            if ($request->has('vehicle_multipliers')) {
                foreach ($request->vehicle_multipliers as $multiplier) {
                    VehicleTypeMultiplier::create([
                        'pricing_zone_id' => $zone->id,
                        'vehicle_type' => $multiplier['vehicle_type'],
                        'multiplier' => $multiplier['multiplier']
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Pricing zone created successfully',
                'data' => $zone->load('vehicleMultipliers')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to create pricing zone',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update pricing zone
     */
    public function updatePricingZone(Request $request, $id)
    {
        $zone = PricingZone::find($id);

        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'Pricing zone not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'base_fare' => 'sometimes|numeric|min:0',
            'per_km' => 'sometimes|numeric|min:0',
            'per_minute' => 'sometimes|numeric|min:0',
            'min_fare' => 'sometimes|numeric|min:0',
            'vehicle_multipliers' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $zone->update($request->only(['name', 'description', 'base_fare', 'per_km', 'per_minute', 'min_fare']));

            // Update vehicle multipliers
            if ($request->has('vehicle_multipliers')) {
                $zone->vehicleMultipliers()->delete();
                foreach ($request->vehicle_multipliers as $multiplier) {
                    VehicleTypeMultiplier::create([
                        'pricing_zone_id' => $zone->id,
                        'vehicle_type' => $multiplier['vehicle_type'],
                        'multiplier' => $multiplier['multiplier']
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Pricing zone updated successfully',
                'data' => $zone->load('vehicleMultipliers')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to update pricing zone',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete pricing zone
     */
    public function deletePricingZone($id)
    {
        $zone = PricingZone::find($id);

        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'Pricing zone not found'], 404);
        }

        $zone->delete();

        return response()->json([
            'status' => true,
            'message' => 'Pricing zone deleted successfully'
        ]);
    }

    // ==================== PACKAGE PRICING ====================

    /**
     * Get all package pricing
     */
    public function getPackagePricing()
    {
        $packages = PackagePricing::all();

        return response()->json([
            'status' => true,
            'message' => 'Package pricing fetched successfully',
            'data' => $packages
        ]);
    }

    /**
     * Store package pricing
     */
    public function storePackagePricing(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'package_type' => 'required|string|unique:package_pricing,package_type',
            'base_price' => 'required|numeric|min:0',
            'per_km' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $package = PackagePricing::create([
            'package_type' => $request->package_type,
            'base_price' => $request->base_price,
            'per_km' => $request->per_km,
            'status' => 'active'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Package pricing created successfully',
            'data' => $package
        ]);
    }

    /**
     * Update package pricing
     */
    public function updatePackagePricing(Request $request, $id)
    {
        $package = PackagePricing::find($id);

        if (!$package) {
            return response()->json(['status' => false, 'message' => 'Package pricing not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'base_price' => 'sometimes|numeric|min:0',
            'per_km' => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $package->update($request->only(['base_price', 'per_km']));

        return response()->json([
            'status' => true,
            'message' => 'Package pricing updated successfully',
            'data' => $package
        ]);
    }

    // ==================== DELIVERY FEES ====================

    /**
     * Get all delivery fees
     */
    public function getDeliveryFees()
    {
        $fees = DeliveryFee::latest()->get();

        return response()->json([
            'status' => true,
            'message' => 'Delivery fees fetched successfully',
            'data' => $fees
        ]);
    }

    /**
     * Store delivery fee
     */
    public function storeDeliveryFee(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_fee' => 'required|numeric|min:0',
            'per_km' => 'required|numeric|min:0',
            'min_order' => 'required|numeric|min:0',
            'free_delivery_threshold' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $fee = DeliveryFee::create($request->all() + ['status' => 'active']);

        return response()->json([
            'status' => true,
            'message' => 'Delivery fee created successfully',
            'data' => $fee
        ]);
    }

    /**
     * Update delivery fee
     */
    public function updateDeliveryFee(Request $request, $id)
    {
        $fee = DeliveryFee::find($id);

        if (!$fee) {
            return response()->json(['status' => false, 'message' => 'Delivery fee not found'], 404);
        }

        $fee->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Delivery fee updated successfully',
            'data' => $fee
        ]);
    }

    /**
     * Delete delivery fee
     */
    public function deleteDeliveryFee($id)
    {
        $fee = DeliveryFee::find($id);

        if (!$fee) {
            return response()->json(['status' => false, 'message' => 'Delivery fee not found'], 404);
        }

        $fee->delete();

        return response()->json([
            'status' => true,
            'message' => 'Delivery fee deleted successfully'
        ]);
    }

    // ==================== SURGE RULES ====================

    /**
     * Get all surge rules
     */
    public function getSurgeRules()
    {
        $rules = SurgeRule::latest()->get();

        return response()->json([
            'status' => true,
            'message' => 'Surge rules fetched successfully',
            'data' => $rules
        ]);
    }

    /**
     * Store surge rule
     */
    public function storeSurgeRule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'multiplier' => 'required|numeric|min:1',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i',
            'days' => 'nullable|array',
            'trigger_type' => 'required|in:time,demand,weather,event',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $rule = SurgeRule::create($request->all() + ['status' => 'active']);

        return response()->json([
            'status' => true,
            'message' => 'Surge rule created successfully',
            'data' => $rule
        ]);
    }

    /**
     * Update surge rule
     */
    public function updateSurgeRule(Request $request, $id)
    {
        $rule = SurgeRule::find($id);

        if (!$rule) {
            return response()->json(['status' => false, 'message' => 'Surge rule not found'], 404);
        }

        $rule->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Surge rule updated successfully',
            'data' => $rule
        ]);
    }

    /**
     * Delete surge rule
     */
    public function deleteSurgeRule($id)
    {
        $rule = SurgeRule::find($id);

        if (!$rule) {
            return response()->json(['status' => false, 'message' => 'Surge rule not found'], 404);
        }

        $rule->delete();

        return response()->json([
            'status' => true,
            'message' => 'Surge rule deleted successfully'
        ]);
    }

    /**
     * Toggle status for surge rule
     */
    public function toggleSurgeRuleStatus($id)
    {
        $rule = SurgeRule::find($id);

        if (!$rule) {
            return response()->json(['status' => false, 'message' => 'Surge rule not found'], 404);
        }

        $rule->status = $rule->status === 'active' ? 'inactive' : 'active';
        $rule->save();

        return response()->json([
            'status' => true,
            'message' => 'Surge rule status updated successfully',
            'data' => $rule
        ]);
    }
}
