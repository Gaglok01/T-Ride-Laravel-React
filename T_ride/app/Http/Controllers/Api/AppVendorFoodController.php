<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vendor;
use App\Models\DeliveryOrder;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AppVendorFoodController extends Controller
{
    /**
     * Get vendor profile
     */
    public function getProfile()
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $vendor
        ]);
    }

    /**
     * Update vendor profile
     */
    public function updateProfile(Request $request)
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'contact' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'city' => 'sometimes|string|max:100',
            'business_timings' => 'sometimes|string|max:255',
            'status' => 'sometimes|integer',
            'is_open' => 'sometimes|boolean',
            'is_available_for_delivery' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $vendor->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully',
            'data' => $vendor
        ]);
    }

    /**
     * Get vendor dashboard / explore data
     */
    public function getDashboard()
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $todayOrders = DeliveryOrder::where('vendor_id', $vendor->id)
            ->whereDate('created_at', today())
            ->count();

        $activeOrders = DeliveryOrder::where('vendor_id', $vendor->id)
            ->whereIn('status', ['pending', 'accepted', 'preparing', 'out_for_delivery'])
            ->count();

        return response()->json([
            'status' => true,
            'data' => [
                'vendor_name' => $vendor->name,
                'today_orders' => $todayOrders,
                'active_orders' => $activeOrders,
                'is_open' => $vendor->is_open,
                'rating' => $vendor->rating,
                'total_revenue' => $vendor->total_revenue
            ]
        ]);
    }

    /**
     * Get vendor orders
     */
    public function getOrders(Request $request)
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $status = $request->status; // pending, ongoing, completed
        $query = DeliveryOrder::where('vendor_id', $vendor->id)->with(['items', 'customer']);

        if ($status == 'ongoing') {
            $query->whereIn('status', ['accepted', 'preparing', 'out_for_delivery']);
        } elseif ($status == 'completed') {
            $query->where('status', 'delivered');
        } elseif ($status == 'cancelled') {
            $query->where('status', 'cancelled');
        } elseif ($status == 'pending') {
            $query->where('status', 'pending');
        }

        $orders = $query->latest()->get();

        return response()->json([
            'status' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get vendor earnings
     */
    public function getEarnings()
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $totalEarnings = $vendor->total_revenue;
        $pendingPayments = DeliveryOrder::where('vendor_id', $vendor->id)
            ->where('status', '!=', 'delivered')
            ->sum('total_amount');
        
        $completedPayments = DeliveryOrder::where('vendor_id', $vendor->id)
            ->where('status', 'delivered')
            ->sum('total_amount');

        // Recently completed orders as transaction history
        $transactions = DeliveryOrder::where('vendor_id', $vendor->id)
            ->where('status', 'delivered')
            ->latest()
            ->limit(20)
            ->get(['id', 'order_code', 'total_amount', 'created_at', 'payment_method']);

        return response()->json([
            'status' => true,
            'data' => [
                'total_earnings' => $totalEarnings,
                'pending_payments' => $pendingPayments,
                'completed_payments' => $completedPayments,
                'transactions' => $transactions
            ]
        ]);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(Request $request, $id)
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();
        $order = DeliveryOrder::where('id', $id)->where('vendor_id', $vendor->id)->first();

        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,preparing,out_for_delivery,delivered,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $order->status = $request->status;
        $order->save();

        if ($request->status == 'delivered') {
            $vendor->total_orders += 1;
            $vendor->total_revenue += $order->total_amount;
            $vendor->save();
        }

        return response()->json([
            'status' => true,
            'message' => 'Order status updated successfully',
            'data' => $order
        ]);
    }

    /**
     * Get vendor menu
     */
    public function getMenu()
    {
        $vendor = Vendor::where('user_id', Auth::id())->first();

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $products = Product::where('vendor_id', $vendor->id)->get();

        return response()->json([
            'status' => true,
            'data' => $products
        ]);
    }
}
