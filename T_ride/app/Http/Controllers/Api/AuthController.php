<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use App\Models\User;
use App\Models\Otp;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name'         => 'required|string',
            'email'        => 'required|email|unique:users',
            'phone_number' => 'required|unique:users',
            'password'     => 'required|min:6',
        ]);

        $user = User::create([
            'name'         => $request->name,
            'email'        => $request->email,
            'phone_number' => $request->phone_number,
            'password'     => bcrypt($request->password),
        ]);

        $roleName = $request->input('role', 'admin');
        $role = Role::where('name', $roleName)->where('guard_name', 'api')->first();

        if (!$role) {
            $role = Role::create(['name' => $roleName, 'guard_name' => 'api']);
        }

        $user->assignRole($role);

        $token = $user->createToken('register_token')->accessToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data'    => [
                'token' => $token,
                'user'  => $user
            ]
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Allow admin and vendor roles to login
        if (!$user->hasRole('admin') && !$user->hasRole('vendor')) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Only administrators and vendors can login.'
            ], 403);
        }

        /* OTP Logic Commented Out
        Otp::where('identifier', $request->identifier)->delete();

        $otpCode = rand(100000, 999999);

        Otp::create([
            'identifier' => $request->identifier,
            'otp'        => $otpCode,
            'expires_at' => now()->addMinutes(5)
        ]);

        if (filter_var($request->identifier, FILTER_VALIDATE_EMAIL)) {
            Mail::to($request->identifier)->send(new OtpMail($otpCode));
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully. Please check your email.',
        ], 200);
        */

        // Direct Login Logic
        $token = $user->createToken('login_token')->accessToken;

        // Get user roles for frontend redirection
        $roles = $user->roles->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user'  => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'roles' => $roles
                ]
            ]
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'otp'        => 'required'
        ]);

        $otp = Otp::where('identifier', $request->identifier)
            ->where('otp', $request->otp)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP'
            ], 401);
        }

        $otp->update(['is_used' => true]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        // Allow admin and vendor roles
        if (!$user || (!$user->hasRole('admin') && !$user->hasRole('vendor'))) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.'
            ], 403);
        }

        $token = $user->createToken('login_token')->accessToken;

        // Get user roles for frontend redirection
        $roles = $user->roles->map(function($role) {
            return [
                'id' => $role->id,
                'name' => $role->name
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'user'  => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone_number' => $user->phone_number,
                    'roles' => $roles
                ]
            ]
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ], 200);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => true, // Keep true to prevent enumeration, or false if you prefer explicit error
                'message' => 'If your email exists in our system, you will receive a password reset link.'
            ], 200);
        }

        // Generate OTP/Token
        $otpCode = rand(100000, 999999);

        // Delete old OTPs
        Otp::where('identifier', $request->email)->delete();

        Otp::create([
            'identifier' => $request->email,
            'otp'        => $otpCode,
            'expires_at' => now()->addMinutes(15)
        ]);

        // Send Email
        Mail::to($request->email)->send(new OtpMail($otpCode));

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully to your email.'
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required',
            'password' => 'required|min:6|confirmed'
        ]);

        $otp = Otp::where('identifier', $request->email)
            ->where('otp', $request->otp)
            ->where('is_used', false)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP'
            ], 400); // Bad Request
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        $user->password = bcrypt($request->password);
        $user->save();

        $otp->update(['is_used' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. You can now login.'
        ], 200);
    }
}
