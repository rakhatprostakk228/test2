<?php

use App\Http\Controllers\Api\BookingController;
use Illuminate\Support\Facades\Route;

Route::prefix('bookings')->group(function () {
    Route::get('/', [BookingController::class, 'index']);
    Route::post('/', [BookingController::class, 'store']);
    Route::get('{booking}', [BookingController::class, 'show']);
    Route::put('{booking}', [BookingController::class, 'update']);
    Route::patch('{booking}/status', [BookingController::class, 'updateStatus']);
    Route::delete('{booking}', [BookingController::class, 'destroy']);
    Route::get('{booking}/pdf', [BookingController::class, 'downloadPdf']);
});
