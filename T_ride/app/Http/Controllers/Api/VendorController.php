<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::with(['category', 'user']);
        if ($request->has('category_id') && $request->category_id != null) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->has('status') && $request->status != null) {
            $query->where('status', $request->status);
        }
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        $vendors = $query->latest()->get(); 

        return response()->json([
            'status' => true,
            'message' => 'Vendors fetched successfully',
            'data' => $vendors
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone_number' => 'required|string|max:20|unique:users,phone_number',
            'address' => 'required|string|max:255',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'logo' => 'nullable|file|image|max:2048', 
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create user for vendor login
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone_number' => $request->phone_number,
                'status' => 1
            ]);

            // Assign vendor role safely
            $role = Role::where('name', 'vendor')->where('guard_name', 'api')->first();
            if (!$role) {
                $role = Role::create(['name' => 'vendor', 'guard_name' => 'api']);
            }
            $user->assignRole($role);

            $logo = null;
            if ($request->hasFile('logo')) {
                $logo = $request->file('logo')->store('vendors', 'public');
            }

            $vendor = Vendor::create([
                'user_id' => $user->id,
                'category_id' => $request->category_id,
                'name' => $request->name,
                'address' => $request->address,
                'logo' => $logo,
                'commission_rate' => $request->commission_rate,
                'status' => 1,
                'is_open' => true,
                'total_orders' => 0,
                'total_revenue' => 0.00,
                'rating' => 0.0
            ]);

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Vendor created successfully',
                'data' => $vendor->load('user')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Failed to create vendor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $vendor = Vendor::with(['category', 'user', 'products'])->find($id);

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        return response()->json([
            'status' => true,
            'message' => 'Vendor details fetched',
            'data' => $vendor
        ]);
    }

    public function update(Request $request, $id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'exists:categories,id',
            'name' => 'string|max:255',
            'commission_rate' => 'numeric',
            'status' => 'integer',
            'is_open' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation Error',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($request->hasFile('logo')) {
            if ($vendor->logo) {
                Storage::disk('public')->delete($vendor->logo);
            }
            $logo = $request->file('logo')->store('vendors', 'public');
            $vendor->logo = $logo;
        }

        $vendor->category_id = $request->category_id ?? $vendor->category_id;
        $vendor->name = $request->name ?? $vendor->name;
        $vendor->commission_rate = $request->commission_rate ?? $vendor->commission_rate;
        $vendor->status = $request->status ?? $vendor->status;
        $vendor->is_open = $request->is_open ?? $vendor->is_open;
        $vendor->save();

        return response()->json([
            'status' => true,
            'message' => 'Vendor updated successfully',
            'data' => $vendor
        ]);
    }

    public function toggleStatus($id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        $vendor->is_open = !$vendor->is_open;
        $vendor->save();

        return response()->json([
            'status' => true, 
            'message' => 'Vendor status changed successfully', 
            'data' => $vendor
        ]);
    }

    public function destroy($id)
    {
        $vendor = Vendor::find($id);

        if (!$vendor) {
            return response()->json(['status' => false, 'message' => 'Vendor not found'], 404);
        }

        if ($vendor->logo) {
            Storage::disk('public')->delete($vendor->logo);
        }
        $vendor->delete();

        return response()->json([
            'status' => true, 
            'message' => 'Vendor deleted successfully'
        ]);
    }
}