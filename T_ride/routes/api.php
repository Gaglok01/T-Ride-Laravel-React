<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TypeController;
use App\Http\Controllers\Api\OrderController;

use App\Http\Controllers\Api\DriverController;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('verify-otp', [AuthController::class, 'verifyOtp']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
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
    });
});
