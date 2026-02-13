<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\AppAuthController;
use App\Http\Controllers\Api\AppRideController;
use App\Http\Controllers\Api\AppCourierController;
use App\Http\Controllers\Api\AppFoodDeliveryController;

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

        // Courier Flow Routes
        Route::post('courier/nearby', [AppCourierController::class, 'getNearbyCouriers']);
        Route::post('courier/estimate', [AppCourierController::class, 'getEstimates']);
        Route::post('courier/request', [AppCourierController::class, 'requestCourier']);
        Route::get('courier/active', [AppCourierController::class, 'getActiveDeliveries']);
        Route::get('courier/{id}', [AppCourierController::class, 'getDeliveryDetails']); // Specific delivery
        Route::post('courier/{id}/cancel', [AppCourierController::class, 'cancelCourier']);
        Route::post('courier/{id}/rate', [AppCourierController::class, 'rateCourier']);
        Route::post('courier/upload-photo', [AppCourierController::class, 'uploadPackagePhoto']);

        // Food Delivery Flow Routes
        Route::get('food/home', [AppFoodDeliveryController::class, 'getHomeData']);
        Route::get('food/vendor/{id}', [AppFoodDeliveryController::class, 'getVendorDetails']);
        Route::post('food/order/place', [AppFoodDeliveryController::class, 'placeOrder']);
        Route::get('food/order/{id}/track', [AppFoodDeliveryController::class, 'trackOrder']);
        
        // Address Management
        Route::get('user/addresses', [AppFoodDeliveryController::class, 'getAddresses']);
        Route::post('user/address', [AppFoodDeliveryController::class, 'addAddress']);
    });
});
