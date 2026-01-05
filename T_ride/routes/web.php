<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

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

Route::get('/admin/vendors', function () {
    return Inertia::render('admin/vendors');
})->name('admin.vendors');

Route::get('/admin/settings', function () {
    return Inertia::render('admin/settings');
})->name('admin.settings');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

require __DIR__.'/settings.php';
