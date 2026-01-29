<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\AppAuthController;
use App\Http\Controllers\Api\AppRideController;

/*
|--------------------------------------------------------------------------
| Mobile App API Routes
|--------------------------------------------------------------------------
*/

Route::get('api/languages', [LanguageController::class, 'index']);
Route::get('api/roles', [RoleController::class, 'getRole']);

Route::prefix('api/app')->group(function () {
    Route::post('login', [AppAuthController::class, 'login']);
    Route::post('send-otp', [AppAuthController::class, 'sendOtp']);
    Route::post('verify-otp', [AppAuthController::class, 'verifyOtp']);
    Route::post('register', [AppAuthController::class, 'register']);
    
    Route::middleware('auth:api')->group(function () {
        Route::post('save-location', [AppAuthController::class, 'saveLocation']);
        Route::get('get-profile', [AppAuthController::class, 'getProfile']);
        Route::post('submit-feedback', [AppAuthController::class, 'submitFeedback']);
        Route::post('logout', [AppAuthController::class, 'logout']);

        // Ride Flow Routes
        Route::post('rides/nearby-drivers', [AppRideController::class, 'getNearbyDrivers']);
        Route::post('rides/estimate', [AppRideController::class, 'getEstimates']);
        Route::post('rides/request', [AppRideController::class, 'requestRide']);
        Route::get('rides/active', [AppRideController::class, 'getActiveRide']);
        Route::post('rides/{id}/cancel', [AppRideController::class, 'cancelRide']);
        Route::post('rides/{id}/rate', [AppRideController::class, 'rateRide']);
    });
});
