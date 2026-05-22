<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\LanguageController;
use App\Http\Controllers\Api\AppAuthController;
use App\Http\Controllers\Api\AppRideController;
use App\Http\Controllers\Api\AppCourierController;
use App\Http\Controllers\Api\AppFoodDeliveryController;
use App\Http\Controllers\Api\AppWalletController;
use App\Http\Controllers\Api\AppDriverController;
use App\Http\Controllers\Api\AppVendorFoodController;
use App\Http\Controllers\Api\AppRentalController;

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
        Route::post('update-profile', [AppAuthController::class, 'updateProfile']);
        Route::post('submit-feedback', [AppAuthController::class, 'submitFeedback']);
        Route::post('logout', [AppAuthController::class, 'logout']);

        // Ride Flow Routes
        Route::prefix('rides')->group(function () {
            Route::post('nearby-drivers', [AppRideController::class, 'getNearbyDrivers']);
            Route::post('estimate', [AppRideController::class, 'getEstimates']);
            Route::post('request', [AppRideController::class, 'requestRide']);
            Route::get('active', [AppRideController::class, 'getActiveRide']);
            Route::post('{id}/cancel', [AppRideController::class, 'cancelRide']);
            Route::post('{id}/rate', [AppRideController::class, 'rateRide']);
        });

        // Courier Flow Routes
        Route::prefix('courier')->group(function () {
            Route::post('nearby', [AppCourierController::class, 'getNearbyCouriers']);
            Route::post('estimate', [AppCourierController::class, 'getEstimates']);
            Route::post('request', [AppCourierController::class, 'requestCourier']);
            Route::get('active', [AppCourierController::class, 'getActiveDeliveries']);
            Route::get('{id}', [AppCourierController::class, 'getDeliveryDetails']); // Specific delivery
            Route::post('{id}/cancel', [AppCourierController::class, 'cancelCourier']);
            Route::post('{id}/rate', [AppCourierController::class, 'rateCourier']);
            Route::post('upload-photo', [AppCourierController::class, 'uploadPackagePhoto']);
        });

        // Food Delivery Flow Routes
        Route::prefix('food')->group(function () {
            Route::get('home', [AppFoodDeliveryController::class, 'getHomeData']);
            Route::get('vendor/{id}', [AppFoodDeliveryController::class, 'getVendorDetails']);
            Route::post('order/place', [AppFoodDeliveryController::class, 'placeOrder']);
            Route::get('order/{id}/track', [AppFoodDeliveryController::class, 'trackOrder']);
        });

        // Wallet Flow Routes
        Route::prefix('wallet')->group(function () {
            Route::get('data', [AppWalletController::class, 'getWalletData']);
            Route::post('add-money', [AppWalletController::class, 'addMoney']);
            Route::post('withdraw', [AppWalletController::class, 'withdrawMoney']);
        });

        // Rental Flow Routes
        Route::prefix('rental')->group(function () {
            Route::get('items', [AppRentalController::class, 'getItems']);
            Route::get('item/{id}', [AppRentalController::class, 'getItemDetail']);
            Route::post('book', [AppRentalController::class, 'bookItem']);
            Route::get('my-bookings', [AppRentalController::class, 'getMyBookings']);
        });

        // Driver Flow Routes
        Route::prefix('driver')->group(function () {
            Route::post('profile-setup', [AppDriverController::class, 'setupProfile']);
            Route::post('upload-docs', [AppDriverController::class, 'uploadDocuments']);
            Route::get('status', [AppDriverController::class, 'getStatus']);
            Route::post('toggle-online', [AppDriverController::class, 'toggleOnline']);
            Route::get('dashboard', [AppDriverController::class, 'getDashboard']);
            Route::get('ride-requests', [AppDriverController::class, 'getRideRequests']);
            Route::post('ride/{id}/respond', [AppDriverController::class, 'respondToRide']);
            Route::post('ride/{id}/status', [AppDriverController::class, 'updateRideStatus']);
        });

        // Vendor Food Delivery Routes
        Route::prefix('vendor/food')->group(function () {
            Route::get('profile', [AppVendorFoodController::class, 'getProfile']);
            Route::post('profile', [AppVendorFoodController::class, 'updateProfile']);
            Route::get('dashboard', [AppVendorFoodController::class, 'getDashboard']);
            Route::get('orders', [AppVendorFoodController::class, 'getOrders']);
            Route::post('order/{id}/status', [AppVendorFoodController::class, 'updateOrderStatus']);
            Route::get('earnings', [AppVendorFoodController::class, 'getEarnings']);
            Route::get('menu', [AppVendorFoodController::class, 'getMenu']);
        });
        
        // Address Management
        Route::get('user/addresses', [AppFoodDeliveryController::class, 'getAddresses']);
        Route::post('user/address', [AppFoodDeliveryController::class, 'addAddress']);
    });
});
