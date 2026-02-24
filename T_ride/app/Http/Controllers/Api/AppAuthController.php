<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Otp;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Twilio\Rest\Client;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class AppAuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->identifier)
            ->orWhere('phone_number', $request->identifier)
            ->orWhere('whatsapp_number', $request->identifier)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        return response()->json([
            'status' => true,
            'user' => $user,
            'token' => $user->createToken('MobileApp')->accessToken
        ]);
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'method' => 'required|in:phone,email,whatsapp',
        ]);

        if ($request->input('method') === 'phone') {
            $request->validate([
                'phone_number' => 'required|string|unique:users,phone_number'
            ]);
            $identifier = $request->phone_number;
        }

        if ($request->input('method') === 'email') {
            $request->validate([
                'email' => 'required|email|unique:users,email'
            ]);
            $identifier = $request->email;
        }

        if ($request->input('method') === 'whatsapp') {
            $request->validate([
                'whatsapp_number' => 'required|string|unique:users,whatsapp_number'
            ]);
            $identifier = $request->whatsapp_number;
        }

        $otp = rand(1000, 9999);

        Otp::updateOrCreate(
            ['identifier' => $identifier],
            [
                'method' => $request->input('method'),
                'otp' => $otp,
                'expires_at' => now()->addMinutes(10),
                'is_used' => false
            ]
        );

        // match ($request->input('method')) {
        //     'phone' => $this->sendSms($identifier, $otp),
        //     'whatsapp' => $this->sendWhatsapp($identifier, $otp),
        //     'email' => $this->sendEmail($identifier, $otp),
        // };

        return response()->json([
            'status' => true,
            'message' => 'OTP sent',
            'otp' => $otp,
            'next' => 'verify_otp'
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'otp' => 'required'
        ]);

        $otp = Otp::where('identifier', $request->identifier)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', now())
            ->where('is_used', false)
            ->first();

        if (!$otp) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid or expired OTP'
            ], 422);
        }

        $otp->update(['is_used' => true]);

        return response()->json([
            'status' => true,
            'next' => 'role'
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'identifier' => 'required',
            'name' => 'required|string|max:255',
            'password' => 'required|min:8',
            'role' => 'required|string',
            'language_id' => 'required|exists:languages,id',
            'address' => 'nullable|string',
            'city' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $otp = Otp::where('identifier', $request->identifier)
            ->where('is_used', true)
            ->first();

        if (!$otp) {
            return response()->json([
                'status' => false,
                'message' => 'OTP verification required'
            ], 403);
        }

        $data = [
            'name' => $request->name,
            'password' => Hash::make($request->password),
            'language_id' => $request->language_id,
            'address' => $request->address,
            'city' => $request->city,
            'status' => 'active',
        ];

        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = time() . '.' . $photo->getClientOriginalExtension();
            $photo->move(public_path('uploads/photos'), $photoName);
            $data['photo'] = $photoName;
        }

        if ($otp->method === 'phone') {
            $data['phone_number'] = $otp->identifier;
        }

        if ($otp->method === 'email') {
            $data['email'] = $otp->identifier;
        }

        if ($otp->method === 'whatsapp') {
            $data['whatsapp_number'] = $otp->identifier;
        }

        $user = User::create($data);
        $user->assignRole(Role::findByName($request->role, 'api'));

        return response()->json([
            'status' => true,
            'token' => $user->createToken('MobileApp')->accessToken,
            'next' => 'location'
        ]);
    }

    public function saveLocation(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $request->user()->update([
            'lat' => $request->lat,
            'lng' => $request->lng,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Location saved'
        ]);
    }

    public function getProfile()
    {
        $user = User::Select('id', 'name', 'email', 'phone_number', 'whatsapp_number', 'address', 'city', 'language_id', 'status', 'created_at', 'updated_at')->findorfail(Auth::id());
        $user->load('roles');

        return response()->json([
            'status' => true,
            'user' => $user
        ]);
    }

    public function submitFeedback(Request $request)
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'comments' => 'required|string',
        ]);

        Feedback::create([
            'user_id' => Auth::id(),
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'city' => $request->city,
            'comments' => $request->comments,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Feedback submitted successfully'
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->token()->revoke();

        return response()->json([
            'status' => true,
            'message' => 'Successfully logged out'
        ]);
    }


    private function sendSms($to, $otp)
    {
        try {
            $client = new Client(env('TWILIO_SID'), env('TWILIO_AUTH_TOKEN'));
            $client->messages->create($to, [
                'from' => env('TWILIO_PHONE_NUMBER'),
                'body' => "Your T-Ride verification code is: $otp"
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }

    private function sendWhatsapp($to, $otp)
    {
        try {
            $client = new Client(env('TWILIO_SID'), env('TWILIO_AUTH_TOKEN'));
            $client->messages->create("whatsapp:$to", [
                'from' => env('TWILIO_WHATSAPP_NUMBER'),
                'body' => "Your T-Ride verification code is: $otp"
            ]);
        } catch (\Exception $e) {
            Log::error($e->getMessage());
        }
    }

    private function sendEmail($to, $otp)
    {
        if (filter_var($to, FILTER_VALIDATE_EMAIL)) {
            Mail::to($to)->send(new OtpMail($otp));
        }
    }
}
