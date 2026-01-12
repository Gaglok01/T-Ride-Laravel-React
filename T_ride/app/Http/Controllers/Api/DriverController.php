<?php
namespace App\Http\Controllers\Api;

use Exception;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    // 🔹 LIST
    public function index()
    {
        try {
            $drivers = Driver::with(['type', 'user'])->latest()->get();

            return response()->json([
                'success' => true,
                'data' => $drivers
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // 🔹 STORE
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'type_id' => 'required|exists:types,id',
            'phone_number' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'image' => 'nullable|image|max:2048'
        ]);

        DB::beginTransaction();

        try {
            // Driver ID generate
            $last = Driver::latest('id')->first();
            $number = $last ? intval(substr($last->driver_id, 4)) + 1 : 1;
            $driverId = 'DRV-' . str_pad($number, 2, '0', STR_PAD_LEFT);

            // Image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('drivers', 'public');
            }

            // ✅ Driver create
            $driver = Driver::create([
                'driver_id' => $driverId,
                'name' => $request->name,
                'type_id' => $request->type_id,
                'vehicle_model' => $request->vehicle_model,
                'trips' => 0,
                'rating' => 0,
                'status' => 'Active',
                // cast to array since model expects array
                'documents' => $request->documents ? [$request->documents] : [],
                'image' => $imagePath,
            ]);

            // ✅ User create
            $user = User::create([
                'name' => $driver->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone_number' => $request->phone_number,
                'driver_id' => $driver->id,
            ]);

            // Assign role using Spatie
            $user->assignRole('driver');

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Driver & User created successfully',
                'data' => [
                    'driver' => $driver->load('type'),
                    'user' => $user
                ]
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error("Driver Create Error: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create driver: ' . $e->getMessage()
            ], 500);
        }
    }


    // 🔹 SHOW
    public function show($id)
    {
        try {
            $driver = Driver::with('type')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $driver
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Driver not found'
            ], 404);
        }
    }

    // 🔹 UPDATE (IMAGE CHANGE SUPPORTED)
public function update(Request $request, $id)
{
    $user = User::where('driver_id', $id)->first();

    $request->validate([
        'name' => 'required|string',
        'type_id' => 'required|exists:types,id',
        'email' => 'required|email|unique:users,email,' . ($user->id ?? 'NULL'),
        'phone_number' => 'required|string',
        'password' => 'nullable|min:6',
        'image' => 'nullable|image|max:2048'
    ]);

    DB::beginTransaction();

    try {
        $driver = Driver::findOrFail($id);

        // 🔹 Image update
        if ($request->hasFile('image')) {
            if ($driver->image && Storage::disk('public')->exists($driver->image)) {
                Storage::disk('public')->delete($driver->image);
            }
            $driver->image = $request->file('image')->store('drivers', 'public');
        }

        // 🔹 Driver update
        $driver->update([
            'name' => $request->name,
            'type_id' => $request->type_id,
            'vehicle_model' => $request->vehicle_model,
            'status' => $request->input('status', $driver->status),
            'documents' => $request->documents ? [$request->documents] : $driver->documents,
        ]);

        // 🔹 User update
        if ($user) {
            $userData = [
                'name' => $request->name,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
            ];

            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }

            $user->update($userData);
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Driver & User updated successfully',
            'data' => $driver->load('type')
        ]);

    } catch (Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}


    // 🔹 DELETE
public function destroy($id)
{
    DB::beginTransaction();

    try {
        $driver = Driver::findOrFail($id);

        // 🔹 Delete related user
        $user = User::where('driver_id', $driver->id)->first();
        if ($user) {
            $user->delete();
        }

        // 🔹 Delete driver image
        if ($driver->image && Storage::disk('public')->exists($driver->image)) {
            Storage::disk('public')->delete($driver->image);
        }

        // 🔹 Delete driver
        $driver->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Driver & related user deleted successfully'
        ]);

    } catch (Exception $e) {
        DB::rollBack();

        return response()->json([
            'success' => false,
            'message' => 'Driver not found'
        ], 404);
    }
}

}