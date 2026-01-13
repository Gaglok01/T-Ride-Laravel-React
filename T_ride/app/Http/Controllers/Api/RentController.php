<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\VehicleMaintenance;
use App\Models\Rental;
use App\Models\RentPayment;

class RentController extends Controller
{
    public function vehicleIndex(Request $request)
    {
        $query = Vehicle::with(['activeRental.driver']);

        if ($request->has('search')) {
            $query->where('plate_number', 'like', "%{$request->search}%")
                  ->orWhere('name', 'like', "%{$request->search}%");
        }
        if ($request->has('status') && in_array($request->status, ['available', 'rented', 'maintenance'])) {
            $query->where('status', $request->status);
        }
        $stats = [
            'total_fleet' => Vehicle::count(),
            'rented_out' => Vehicle::where('status', 'rented')->count(),
            'available' => Vehicle::where('status', 'available')->count(),
            'in_maintenance' => Vehicle::where('status', 'maintenance')->count(),
            'monthly_revenue' => 78450
        ];

        return response()->json([
            'status' => true,
            'stats' => $stats,
            'data' => $query->latest()->get()
        ]);
    }

    public function vehicleStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'vin' => 'required|string|unique:vehicles,vin',
            'plate_number' => 'required|string|unique:vehicles,plate_number',
            'type' => 'required|string|max:100',
            'daily_rate' => 'required|numeric|min:0',
            'status' => 'required|in:available,rented,maintenance'
        ]);

        $vehicle = Vehicle::create($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Vehicle added successfully',
            'data' => $vehicle
        ]);
    }

    public function maintenanceIndex(Request $request)
    {
        $query = VehicleMaintenance::with('vehicle');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'status' => true,
            'data' => $query->get()
        ]);
    }

    public function activeRentals(Request $request)
    {
        $rentals = Rental::with(['driver', 'vehicle'])
                    ->where('status', 'active')
                    ->get();

        return response()->json([
            'status' => true,
            'message' => 'Active rentals fetched',
            'data' => $rentals
        ]);
    }

    public function allContracts(Request $request)
    {
        $query = Rental::with(['driver', 'vehicle']);
        
        if ($request->has('search')) {
            $query->where('contract_id', 'like', "%{$request->search}%");
        }

        return response()->json([
            'status' => true,
            'data' => $query->latest()->get()
        ]);
    }

    public function payments(Request $request)
    {
        $query = RentPayment::with(['rental.driver', 'rental.vehicle']);
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        $stats = [
            'total_collected' => RentPayment::where('status', 'paid')->sum('amount'),
            'pending' => RentPayment::where('status', 'pending')->sum('amount'),
            'overdue' => RentPayment::where('status', 'overdue')->sum('amount'),
            'this_week' => 18900
        ];

        return response()->json([
            'status' => true,
            'stats' => $stats,
            'data' => $query->latest()->get()
        ]);
    }
}
