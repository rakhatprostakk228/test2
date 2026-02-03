<?php

namespace Tests\Feature;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_booking(): void
    {
        $payload = [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+77001112233',
            'booking_date' => now()->addDays(1)->toDateString(),
            'booking_time' => '18:30',
            'guests' => 2,
            'notes' => 'No onions',
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertCreated()
            ->assertJsonPath('data.email', 'test@example.com')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('bookings', [
            'email' => 'test@example.com',
            'status' => 'pending',
        ]);
    }

    public function test_cannot_create_booking_with_taken_slot(): void
    {
        $date = now()->addDays(1)->toDateString();

        Booking::query()->create([
            'full_name' => 'Existing User',
            'email' => 'existing@example.com',
            'phone' => '+77009990000',
            'booking_date' => $date,
            'booking_time' => '19:00',
            'guests' => 4,
            'status' => 'confirmed',
        ]);

        $payload = [
            'full_name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '+77001112233',
            'booking_date' => $date,
            'booking_time' => '19:00',
            'guests' => 2,
        ];

        $response = $this->postJson('/api/bookings', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('message', 'Выбранное время уже занято');
    }

    public function test_can_update_booking_status(): void
    {
        $booking = Booking::query()->create([
            'full_name' => 'User',
            'email' => 'user@example.com',
            'phone' => '+77001110000',
            'booking_date' => now()->addDays(2)->toDateString(),
            'booking_time' => '14:00',
            'guests' => 2,
            'status' => 'pending',
        ]);

        $response = $this->patchJson("/api/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_can_filter_bookings_by_date_and_status(): void
    {
        $date = now()->addDays(3)->toDateString();

        Booking::query()->create([
            'full_name' => 'A',
            'email' => 'a@example.com',
            'phone' => '1',
            'booking_date' => $date,
            'booking_time' => '10:00',
            'guests' => 2,
            'status' => 'confirmed',
        ]);

        Booking::query()->create([
            'full_name' => 'B',
            'email' => 'b@example.com',
            'phone' => '2',
            'booking_date' => now()->addDays(4)->toDateString(),
            'booking_time' => '11:00',
            'guests' => 2,
            'status' => 'pending',
        ]);

        $response = $this->getJson("/api/bookings?date={$date}&status=confirmed");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertSame('a@example.com', $response->json('data.0.email'));
    }
}
