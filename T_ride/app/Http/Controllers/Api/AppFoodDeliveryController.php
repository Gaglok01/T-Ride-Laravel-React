<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Vendor;
use App\Models\Product;
use App\Models\DeliveryOrder;
use App\Models\DeliveryOrderItem;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AppFoodDeliveryController extends Controller
{
    /**
     * Get home data: categories and featured/nearby vendors
     */
    public function getHomeData(Request $request)
    {
        $categories = Category::where('status', 1)->get();

        $lat = $request->lat; // User's latitude
        $lng = $request->lng; // User's longitude

        $vendorsQuery = Vendor::where('status', 1)->where('is_open', 1);

        if ($lat && $lng) {
            // Filter by location if provided
            // Using Haversine formula for distance
            $vendorsQuery->select('*')
                ->selectRaw(
                    '( 6371 * acos( cos( radians(?) ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(?) ) + sin( radians(?) ) * sin( radians( lat ) ) ) ) AS distance',
                    [$lat, $lng, $lat]
                )
                ->havingRaw('distance < delivery_range_km')
                ->orderBy('distance');
        } else {
            // Just show top rated if no location
            $vendorsQuery->orderByDesc('rating');
        }

        $vendors = $vendorsQuery->limit(10)->get();

        return response()->json([
            'status' => true,
            'data' => [
                'categories' => $categories,
                'vendors' => $vendors
            ]
        ]);
    }

    /**
     * Get vendor details and menu
     */
    public function getVendorDetails($id)
    {
        $vendor = Vendor::with(['products' => function ($query) {
            $query->where('is_active', true);
        }])->find($id);

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $vendor
        ]);
    }

    /**
     * Place a delivery order
     */
    public function placeOrder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_id' => 'required|exists:vendors,id',
            'delivery_address' => 'required|string',
            'delivery_lat' => 'required|numeric',
            'delivery_lng' => 'required|numeric',
            'contact_phone' => 'required|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:Cash,Wallet,Card',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        $vendor = Vendor::find($request->vendor_id);
        
        // Calculate total
        $totalAmount = 0;
        $totalItems = 0;
        $orderItems = [];

        foreach ($request->items as $item) {
            $product = Product::find($item['product_id']);
            if (!$product || $product->vendor_id != $vendor->id) {
                return response()->json(['status' => false, 'message' => 'Invalid product for this vendor'], 422);
            }

            $price = $product->sale_price ?? $product->price;
            $lineTotal = $price * $item['quantity'];
            
            $totalAmount += $lineTotal;
            $totalItems += $item['quantity'];

            $orderItems[] = [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'unit_price' => $price,
                'quantity' => $item['quantity'],
                'total' => $lineTotal,
                'special_instructions' => $item['special_instructions'] ?? null
            ];
        }

        // Add delivery fee
        $totalAmount += $vendor->delivery_fee;

        if ($totalAmount < $vendor->min_order_amount) {
            return response()->json(['status' => false, 'message' => "Minimum order amount is {$vendor->min_order_amount}"], 422);
        }

        // Create Order
        $order = DeliveryOrder::create([
            'order_code' => 'ORD-' . strtoupper(Str::random(8)),
            'customer_id' => Auth::id(),
            'vendor_id' => $vendor->id,
            'category_id' => $vendor->category_id,
            'total_items' => $totalItems,
            'total_amount' => $totalAmount,
            'status' => 'pending',
            'delivery_address' => $request->delivery_address,
            'delivery_lat' => $request->delivery_lat,
            'delivery_lng' => $request->delivery_lng,
            'contact_phone' => $request->contact_phone,
            'delivery_instructions' => $request->delivery_instructions,
            'payment_method' => $request->payment_method,
            'delivery_fee' => $vendor->delivery_fee
        ]);

        // Create Order Items
        foreach ($orderItems as $itemData) {
            $itemData['order_id'] = $order->id;
            DeliveryOrderItem::create($itemData);
        }

        return response()->json([
            'status' => true,
            'message' => 'Order placed successfully',
            'data' => $order->load('items')
        ]);
    }

    /**
     * Get User Addresses
     */
    public function getAddresses()
    {
        $addresses = UserAddress::where('user_id', Auth::id())->latest()->get();
        return response()->json(['status' => true, 'data' => $addresses]);
    }

    /**
     * Add User Address
     */
    public function addAddress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'label' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
            'is_default' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()->first()], 422);
        }

        if ($request->is_default) {
            UserAddress::where('user_id', Auth::id())->update(['is_default' => false]);
        }

        $address = UserAddress::create([
            'user_id' => Auth::id(),
            'label' => $request->label,
            'recipient_name' => $request->recipient_name ?? Auth::user()->name,
            'recipient_phone' => $request->recipient_phone ?? Auth::user()->identifier,
            'address' => $request->address,
            'city' => $request->city,
            'lat' => $request->lat,
            'lng' => $request->lng,
            'is_default' => $request->is_default ?? false
        ]);

        return response()->json(['status' => true, 'message' => 'Address added successfully', 'data' => $address]);
    }

    /**
     * Track Order
     */
    public function trackOrder($id)
    {
        $order = DeliveryOrder::where('id', $id)
            ->where('customer_id', Auth::id())
            ->with(['driver', 'vendor', 'items'])
            ->first();
        
        if (!$order) {
            return response()->json(['status' => false, 'message' => 'Order not found'], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $order
        ]);
    }
}
