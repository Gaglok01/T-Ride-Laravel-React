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
            'data' => $query->latest()->paginate(10)
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
    public function vehicleUpdate(Request $request, $id)
    {
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return response()->json(['status' => false, 'message' => 'Vehicle not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:' . date('Y'),
            'vin' => 'required|string|unique:vehicles,vin,' . $id,
            'plate_number' => 'required|string|unique:vehicles,plate_number,' . $id,
            'type' => 'required|string|max:100',
            'daily_rate' => 'required|numeric|min:0',
            'status' => 'required|in:available,rented,maintenance'
        ]);

        $vehicle->update($request->all());

        return response()->json([
            'status' => true,
            'message' => 'Vehicle updated successfully',
            'data' => $vehicle
        ]);
    }

    public function vehicleUpdateStatus(Request $request, $id)
    {
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return response()->json(['status' => false, 'message' => 'Vehicle not found'], 404);
        }

        $request->validate([
            'status' => 'required|in:available,rented,maintenance'
        ]);

        $vehicle->status = $request->status;
        $vehicle->save();

        return response()->json([
            'status' => true,
            'message' => 'Vehicle status updated successfully'
        ]);
    }

    public function vehicleDestroy($id)
    {
        $vehicle = Vehicle::find($id);
        if (!$vehicle) {
            return response()->json(['status' => false, 'message' => 'Vehicle not found'], 404);
        }

        // Optional: Check if vehicle has active rentals or can be deleted safely
        if ($vehicle->activeRental || $vehicle->rentals()->exists()) {
             return response()->json(['status' => false, 'message' => 'Cannot delete vehicle with rental history.'], 400);
        }

        $vehicle->delete();

        return response()->json([
            'status' => true,
            'message' => 'Vehicle deleted successfully'
        ]);
    }
    public function vehicleShow($id)
    {
        $vehicle = Vehicle::with(['activeRental.driver', 'rentals.driver', 'maintenances'])->find($id);

        if (!$vehicle) {
            return response()->json(['status' => false, 'message' => 'Vehicle not found'], 404);
        }

        // Prepare history data
        $rentalHistory = $vehicle->rentals->map(function($rental) {
            return [
                'id' => $rental->id,
                'driver' => $rental->driver,
                'start_date' => $rental->start_date,
                'end_date' => $rental->end_date,
                'status' => $rental->status,
                'amount' => $rental->weekly_rate // using weekly rate as proxy for amount display
            ];
        });

        // Prepare response
        $data = $vehicle->toArray();
        $data['rental_history'] = $rentalHistory;
        $data['maintenance_history'] = $vehicle->maintenances;
        
        // Stats calculation
        $data['stats'] = [
            'total_earnings' => $vehicle->rentals->sum('weekly_rate'), // Approx
            'total_maintenance_cost' => $vehicle->maintenances->sum('cost'),
            'total_trips' => $vehicle->rentals->count()
        ];

        return response()->json([
            'status' => true,
            'data' => $data
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
            'data' => $query->paginate(10)
        ]);
    }

    public function activeRentals(Request $request)
    {
        $rentals = Rental::with(['driver', 'vehicle'])
                    ->where('status', 'active')
                    ->paginate(10);

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
            'data' => $query->latest()->paginate(10)
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
            'data' => $query->latest()->paginate(10)
        ]);
    }
}
