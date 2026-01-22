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
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PaymentGatewayController;
use App\Http\Controllers\Api\CityZoneController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('verify-otp', [AuthController::class, 'verifyOtp']);

Route::middleware('auth:api')->group(function () {
    Route::prefix('admin')->middleware('role:admin')->group(function () {
        // Dashboard Stats
        Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

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
        Route::put('/fleet-vehicles/{id}', [RentController::class, 'vehicleUpdate']);
        Route::patch('/fleet-vehicles/{id}/status', [RentController::class, 'vehicleUpdateStatus']);
        Route::delete('/fleet-vehicles/{id}', [RentController::class, 'vehicleDestroy']);
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

        // Payment Gateway Management
        Route::get('/payment-gateway/dashboard', [PaymentGatewayController::class, 'getDashboardStats']);
        
        // Payment Providers
        Route::get('/payment-gateway/providers', [PaymentGatewayController::class, 'getProviders']);
        Route::get('/payment-gateway/providers/{id}', [PaymentGatewayController::class, 'getProvider']);
        Route::post('/payment-gateway/providers', [PaymentGatewayController::class, 'storeProvider']);
        Route::put('/payment-gateway/providers/{id}', [PaymentGatewayController::class, 'updateProvider']);
        Route::patch('/payment-gateway/providers/{id}/configure', [PaymentGatewayController::class, 'configureProvider']);
        
        // Mobile Money Providers
        Route::get('/payment-gateway/mobile-money', [PaymentGatewayController::class, 'getMobileMoneyProviders']);
        Route::post('/payment-gateway/mobile-money', [PaymentGatewayController::class, 'storeMobileMoneyProvider']);
        
        // Transaction Limits
        Route::get('/payment-gateway/transaction-limits', [PaymentGatewayController::class, 'getTransactionLimits']);
        Route::put('/payment-gateway/transaction-limits/{id}', [PaymentGatewayController::class, 'updateTransactionLimit']);
        
        // Card Processing Settings
        Route::get('/payment-gateway/card-settings', [PaymentGatewayController::class, 'getCardSettings']);
        Route::put('/payment-gateway/card-settings', [PaymentGatewayController::class, 'updateCardSettings']);
        
        // Fraud Prevention Settings
        Route::get('/payment-gateway/fraud-settings', [PaymentGatewayController::class, 'getFraudSettings']);
        Route::put('/payment-gateway/fraud-settings', [PaymentGatewayController::class, 'updateFraudSettings']);
        
        // Webhooks
        Route::get('/payment-gateway/webhooks', [PaymentGatewayController::class, 'getWebhooks']);
        Route::post('/payment-gateway/webhooks', [PaymentGatewayController::class, 'storeWebhook']);
        Route::put('/payment-gateway/webhooks/{id}', [PaymentGatewayController::class, 'updateWebhook']);
        Route::delete('/payment-gateway/webhooks/{id}', [PaymentGatewayController::class, 'deleteWebhook']);
        
        // Transactions
        Route::get('/payment-gateway/transactions', [PaymentGatewayController::class, 'getTransactions']);
        Route::post('/payment-gateway/transactions', [PaymentGatewayController::class, 'processTransaction']);

        // Cities & Service Zones Management
        Route::get('/cities-zones/stats', [CityZoneController::class, 'getDashboardStats']);
        
        // Cities
        Route::get('/cities', [CityZoneController::class, 'getCities']);
        Route::post('/cities', [CityZoneController::class, 'storeCity']);
        Route::get('/cities/{id}', [CityZoneController::class, 'showCity']);
        Route::put('/cities/{id}', [CityZoneController::class, 'updateCity']);
        Route::patch('/cities/{id}/status', [CityZoneController::class, 'updateCityStatus']);
        Route::delete('/cities/{id}', [CityZoneController::class, 'destroyCity']);

        // Service Zones
        Route::get('/service-zones', [CityZoneController::class, 'getServiceZones']);
        Route::post('/service-zones', [CityZoneController::class, 'storeServiceZone']);
        Route::get('/service-zones/{id}', [CityZoneController::class, 'showServiceZone']);
        Route::put('/service-zones/{id}', [CityZoneController::class, 'updateServiceZone']);
        Route::patch('/service-zones/{id}/status', [CityZoneController::class, 'updateServiceZoneStatus']);
        Route::delete('/service-zones/{id}', [CityZoneController::class, 'destroyServiceZone']);

        // Transportation Hubs (Airports, Stations, etc.)
        Route::get('/transportation-hubs', [CityZoneController::class, 'getTransportationHubs']);
        Route::post('/transportation-hubs', [CityZoneController::class, 'storeTransportationHub']);
        Route::get('/transportation-hubs/{id}', [CityZoneController::class, 'showTransportationHub']);
        Route::put('/transportation-hubs/{id}', [CityZoneController::class, 'updateTransportationHub']);
        Route::patch('/transportation-hubs/{id}/status', [CityZoneController::class, 'updateTransportationHubStatus']);
        Route::delete('/transportation-hubs/{id}', [CityZoneController::class, 'destroyTransportationHub']);

        // Restricted Areas
        Route::get('/restricted-areas', [CityZoneController::class, 'getRestrictedAreas']);
        Route::post('/restricted-areas', [CityZoneController::class, 'storeRestrictedArea']);
        Route::get('/restricted-areas/{id}', [CityZoneController::class, 'showRestrictedArea']);
        Route::put('/restricted-areas/{id}', [CityZoneController::class, 'updateRestrictedArea']);
        Route::patch('/restricted-areas/{id}/status', [CityZoneController::class, 'updateRestrictedAreaStatus']);
        Route::delete('/restricted-areas/{id}', [CityZoneController::class, 'destroyRestrictedArea']);

        // Expansion Plans
        Route::get('/expansion-plans', [CityZoneController::class, 'getExpansionPlans']);
        Route::post('/expansion-plans', [CityZoneController::class, 'storeExpansionPlan']);
        Route::get('/expansion-plans/{id}', [CityZoneController::class, 'showExpansionPlan']);
        Route::put('/expansion-plans/{id}', [CityZoneController::class, 'updateExpansionPlan']);
        Route::delete('/expansion-plans/{id}', [CityZoneController::class, 'destroyExpansionPlan']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
