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
use Spatie\Permission\Models\Role;
use App\Services\BackgroundCheckService;

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
            'image' => 'nullable|image|max:2048',
            'cnic' => 'nullable|string',
            'license_number' => 'nullable|string',
            'location' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        // 🔹 At least one of CNIC or License is required
        if (!$request->cnic && !$request->license_number) {
            return response()->json([
                'success' => false,
                'message' => 'Either CNIC or License Number is required. Please provide at least one.'
            ], 422);
        }

        // 🔹 Validate CNIC format if provided
        if ($request->cnic && !BackgroundCheckService::validateCnic($request->cnic)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid CNIC format. CNIC must be 13 digits (e.g., 12345-1234567-1).'
            ], 422);
        }

        // 🔹 Validate License format if provided
        if ($request->license_number && !BackgroundCheckService::validateLicense($request->license_number)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid License Number format. Must be at least 5 alphanumeric characters.'
            ], 422);
        }

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
                'cnic' => $request->cnic,
                'license_number' => $request->license_number,
                'trips' => 0,
                'rating' => 0,
                'status' => 'Active',
                'background_check_status' => 'not_checked',
                // cast to array since model expects array
                'documents' => $request->documents ? [$request->documents] : [],
                'image' => $imagePath,
                'location' => $request->location,
            ]);

            // ✅ User create
            $user = User::create([
                'name' => $driver->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone_number' => $request->phone_number,
                'driver_id' => $driver->id,
                'lat' => $request->lat,
                'lng' => $request->lng,
            ]);

            // Assign role using Spatie with api guard
            $role = Role::where('name', 'driver')->where('guard_name', 'api')->first();

            $user->assignRole($role);

            // 🔹 Run Background Check via BackgroundChecks.com API
            $bgService = new BackgroundCheckService();
            $includeMvr = !empty($request->license_number); // Include MVR check if license provided

            $bgResult = $bgService->createOrder($request->email, 'HIRE1', $includeMvr);

            if ($bgResult['success'] && isset($bgResult['report_key'])) {
                $driver->update([
                    'background_check_status' => 'pending',
                    'background_report_key' => $bgResult['report_key'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Driver & User created successfully. Background check initiated.',
                'data' => [
                    'driver' => $driver->load('type'),
                    'user' => $user,
                    'background_check' => [
                        'status' => $bgResult['success'] ? 'initiated' : 'failed_to_initiate',
                        'message' => $bgResult['success']
                            ? 'Background check order created successfully.'
                            : ($bgResult['message'] ?? 'Could not initiate background check. You can retry later.'),
                    ]
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
            $driver = Driver::with(['type', 'user'])->findOrFail($id);

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
            'name' => 'sometimes|string',
            'type_id' => 'sometimes|exists:types,id',
            'email' => 'sometimes|email|unique:users,email,' . ($user->id ?? 'NULL'),
            'phone_number' => 'sometimes|string',
            'password' => 'nullable|min:6',
            'image' => 'nullable|image|max:2048',
            'status' => 'sometimes|in:Active,Inactive',
            'cnic' => 'nullable|string',
            'license_number' => 'nullable|string',
            'location' => 'nullable|string',
            'lat' => 'nullable|numeric',
            'lng' => 'nullable|numeric',
        ]);

        // 🔹 At least one of CNIC or License is required
        $cnic = $request->cnic;
        $licenseNumber = $request->license_number;

        // Check: if both are empty/null, reject
        if (!$cnic && !$licenseNumber) {
            // Check if existing driver has values
            $existingDriver = Driver::findOrFail($id);
            if (!$existingDriver->cnic && !$existingDriver->license_number) {
                return response()->json([
                    'success' => false,
                    'message' => 'Either CNIC or License Number is required. Please provide at least one.'
                ], 422);
            }
        }

        // 🔹 Validate CNIC format if provided
        if ($cnic && !BackgroundCheckService::validateCnic($cnic)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid CNIC format. CNIC must be 13 digits (e.g., 12345-1234567-1).'
            ], 422);
        }

        // 🔹 Validate License format if provided
        if ($licenseNumber && !BackgroundCheckService::validateLicense($licenseNumber)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid License Number format. Must be at least 5 alphanumeric characters.'
            ], 422);
        }

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

            // Check if CNIC or License changed - need to re-run background check
            $cnicChanged = $cnic && $cnic !== $driver->cnic;
            $licenseChanged = $licenseNumber && $licenseNumber !== $driver->license_number;

            // 🔹 Driver update
            $driver->update([
                'name' => $request->name ?? $driver->name,
                'type_id' => $request->type_id ?? $driver->type_id,
                'vehicle_model' => $request->vehicle_model ?? $driver->vehicle_model,
                'cnic' => $request->cnic ?? $driver->cnic,
                'status' => $request->status ?? $driver->status,
                'license_number' => $request->license_number ?? $driver->license_number,
                'documents' => $request->documents ? [$request->documents] : $driver->documents,
                'location' => $request->location ?? $driver->location,
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

                if ($request->filled('lat')) {
                    $userData['lat'] = $request->lat;
                }
                if ($request->filled('lng')) {
                    $userData['lng'] = $request->lng;
                }

                $user->update($userData);
            }

            // 🔹 Re-run Background Check if CNIC or License changed
            if ($cnicChanged || $licenseChanged) {
                $bgService = new BackgroundCheckService();
                $email = $request->email ?? $user->email ?? '';
                $includeMvr = !empty($licenseNumber ?? $driver->license_number);

                $bgResult = $bgService->createOrder($email, 'HIRE1', $includeMvr);

                if ($bgResult['success'] && isset($bgResult['report_key'])) {
                    $driver->update([
                        'background_check_status' => 'pending',
                        'background_report_key' => $bgResult['report_key'],
                    ]);
                }
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

    // 🔹 STATUS UPDATE (TOGGLE)
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Active,Inactive'
        ]);

        try {
            $driver = Driver::findOrFail($id);
            $driver->update([
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Driver status updated successfully',
                'data' => $driver
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update status: ' . $e->getMessage()
            ], 500);
        }
    }

    // 🔹 CHECK BACKGROUND STATUS
    public function checkBackgroundStatus($id)
    {
        try {
            $driver = Driver::findOrFail($id);

            if (!$driver->background_report_key) {
                return response()->json([
                    'success' => false,
                    'message' => 'No background check report found for this driver.'
                ], 404);
            }

            $bgService = new BackgroundCheckService();
            $result = $bgService->checkStatus($driver->background_report_key);

            if ($result['success']) {
                $driver->update([
                    'background_check_status' => $result['status'],
                ]);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'status' => $result['status'],
                        'details' => $result['data'],
                    ]
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Failed to check background status.'
            ], 500);

        } catch (Exception $e) {
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
