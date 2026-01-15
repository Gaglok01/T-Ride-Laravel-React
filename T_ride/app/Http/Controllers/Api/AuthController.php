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
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required'
        ]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

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

        if (preg_match('/^\+?[1-9]\d{7,14}$/', $request->identifier)) {

            // $twilio = new Client(
            //     config('services.twilio.sid'),
            //     config('services.twilio.token')
            // );

            // $twilio->messages->create(
            //     $request->identifier,
            //     [
            //         'from' => config('services.twilio.from'),
            //         'body' => "Your login OTP is {$otpCode}"
            //     ]
            // );
        }

        return response()->json([
            'message' => 'OTP sent successfully'
        ]);
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
            return response()->json(['message' => 'Invalid or expired OTP'], 401);
        }

        $otp->update(['is_used' => true]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->first();

        $token = $user->createToken('login_token')->accessToken;

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
