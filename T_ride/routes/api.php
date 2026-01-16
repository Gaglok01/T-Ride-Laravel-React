<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TypeController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\UserManagementController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\RentController;
use App\Http\Controllers\Api\RideController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\DeliveryOrderController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('verify-otp', [AuthController::class, 'verifyOtp']);

Route::middleware('auth:api')->group(function () {
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Role Management
        Route::get('/roles', [RoleController::class, 'index']);
        Route::post('/roles', [RoleController::class, 'store']);
        Route::get('/roles/{id}', [RoleController::class, 'show']);
        Route::put('/roles/{id}', [RoleController::class, 'update']);
        Route::delete('/roles/{id}', [RoleController::class, 'destroy']);
        Route::get('/permissions', [RoleController::class, 'getAllPermissions']);

        // Type Management
        Route::get('/types', [TypeController::class, 'index']);
        Route::post('/types', [TypeController::class, 'store']);
        Route::get('/types/{id}', [TypeController::class, 'show']);
        Route::put('/types/{id}', [TypeController::class, 'update']);
        Route::delete('/types/{id}', [TypeController::class, 'destroy']);

        // Driver Management
        Route::get('/drivers', [DriverController::class, 'index']);
        Route::post('/drivers', [DriverController::class, 'store']);
        Route::get('/drivers/{id}', [DriverController::class, 'show']);
        Route::put('/drivers/{id}', [DriverController::class, 'update']);
        Route::patch('/drivers/{id}/status', [DriverController::class, 'updateStatus']);
        Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);

        // Order Management
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'create']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

        // User Management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::put('/users/{id}', [UserManagementController::class, 'update']);
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy']);
        Route::patch('/users/{id}/status', [UserManagementController::class, 'toggleStatus']);

        // Category Management
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::get('/categories/{id}', [CategoryController::class, 'show']);
        Route::patch('/categories/{id}/status', [CategoryController::class, 'toggleStatus']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Vendor Management
        Route::get('/vendors', [VendorController::class, 'index']);
        Route::post('/vendors', [VendorController::class, 'store']);
        Route::get('/vendors/{id}', [VendorController::class, 'show']);
        Route::put('/vendors/{id}', [VendorController::class, 'update']);
        Route::patch('/vendors/{id}/status', [VendorController::class, 'toggleStatus']);
        Route::delete('/vendors/{id}', [VendorController::class, 'destroy']);

        // Rent Management
        Route::get('/fleet-vehicles', [RentController::class, 'vehicleIndex']);
        Route::post('/fleet-vehicles', [RentController::class, 'vehicleStore']);
        Route::get('/fleet-vehicles/{id}', [RentController::class, 'vehicleShow']);
        Route::get('/active-rentals', [RentController::class, 'activeRentals']);
        Route::get('/rent-payments', [RentController::class, 'payments']);
        Route::get('/contracts', [RentController::class, 'allContracts']);
        Route::get('/maintenance', [RentController::class, 'maintenanceIndex']);

        // Promotion Management
        Route::get('/promotions/stats', [PromotionController::class, 'getStats']);
        Route::get('/promotions', [PromotionController::class, 'index']);
        Route::post('/promotions', [PromotionController::class, 'store']);
        Route::get('/promotions/{id}', [PromotionController::class, 'show']);
        Route::put('/promotions/{id}', [PromotionController::class, 'update']);
        Route::patch('/promotions/{id}/status', [PromotionController::class, 'toggleStatus']);
        Route::delete('/promotions/{id}', [PromotionController::class, 'destroy']);

        // Ride Management
        Route::get('/rides/stats', [RideController::class, 'getStats']);
        Route::get('/rides', [RideController::class, 'index']);
        Route::put('/rides/{id}/status', [RideController::class, 'updateStatus']);

        // Delivery Order Management
        Route::get('/delivery-orders/stats', [DeliveryOrderController::class, 'getStats']);
        Route::get('/delivery-orders', [DeliveryOrderController::class, 'index']);
        Route::get('/delivery-orders/{id}', [DeliveryOrderController::class, 'show']);

        // Pricing Management
        Route::get('/pricing-zones', [\App\Http\Controllers\Api\PricingController::class, 'getPricingZones']);
        Route::post('/pricing-zones', [\App\Http\Controllers\Api\PricingController::class, 'storePricingZone']);
        Route::put('/pricing-zones/{id}', [\App\Http\Controllers\Api\PricingController::class, 'updatePricingZone']);
        Route::delete('/pricing-zones/{id}', [\App\Http\Controllers\Api\PricingController::class, 'deletePricingZone']);

        Route::get('/package-pricing', [\App\Http\Controllers\Api\PricingController::class, 'getPackagePricing']);
        Route::post('/package-pricing', [\App\Http\Controllers\Api\PricingController::class, 'storePackagePricing']);
        Route::put('/package-pricing/{id}', [\App\Http\Controllers\Api\PricingController::class, 'updatePackagePricing']);

        Route::get('/delivery-fees', [\App\Http\Controllers\Api\PricingController::class, 'getDeliveryFees']);
        Route::post('/delivery-fees', [\App\Http\Controllers\Api\PricingController::class, 'storeDeliveryFee']);
        Route::put('/delivery-fees/{id}', [\App\Http\Controllers\Api\PricingController::class, 'updateDeliveryFee']);
        Route::delete('/delivery-fees/{id}', [\App\Http\Controllers\Api\PricingController::class, 'deleteDeliveryFee']);

        Route::get('/surge-rules', [\App\Http\Controllers\Api\PricingController::class, 'getSurgeRules']);
        Route::post('/surge-rules', [\App\Http\Controllers\Api\PricingController::class, 'storeSurgeRule']);
        Route::put('/surge-rules/{id}', [\App\Http\Controllers\Api\PricingController::class, 'updateSurgeRule']);
        Route::patch('/surge-rules/{id}/status', [\App\Http\Controllers\Api\PricingController::class, 'toggleSurgeRuleStatus']);
        Route::delete('/surge-rules/{id}', [\App\Http\Controllers\Api\PricingController::class, 'deleteSurgeRule']);

        // Dispatch Management
        Route::get('/dispatch/stats', [\App\Http\Controllers\Api\DispatchController::class, 'getStats']);
        Route::get('/dispatch/pending-orders', [\App\Http\Controllers\Api\DispatchController::class, 'getPendingOrders']);
        Route::get('/dispatch/available-drivers', [\App\Http\Controllers\Api\DispatchController::class, 'getAvailableDrivers']);
        Route::post('/dispatch/assign-driver', [\App\Http\Controllers\Api\DispatchController::class, 'assignDriver']);
        Route::post('/dispatch/manual-booking', [\App\Http\Controllers\Api\DispatchController::class, 'createManualBooking']);
        Route::get('/dispatch/manual-bookings', [\App\Http\Controllers\Api\DispatchController::class, 'getManualBookings']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
