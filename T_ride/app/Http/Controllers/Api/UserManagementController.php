<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class UserManagementController extends Controller
{
    /**
     * 1. GET ALL USERS (Stats Cards + Table)
     */
    public function index(Request $request)
    {
        // Top Cards Stats
        $stats = [
            'total_users'    => User::count(),
            'active_users'   => User::where('status', 'active')->count(),
            'suspended'      => User::where('status', 'suspended')->count(),
            'pending'        => User::where('status', 'pending')->count(),
            'new_today'      => User::whereDate('created_at', Carbon::today())->count(),
        ];

        // Table Query
        $query = User::query()->withCount('rides');

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

    return response()->json([
        'status' => true,
        'message' => 'User created successfully',
        'data' => $user
    ], 201);
}


    /**
     * 3. SHOW SINGLE USER
     */
    public function show($id)
    {
        $user = User::find($id);

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
    ]);

    if ($validator->fails()) {
        return response()->json(['status' => false, 'errors' => $validator->errors()], 422);
    }

    $data = $request->except(['password', 'photo']);

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

    return response()->json([
        'status' => true,
        'message' => 'User updated successfully',
        'data' => $user
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
     * 6. TOGGLE STATUS (Suspend/Active)
     */
    public function toggleStatus($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['status' => false, 'message' => 'User not found'], 404);
        }

        // Toggle only between active & suspended
        if ($user->status === 'active') {
            $user->status = 'suspended';
        } elseif ($user->status === 'suspended') {
            $user->status = 'active';
        }

        $user->save();

        return response()->json([
            'status' => true,
            'message' => "User status updated to {$user->status}",
            'new_status' => $user->status
        ]);
    }
}
