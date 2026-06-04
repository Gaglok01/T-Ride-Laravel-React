<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ManualBooking;
use App\Models\DispatchLog;
use App\Models\Driver;
use App\Models\Order;
use App\Models\Ride;
use App\Models\DeliveryOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DispatchController extends Controller
{
    /**
     * Get dispatch dashboard stats
     */
    public function getStats()
    {
        // Active Rides count
        $activeRides = Ride::whereIn('status', ['pending', 'accepted', 'in_progress'])->count();
        
        // Active Deliveries (from delivery_orders if exists)
        $activeDeliveries = 0;
        if (class_exists(DeliveryOrder::class)) {
            $activeDeliveries = DeliveryOrder::whereIn('status', ['preparing', 'on_the_way'])->count();
        }
        
        // Active Couriers (from orders table)
        $activeCouriers = Order::whereIn('status', ['Pending', 'In Transit'])->count();
        
        // Online Drivers
        $onlineDrivers = Driver::where('status', 'active')->count();
        
        // Pending Assignment
        $pendingAssignment = 0;
        $pendingAssignment += Ride::where('status', 'pending')->whereNull('driver_id')->count();
        $pendingAssignment += Order::where('status', 'Pending')->count();
        $pendingAssignment += ManualBooking::where('status', 'pending')->count();
        if (class_exists(DeliveryOrder::class)) {
            $pendingAssignment += DeliveryOrder::where('status', 'preparing')->whereNull('driver_id')->count();
        }

        return response()->json([
            'status' => true,
            'message' => 'Dispatch stats fetched successfully',
            'data' => [
                'active_rides' => $activeRides,
                'active_deliveries' => $activeDeliveries,
                'active_couriers' => $activeCouriers,
                'online_drivers' => $onlineDrivers,
                'pending_assignment' => $pendingAssignment,
                'trends' => [
                    'rides_trend' => '+12',
                    'deliveries_trend' => '+8',
                    'couriers_trend' => '+3',
                    'drivers_trend' => '+24',
                    'pending_trend' => '-5'
                ],
                'zone_stats' => [
                    'North' => Driver::where('status', 'active')->where('location', 'like', '%North%')->count(),
                    'South' => Driver::where('status', 'active')->where('location', 'like', '%South%')->count(),
                    'East' => Driver::where('status', 'active')->where('location', 'like', '%East%')->count(),
                    'West' => Driver::where('status', 'active')->where('location', 'like', '%West%')->count(),
                    'Central' => Driver::where('status', 'active')->where('location', 'like', '%Central%')->count(),
                ]
            ]
        ]);
    }

    /**
     * Get pending orders for dispatch
     */
    public function getPendingOrders()
    {
        $pendingOrders = collect();

        // Get pending rides
        $rides = Ride::where('status', 'pending')
            ->whereNull('driver_id')
            ->latest()
            ->get()
            ->map(function ($ride) {
                return [
                    'id' => $ride->id,
                    'order_id' => $ride->ride_custom_id ?? 'R-' . str_pad($ride->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'Ride',
                    'status' => 'Waiting for driver',
                    'created_at' => $ride->created_at,
                    'time_ago' => $ride->created_at->diffForHumans(null, true) . ' ago',
                    'pickup' => $ride->pickup_address ?? 'N/A',
                    'dropoff' => $ride->dropoff_address ?? 'N/A',
                    'source_type' => 'ride',
                    'source_id' => $ride->id
                ];
            });
        $pendingOrders = $pendingOrders->merge($rides);

        // Get pending courier orders
        $courierOrders = Order::where('status', 'Pending')
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_id' => $order->order_id ?? 'C-' . str_pad($order->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'Courier',
                    'status' => 'Waiting for driver',
                    'created_at' => $order->created_at,
                    'time_ago' => $order->created_at->diffForHumans(null, true) . ' ago',
                    'pickup' => $order->pickup_address ?? 'N/A',
                    'dropoff' => $order->delivery_address ?? 'N/A',
                    'source_type' => 'courier',
                    'source_id' => $order->id
                ];
            });
        $pendingOrders = $pendingOrders->merge($courierOrders);

        // Get pending delivery orders
        if (class_exists(DeliveryOrder::class)) {
            $deliveryOrders = DeliveryOrder::where('status', 'preparing')
                ->whereNull('driver_id')
                ->latest()
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_id' => $order->order_code ?? 'D-' . str_pad($order->id, 5, '0', STR_PAD_LEFT),
                        'type' => 'Delivery',
                        'status' => 'Waiting for driver',
                        'created_at' => $order->created_at,
                        'time_ago' => $order->created_at->diffForHumans(null, true) . ' ago',
                        'pickup' => $order->pickup_address ?? 'N/A',
                        'dropoff' => $order->delivery_address ?? 'N/A',
                        'source_type' => 'delivery',
                        'source_id' => $order->id
                    ];
                });
            $pendingOrders = $pendingOrders->merge($deliveryOrders);
        }

        // Get pending manual bookings
        $manualBookings = ManualBooking::where('status', 'pending')
            ->latest()
            ->get()
            ->map(function ($booking) {
                $typeLabel = ucfirst($booking->type);
                return [
                    'id' => $booking->id,
                    'order_id' => $booking->booking_id,
                    'type' => $typeLabel,
                    'status' => 'Waiting for driver',
                    'created_at' => $booking->created_at,
                    'time_ago' => $booking->created_at->diffForHumans(null, true) . ' ago',
                    'pickup' => $booking->pickup_address,
                    'dropoff' => $booking->dropoff_address,
                    'source_type' => 'manual_booking',
                    'source_id' => $booking->id
                ];
            });
        $pendingOrders = $pendingOrders->merge($manualBookings);

        // Sort by created_at descending
        $sortedOrders = $pendingOrders->sortByDesc('created_at')->values();

        return response()->json([
            'status' => true,
            'message' => 'Pending orders fetched successfully',
            'data' => $sortedOrders
        ]);
    }

    /**
     * Get available drivers for assignment
     */
    public function getAvailableDrivers()
    {
        $drivers = Driver::where('status', 'active')
            ->with('type')
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'name' => $driver->name,
                    'phone' => $driver->phone,
                    'vehicle_type' => $driver->type?->type_name ?? 'N/A',
                    'service_type' => $driver->type?->service_type ?? 'ride',
                    'rating' => $driver->rating ?? 4.5,
                    'location' => $driver->location,
                    'trips_count' => $driver->rides()->count() + $driver->deliveryOrders()->count(),
                    'photo' => $driver->image ? "/storage/" . $driver->image : null,
                ];
            });

        return response()->json([
            'status' => true,
            'message' => 'Available drivers fetched successfully',
            'data' => $drivers
        ]);
    }

    /**
     * Assign driver to an order
     */
    public function assignDriver(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_type' => 'required|in:ride,courier,delivery,manual_booking',
            'order_id' => 'required|integer',
            'driver_id' => 'required|exists:drivers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $driver = Driver::find($request->driver_id);
        if (!$driver) {
            return response()->json(['status' => false, 'message' => 'Driver not found'], 404);
        }

        DB::beginTransaction();
        try {
            switch ($request->order_type) {
                case 'ride':
                    $order = Ride::find($request->order_id);
                    if ($order) {
                        $order->driver_id = $request->driver_id;
                        $order->status = 'accepted';
                        $order->save();
                    }
                    break;

                case 'courier':
                    $order = Order::find($request->order_id);
                    if ($order) {
                        $order->courier = $driver->name;
                        $order->status = 'In Transit';
                        $order->save();
                    }
                    break;

                case 'delivery':
                    $order = DeliveryOrder::find($request->order_id);
                    if ($order) {
                        $order->driver_id = $request->driver_id;
                        $order->status = 'on_the_way';
                        $order->save();
                    }
                    break;

                case 'manual_booking':
                    $order = ManualBooking::find($request->order_id);
                    if ($order) {
                        $order->assigned_driver_id = $request->driver_id;
                        $order->status = 'assigned';
                        $order->assigned_at = now();
                        $order->save();
                    }
                    break;
            }

            // Log the dispatch action
            DispatchLog::create([
                'order_type' => $request->order_type,
                'order_id' => $request->order_id,
                'driver_id' => $request->driver_id,
                'dispatcher_id' => auth()->id(),
                'action' => 'assigned'
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Driver assigned successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to assign driver',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create manual booking
     */
    public function createManualBooking(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:ride,delivery,courier',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'pickup_address' => 'required|string',
            'dropoff_address' => 'required|string',
            'fare' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'scheduled_at' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $booking = ManualBooking::create([
            'booking_id' => 'MB-' . strtoupper(Str::random(6)),
            'type' => $request->type,
            'customer_name' => $request->customer_name,
            'customer_phone' => $request->customer_phone,
            'pickup_address' => $request->pickup_address,
            'dropoff_address' => $request->dropoff_address,
            'fare' => $request->fare,
            'notes' => $request->notes,
            'scheduled_at' => $request->scheduled_at,
            'status' => 'pending'
        ]);

        // Log the dispatch action
        DispatchLog::create([
            'order_type' => 'manual_booking',
            'order_id' => $booking->id,
            'dispatcher_id' => auth()->id(),
            'action' => 'created'
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Manual booking created successfully',
            'data' => $booking
        ]);
    }

    /**
     * Get all manual bookings
     */
    /**
     * Get all active (in-progress) orders for live tracking
     */
    public function getActiveOrders()
    {
        $activeOrders = collect();

        // Active Rides
        $rides = Ride::whereIn('status', ['accepted', 'in_progress'])
            ->with(['driver', 'user'])
            ->latest()
            ->get()
            ->map(function ($ride) {
                return [
                    'id' => $ride->id,
                    'order_id' => $ride->ride_custom_id ?? 'RID-' . str_pad($ride->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'Ride',
                    'driver' => $ride->driver?->name ?? 'Unassigned',
                    'status' => $ride->status === 'accepted' ? 'En Route to Pickup' : 'In Trip',
                    'eta' => 'Dynamic', // Would need real-time logic
                    'dist' => 'Dynamic',
                    'dur' => 'Dynamic',
                    'fare' => '$' . number_format($ride->total_fare, 2),
                ];
            });
        $activeOrders = $activeOrders->merge($rides);

        // Active Courier Orders
        $couriers = Order::whereIn('status', ['In Transit'])
            ->with(['driver', 'user'])
            ->latest()
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_id' => 'PKG-' . str_pad($order->id, 5, '0', STR_PAD_LEFT),
                    'type' => 'Courier',
                    'driver' => $order->driver?->name ?? 'Unassigned',
                    'status' => 'In Transit',
                    'eta' => 'Dynamic',
                    'dist' => 'Dynamic',
                    'dur' => 'Dynamic',
                    'fare' => '$' . number_format($order->price, 2),
                ];
            });
        $activeOrders = $activeOrders->merge($couriers);

        // Active Delivery Orders (Legacy/Other table if exists)
        if (class_exists(DeliveryOrder::class)) {
            $deliveries = DeliveryOrder::whereIn('status', ['accepted', 'preparing', 'on_the_way'])
                ->with(['driver'])
                ->latest()
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_id' => 'DEL-' . str_pad($order->id, 5, '0', STR_PAD_LEFT),
                        'type' => 'Delivery',
                        'driver' => $order->driver?->name ?? 'Unassigned',
                        'status' => $order->status === 'on_the_way' ? 'Delivering' : 'At Vendor',
                        'eta' => 'Dynamic',
                        'dist' => 'Dynamic',
                        'dur' => 'Dynamic',
                        'fare' => '$' . number_format($order->total_price, 2),
                    ];
                });
            $activeOrders = $activeOrders->merge($deliveries);
        }

        return response()->json([
            'status' => true,
            'message' => 'Active orders fetched successfully',
            'data' => $activeOrders
        ]);
    }

    public function getManualBookings(Request $request)
    {
        $query = ManualBooking::with('driver')->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->paginate(20);

        return response()->json([
            'status' => true,
            'message' => 'Manual bookings fetched successfully',
            'data' => $bookings
        ]);
    }
}
