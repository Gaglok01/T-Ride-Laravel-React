<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\City;
use App\Models\ServiceZone;
use App\Models\TransportationHub;
use App\Models\RestrictedArea;
use App\Models\ExpansionPlan;

class CityZoneController extends Controller
{
    // ==================== CITIES ====================

    public function getCities(Request $request)
    {
        $query = City::withCount(['serviceZones', 'transportationHubs', 'restrictedAreas']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }

        if ($request->has('country')) {
            $query->where('country', $request->country);
        }

        $stats = [
            'total_cities' => City::count(),
            'active_cities' => City::where('status', 'active')->count(),
            'total_zones' => ServiceZone::count(),
            'total_countries' => City::distinct('country')->count('country'),
        ];

        return response()->json([
            'status' => true,
            'stats' => $stats,
            'data' => $query->latest()->get()
        ]);
    }

    public function storeCity(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'timezone' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:10',
            'services' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $city = City::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'City created successfully',
            'data' => $city
        ]);
    }

    public function showCity($id)
    {
        $city = City::with(['serviceZones', 'transportationHubs', 'restrictedAreas'])->find($id);

        if (!$city) {
            return response()->json(['status' => false, 'message' => 'City not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $city
        ]);
    }

    public function updateCity(Request $request, $id)
    {
        $city = City::find($id);
        if (!$city) {
            return response()->json(['status' => false, 'message' => 'City not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'timezone' => 'nullable|string|max:100',
            'currency' => 'nullable|string|max:10',
            'services' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $city->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'City updated successfully',
            'data' => $city
        ]);
    }

    public function updateCityStatus(Request $request, $id)
    {
        $city = City::find($id);
        if (!$city) {
            return response()->json(['status' => false, 'message' => 'City not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $city->status = $request->status;
        $city->save();

        return response()->json([
            'status' => true,
            'message' => 'City status updated successfully'
        ]);
    }

    public function destroyCity($id)
    {
        $city = City::find($id);
        if (!$city) {
            return response()->json(['status' => false, 'message' => 'City not found'], 404);
        }

        $city->delete();

        return response()->json([
            'status' => true,
            'message' => 'City deleted successfully'
        ]);
    }

    // ==================== SERVICE ZONES ====================

    public function getServiceZones(Request $request)
    {
        $query = ServiceZone::with('city');

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function storeServiceZone(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'boundaries' => 'nullable|array',
            'price_multiplier' => 'required|numeric|min:0.1|max:10',
            'status' => 'required|in:active,inactive'
        ]);

        $zone = ServiceZone::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Service zone created successfully',
            'data' => $zone->load('city')
        ]);
    }

    public function showServiceZone($id)
    {
        $zone = ServiceZone::with('city')->find($id);

        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'Service zone not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $zone
        ]);
    }

    public function updateServiceZone(Request $request, $id)
    {
        $zone = ServiceZone::find($id);
        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'Service zone not found'], 404);
        }

        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'boundaries' => 'nullable|array',
            'price_multiplier' => 'required|numeric|min:0.1|max:10',
            'status' => 'required|in:active,inactive'
        ]);

        $zone->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Service zone updated successfully',
            'data' => $zone->load('city')
        ]);
    }

    public function updateServiceZoneStatus(Request $request, $id)
    {
        $zone = ServiceZone::find($id);
        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'Service zone not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $zone->status = $request->status;
        $zone->save();

        return response()->json([
            'status' => true,
            'message' => 'Service zone status updated successfully'
        ]);
    }

    public function destroyServiceZone($id)
    {
        $zone = ServiceZone::find($id);
        if (!$zone) {
            return response()->json(['status' => false, 'message' => 'Service zone not found'], 404);
        }

        $zone->delete();

        return response()->json([
            'status' => true,
            'message' => 'Service zone deleted successfully'
        ]);
    }

    // ==================== TRANSPORTATION HUBS ====================

    public function getTransportationHubs(Request $request)
    {
        $query = TransportationHub::with('city');

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('type') && in_array($request->type, ['airport', 'hub', 'station'])) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function storeTransportationHub(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:airport,hub,station',
            'pickup_fee' => 'required|numeric|min:0',
            'queue_capacity' => 'required|integer|min:1',
            'coordinates' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $hub = TransportationHub::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Transportation hub created successfully',
            'data' => $hub->load('city')
        ]);
    }

    public function showTransportationHub($id)
    {
        $hub = TransportationHub::with('city')->find($id);

        if (!$hub) {
            return response()->json(['status' => false, 'message' => 'Transportation hub not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $hub
        ]);
    }

    public function updateTransportationHub(Request $request, $id)
    {
        $hub = TransportationHub::find($id);
        if (!$hub) {
            return response()->json(['status' => false, 'message' => 'Transportation hub not found'], 404);
        }

        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'type' => 'required|in:airport,hub,station',
            'pickup_fee' => 'required|numeric|min:0',
            'queue_capacity' => 'required|integer|min:1',
            'coordinates' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $hub->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Transportation hub updated successfully',
            'data' => $hub->load('city')
        ]);
    }

    public function updateTransportationHubStatus(Request $request, $id)
    {
        $hub = TransportationHub::find($id);
        if (!$hub) {
            return response()->json(['status' => false, 'message' => 'Transportation hub not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $hub->status = $request->status;
        $hub->save();

        return response()->json([
            'status' => true,
            'message' => 'Transportation hub status updated successfully'
        ]);
    }

    public function destroyTransportationHub($id)
    {
        $hub = TransportationHub::find($id);
        if (!$hub) {
            return response()->json(['status' => false, 'message' => 'Transportation hub not found'], 404);
        }

        $hub->delete();

        return response()->json([
            'status' => true,
            'message' => 'Transportation hub deleted successfully'
        ]);
    }

    // ==================== RESTRICTED AREAS ====================

    public function getRestrictedAreas(Request $request)
    {
        $query = RestrictedArea::with('city');

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        if ($request->has('restriction_type') && in_array($request->restriction_type, ['no_entry', 'time_based', 'pickup_only', 'dropoff_only'])) {
            $query->where('restriction_type', $request->restriction_type);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function storeRestrictedArea(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'restriction_type' => 'required|in:no_entry,time_based,pickup_only,dropoff_only',
            'reason' => 'nullable|string|max:255',
            'effective_period' => 'nullable|string|max:255',
            'boundaries' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $area = RestrictedArea::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Restricted area created successfully',
            'data' => $area->load('city')
        ]);
    }

    public function showRestrictedArea($id)
    {
        $area = RestrictedArea::with('city')->find($id);

        if (!$area) {
            return response()->json(['status' => false, 'message' => 'Restricted area not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $area
        ]);
    }

    public function updateRestrictedArea(Request $request, $id)
    {
        $area = RestrictedArea::find($id);
        if (!$area) {
            return response()->json(['status' => false, 'message' => 'Restricted area not found'], 404);
        }

        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'restriction_type' => 'required|in:no_entry,time_based,pickup_only,dropoff_only',
            'reason' => 'nullable|string|max:255',
            'effective_period' => 'nullable|string|max:255',
            'boundaries' => 'nullable|array',
            'status' => 'required|in:active,inactive'
        ]);

        $area->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Restricted area updated successfully',
            'data' => $area->load('city')
        ]);
    }

    public function updateRestrictedAreaStatus(Request $request, $id)
    {
        $area = RestrictedArea::find($id);
        if (!$area) {
            return response()->json(['status' => false, 'message' => 'Restricted area not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:active,inactive'
        ]);

        $area->status = $request->status;
        $area->save();

        return response()->json([
            'status' => true,
            'message' => 'Restricted area status updated successfully'
        ]);
    }

    public function destroyRestrictedArea($id)
    {
        $area = RestrictedArea::find($id);
        if (!$area) {
            return response()->json(['status' => false, 'message' => 'Restricted area not found'], 404);
        }

        $area->delete();

        return response()->json([
            'status' => true,
            'message' => 'Restricted area deleted successfully'
        ]);
    }

    // ==================== EXPANSION PLANS ====================

    public function getExpansionPlans(Request $request)
    {
        $query = ExpansionPlan::query();

        if ($request->has('stage') && in_array($request->stage, ['research', 'partnerships', 'licensing', 'launch_prep', 'launched'])) {
            $query->where('stage', $request->stage);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('city_name', 'like', "%{$search}%")
                  ->orWhere('country', 'like', "%{$search}%");
            });
        }

        return response()->json([
            'status' => true,
            'data' => $query->orderBy('progress', 'desc')->get()
        ]);
    }

    public function storeExpansionPlan(Request $request)
    {
        $request->validate([
            'city_name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'stage' => 'required|in:research,partnerships,licensing,launch_prep,launched',
            'progress' => 'required|integer|min:0|max:100',
            'target_launch_date' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $plan = ExpansionPlan::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Expansion plan created successfully',
            'data' => $plan
        ]);
    }

    public function showExpansionPlan($id)
    {
        $plan = ExpansionPlan::find($id);

        if (!$plan) {
            return response()->json(['status' => false, 'message' => 'Expansion plan not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $plan
        ]);
    }

    public function updateExpansionPlan(Request $request, $id)
    {
        $plan = ExpansionPlan::find($id);
        if (!$plan) {
            return response()->json(['status' => false, 'message' => 'Expansion plan not found'], 404);
        }

        $request->validate([
            'city_name' => 'required|string|max:255',
            'country' => 'required|string|max:255',
            'stage' => 'required|in:research,partnerships,licensing,launch_prep,launched',
            'progress' => 'required|integer|min:0|max:100',
            'target_launch_date' => 'nullable|date',
            'notes' => 'nullable|string'
        ]);

        $plan->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Expansion plan updated successfully',
            'data' => $plan
        ]);
    }

    public function destroyExpansionPlan($id)
    {
        $plan = ExpansionPlan::find($id);
        if (!$plan) {
            return response()->json(['status' => false, 'message' => 'Expansion plan not found'], 404);
        }

        $plan->delete();

        return response()->json([
            'status' => true,
            'message' => 'Expansion plan deleted successfully'
        ]);
    }

    // ==================== DASHBOARD STATS ====================

    public function getDashboardStats()
    {
        $stats = [
            'active_cities' => City::where('status', 'active')->count(),
            'total_zones' => ServiceZone::count(),
            'total_countries' => City::distinct('country')->count('country'),
            'total_hubs' => TransportationHub::count(),
            'restricted_areas' => RestrictedArea::where('status', 'active')->count(),
            'expansion_pipeline' => ExpansionPlan::where('stage', '!=', 'launched')->count(),
        ];

        return response()->json([
            'status' => true,
            'data' => $stats
        ]);
    }
}
