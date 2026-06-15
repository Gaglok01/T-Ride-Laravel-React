<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DriverPromotion;
use Illuminate\Http\Request;

class AdminDriverPromotionController extends Controller
{
    public function index()
    {
        return response()->json([
            'status' => true,
            'data' => DriverPromotion::latest()->paginate(20),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reward_amount' => 'required|numeric|min:0',
            'target_rides' => 'required|integer|min:0',
            'service_type' => 'nullable|string',
            'city' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'status' => 'nullable|in:active,paused,expired',
        ]);

        $promo = DriverPromotion::create($data);

        return response()->json([
            'status' => true,
            'message' => 'Driver promotion created successfully',
            'data' => $promo,
        ]);
    }

    public function update(Request $request, $id)
    {
        $promo = DriverPromotion::findOrFail($id);

        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'reward_amount' => 'sometimes|numeric|min:0',
            'target_rides' => 'sometimes|integer|min:0',
            'service_type' => 'nullable|string',
            'city' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date',
            'status' => 'nullable|in:active,paused,expired',
        ]);

        $promo->update($data);

        return response()->json([
            'status' => true,
            'message' => 'Driver promotion updated successfully',
            'data' => $promo->refresh(),
        ]);
    }

    public function destroy($id)
    {
        DriverPromotion::findOrFail($id)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Driver promotion deleted successfully',
        ]);
    }
}
