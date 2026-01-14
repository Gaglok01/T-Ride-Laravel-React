<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\DeliveryOrder;

class DeliveryOrderController extends Controller
{
    public function getStats(Request $request)
    {
        $query = DeliveryOrder::query();

        if ($request->has('category_id') && $request->category_id != 'all') {
            $query->where('category_id', $request->category_id);
        }

        $totalOrders = (clone $query)->count();
        $preparing = (clone $query)->where('status', 'preparing')->count();
        $outForDelivery = (clone $query)->where('status', 'on_the_way')->count();
        $delivered = (clone $query)->where('status', 'delivered')->count();
        $revenue = (clone $query)->where('status', 'delivered')->sum('total_amount');

        return response()->json([
            'status' => true,
            'data' => [
                'total_orders' => $totalOrders,
                'preparing' => $preparing,
                'out_for_delivery' => $outForDelivery,
                'delivered' => $delivered,
                'revenue' => number_format($revenue, 2, '.', ''),
                'trends' => [
                    'total_trend' => '+15.2%',
                    'preparing_trend' => '+8.1%',
                    'delivery_trend' => '+3.5%',
                    'delivered_trend' => '+14.3%',
                    'revenue_trend' => '+18.5%',
                ]
            ]
        ]);
    }

     public function index(Request $request)
    {
        $query = DeliveryOrder::with([
            'customer:id,name',
            'vendor:id,name',
            'driver:id,name',
            'category:id,name'
        ]);

        if ($request->has('category_id') && $request->category_id != 'all') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('order_code', 'like', "%$search%")
                  ->orWhereHas('customer', function($q) use ($search) {
                      $q->where('name', 'like', "%$search%");
                  });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(10);
        return response()->json(['status' => true, 'message' => 'Orders retrieved successfully', 'data' => $orders]);
    }

    public function show($id)
    {
        $order = DeliveryOrder::with(['customer', 'vendor', 'driver', 'category'])->find($id);

        if (!$order) return response()->json(['status' => false, 'message' => 'Order not found'], 404);

        return response()->json(['status' => true, 'message' => 'Order retrieved successfully', 'data' => $order]);
    }

}
