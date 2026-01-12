<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use Exception;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        try {
            $orders = Order::latest()->get();

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    public function create(Request $request)
    {
        $request->validate([
            'sender' => 'required|string',
            'recipient' => 'required|string',
            'package_type' => 'required|string',
            'courier' => 'required|string',
            'fee' => 'required|numeric',
            'status' => 'required|string',
        ]);
        DB::beginTransaction();

        try {
            $last = Order::latest('id')->first();
            $number = $last ? intval(substr($last->order_id, 4)) + 1 : 1;
            $orderId = 'PKG-' . str_pad($number, 2, '0', STR_PAD_LEFT);
            $order = Order::create([
                'order_id' => $orderId,
                'sender' => $request->sender,
                'recipient' => $request->recipient,
                'package_type' => $request->package_type,
                'courier' => $request->courier,
                'fee' => $request->fee,
                'status' => $request->status,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with('type')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $order
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'order not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'sender' => 'sometimes|required|string',
            'recipient' => 'sometimes|required|string',
            'package_type' => 'sometimes|required|string',
            'courier' => 'sometimes|required|string',
            'fee' => 'sometimes|required|numeric',
            'status' => 'sometimes|required|string',
        ]);

        try {
            $order = Order::findOrFail($id);
            $order->update([
                'sender' => $request->sender ?? $order->sender,
                'recipient' => $request->recipient ?? $order->recipient,
                'package_type' => $request->package_type ?? $order->package_type,
                'courier' => $request->courier ?? $order->courier,
                'fee' => $request->fee ?? $order->fee,
                'status' => $request->status ?? $order->status,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $order
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $order = Order::findOrFail($id);
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

}
