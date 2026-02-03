<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        Booking::query()->create([
            'full_name' => 'Ivan Petrov',
            'email' => 'ivan.petrov@example.com',
            'phone' => '+77001234567',
            'booking_date' => now()->addDays(2)->toDateString(),
            'booking_time' => '15:30',
            'guests' => 3,
            'notes' => 'Window seat please',
            'status' => 'confirmed',
        ]);
    }
}
