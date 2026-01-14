<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Promotion;
use Carbon\Carbon;

class PromotionController extends Controller
{
     public function getStats()
    {
        $this->autoExpirePromos();
        // Active Promos count
        $activePromos = Promotion::where('status', 'active')->count();

        // Total Redemptions
        $totalRedemptions = Promotion::sum('current_uses');

        // Total Discount Amount
        $totalDiscount = Promotion::sum('total_discount_given');

        // Avg Discount (Total Discount / Total Redemptions)
        $avgDiscount = $totalRedemptions > 0 ? ($totalDiscount / $totalRedemptions) : 0;

        return response()->json([
            'status' => true,
            'data' => [
                'active_promos' => $activePromos,
                'total_redemptions' => $totalRedemptions,
                'total_discount' => round($totalDiscount, 2),
                'avg_discount' => round($avgDiscount, 2),

                // Image mein trends hain (+4, +856),
                // uske liye pichle hafte/mahine ka data compare karna padega.
                // Filhal dummy data bhej rahe hain:
                'trends' => [
                    'active_trend' => '+4',
                    'redemption_trend' => '+856',
                    'discount_trend' => '+$5,230',
                    'avg_trend' => '-$0.12'
                ]
            ]
        ]);
    }

    public function index(Request $request)
    {
        $this->autoExpirePromos();
        $query = Promotion::query();
        if ($request->has('search')) {
            $query->where('code', 'like', '%' . $request->search . '%');
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $promotions = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json(['status' => true, 'message' => 'Promotions retrieved successfully', 'data' => $promotions]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:promotions,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric',
            'max_uses' => 'required|integer',
            'valid_until' => 'required|date|after_or_equal:today',
            'status' => 'in:active,paused'
        ]);

        $promo = Promotion::create($validated);

        return response()->json(['status' => true, 'message' => 'Promo created successfully', 'data' => $promo]);
    }

    public function update(Request $request, $id)
    {
        $promo = Promotion::findOrFail($id);

        $validated = $request->validate([
            'code' => 'string|unique:promotions,code,' . $promo->id,
            'type' => 'in:percentage,fixed',
            'value' => 'numeric',
            'max_uses' => 'integer',
            'valid_until' => 'date|after_or_equal:today',
            'status' => 'in:active,paused,expired'
        ]);

        $promo->update($validated);
        $this->autoExpirePromos();

        return response()->json(['status' => true, 'message' => 'Promo updated successfully', 'data' => $promo->refresh()]);
    }

    public function show($id)
    {
        $promo = Promotion::find($id);
        if (!$promo) return response()->json(['status' => false, 'message' => 'Not found'], 404);
        if($promo->valid_until < Carbon::now()->format('Y-m-d') && $promo->status !== 'expired'){
             $promo->status = 'expired';
             $promo->save();
        }

        return response()->json(['status' => true, 'message' => 'Promo retrieved successfully', 'data' => $promo]);
    }

    public function toggleStatus($id)
    {
        $promo = Promotion::find($id);
        if (!$promo) return response()->json(['status' => false, 'message' => 'Not found'], 404);
        if ($promo->valid_until < Carbon::now()->format('Y-m-d')) {
            $promo->status = 'expired';
            $promo->save();
            return response()->json(['status' => false, 'message' => 'Cannot toggle status. This promo has expired.']);
        }

        if ($promo->status === 'active') {
            $promo->status = 'paused';
        } elseif ($promo->status === 'paused') {
            $promo->status = 'active';
        }
        $promo->save();

        return response()->json(['status' => true, 'message' => 'Promo status toggled successfully', 'data' => $promo]);
    }

    public function destroy($id)
    {
        $promo = Promotion::find($id);
        if (!$promo) return response()->json(['status' => false, 'message' => 'Not found'], 404);

        $promo->delete();
        return response()->json(['status' => true, 'message' => 'Promo deleted successfully']);
    }

    private function autoExpirePromos()
    {
        $today = Carbon::now()->format('Y-m-d');
        Promotion::where('valid_until', '<', $today)
                 ->where('status', '!=', 'expired')
                 ->update(['status' => 'expired']);
    }

}
