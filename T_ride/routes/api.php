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
        Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);

        // Order Management
        Route::get('/orders', [OrderController::class, 'index']);
        Route::post('/orders', [OrderController::class, 'create']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

        // User Management
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);
        Route::get('/users/{id}', [UserManagementController::class, 'show']);
        Route::post('/users/{id}', [UserManagementController::class, 'update']); 
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
        Route::get('/active-rentals', [RentController::class, 'activeRentals']); 
        Route::get('/rent-payments', [RentController::class, 'payments']);
        Route::get('/contracts', [RentController::class, 'allContracts']);
        Route::get('/maintenance', [RentController::class, 'maintenanceIndex']);
    });

    Route::post('/logout', [AuthController::class, 'logout']);
});
    