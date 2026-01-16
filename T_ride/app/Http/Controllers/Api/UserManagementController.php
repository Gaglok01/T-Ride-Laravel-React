<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    /**
     * 1. GET ALL USERS (Stats Cards + Table)
     */
    public function index(Request $request)
    {
        // Top Cards Stats
        $stats = [
            'total_users'    => User::role(['rider', 'customer'])->count(),
            'active_users'   => User::role(['rider', 'customer'])->where('status', 'active')->count(),
            'suspended'      => User::role(['rider', 'customer'])->where('status', 'suspended')->count(),
            'pending'        => User::role(['rider', 'customer'])->where('status', 'pending')->count(),
            'new_today'      => User::role(['rider', 'customer'])->whereDate('created_at', Carbon::today())->count(),
        ];

        $query = User::with('roles');
        
        $query->whereHas('roles', function($q) {
            $q->whereIn('name', ['rider', 'customer']);
        });

        // Search Logic
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Filter Logic (Status)
        if ($request->has('status') && $request->status != 'All') {
            $query->where('status', $request->status);
        }

        // Filter Logic (Role) - from Tabs
        if ($request->has('role') && $request->role != 'All Users') {
             // If selected "Rider" or "Customer"
             $roleName = strtolower($request->role);
             $query->role($roleName);
        }

        // Check for export (all records)
        if ($request->has('all')) {
            $users = $query->orderBy('created_at', 'desc')->get();
            return response()->json([
                'status' => true,
                'data' => $users
            ]);
        }

        // Pagination
        $users = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json([
            'status' => true,
            'data' => [
                'stats' => $stats,
                'users' => $users
            ]
        ]);
    }

    /**
     * 2. CREATE USER
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255',
            'email'          => 'required|email|unique:users,email',
            'phone_number'   => 'required|string|unique:users,phone_number',
            'password'       => 'required|string|min:6',
            'status'         => 'required|in:active,suspended,inactive',
            'wallet_balance' => 'nullable|numeric|min:0',
            'photo'          => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'role'           => 'required|in:rider,customer', // User must select a role
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only([
            'name',
            'email',
            'phone_number',
            'status',
            'wallet_balance',
        ]);

        $data['password'] = Hash::make($request->password);
        $data['wallet_balance'] = $request->wallet_balance ?? 0.00;

        if ($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('users', 'public');
        }

        $user = User::create($data);

        // Ensure 'customer' role exists
        if ($request->role === 'customer') {
            Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
        }
        
        $user->assignRole($request->role);

        return response()->json([
            'status' => true,
            'message' => 'User created successfully',
            'data' => $user->load('roles')
        ], 201);
    }


    /**
     * 3. SHOW SINGLE USER
     */
    public function show($id)
    {
        $user = User::with('roles')->find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found'], 404);
        }

        return response()->json([
            'status' => true,
            'user' => $user
        ]);
    }

    /**
     * 4. UPDATE USER
     */
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'           => 'sometimes|string|max:255',
            'email'          => 'sometimes|email|unique:users,email,' . $id,
            'phone_number'   => 'sometimes|string|unique:users,phone_number,' . $id,
            'password'       => 'nullable|string|min:6',
            'status'         => 'sometimes|in:active,suspended,inactive',
            'wallet_balance' => 'sometimes|numeric|min:0',
            'photo'          => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'role'           => 'sometimes|in:rider,customer',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $request->except(['password', 'photo', 'role']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $data['photo'] = $request->file('photo')->store('users', 'public');
        }

        $user->update($data);

        if ($request->has('role')) {
             if ($request->role === 'customer') {
                Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'api']);
            }
            $user->syncRoles([$request->role]);
        }

        return response()->json([
            'status' => true,
            'message' => 'User updated successfully',
            'data' => $user->load('roles')
        ]);
    }


    /**
     * 5. DELETE USER
     */
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found'], 404);
        }

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();

        return response()->json([
            'status' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * 6. UPDATE STATUS (Specific)
     */
    public function toggleStatus(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found'], 404);
        }

        // If status is provided in request, use it. Otherwise toggle (fallback)
        if ($request->has('status')) {
             $user->status = $request->status;
        } else {
            // Toggle only between active & suspended
            if ($user->status === 'active') {
                $user->status = 'suspended';
            } elseif ($user->status === 'suspended') {
                $user->status = 'active';
            }
        }

        $user->save();

        return response()->json([
            'status' => true,
            'message' => "User status updated to {$user->status}",
            'new_status' => $user->status
        ]);
    }
}
