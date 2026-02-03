<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use App\Http\Requests\UpdateBookingStatusRequest;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Booking::query()->latest();

        if ($request->filled('date')) {
            $query->whereDate('booking_date', $request->string('date'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $term = (string) $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('full_name', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%");
            });
        }

        $perPage = max(1, min((int) $request->integer('per_page', 10), 100));

        return response()->json($query->paginate($perPage));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $payload = [
            ...$request->validated(),
            'status' => 'pending',
        ];

        if (! $this->isSlotAvailable($payload['booking_date'], $payload['booking_time'])) {
            return response()->json([
                'message' => 'Выбранное время уже занято',
                'errors' => [
                    'booking_time' => ['Выбранное время уже занято'],
                ],
            ], 422);
        }

        $booking = Booking::create($payload);

        return response()->json([
            'message' => 'Booking created successfully',
            'data' => $booking,
        ], 201);
    }

    public function show(Booking $booking): JsonResponse
    {
        return response()->json($booking);
    }

    public function update(UpdateBookingRequest $request, Booking $booking): JsonResponse
    {
        $payload = $request->validated();
        $date = $payload['booking_date'] ?? $booking->booking_date->format('Y-m-d');
        $time = $payload['booking_time'] ?? $booking->booking_time;

        if (! $this->isSlotAvailable($date, $time, $booking->id)) {
            return response()->json([
                'message' => 'Выбранное время уже занято',
                'errors' => [
                    'booking_time' => ['Выбранное время уже занято'],
                ],
            ], 422);
        }

        $booking->update($payload);

        return response()->json([
            'message' => 'Booking updated successfully',
            'data' => $booking->fresh(),
        ]);
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): JsonResponse
    {
        $booking->update($request->validated());

        return response()->json([
            'message' => 'Booking status updated successfully',
            'data' => $booking->fresh(),
        ]);
    }

    public function destroy(Booking $booking): JsonResponse
    {
        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully',
        ]);
    }

    public function downloadPdf(Booking $booking): BinaryFileResponse
    {
        $pdf = Pdf::loadView('pdf.booking', ['booking' => $booking]);

        return $pdf->download('booking-'.$booking->id.'.pdf');
    }

    private function isSlotAvailable(string $bookingDate, string $bookingTime, ?int $excludeId = null): bool
    {
        return ! Booking::query()
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->whereDate('booking_date', $bookingDate)
            ->whereTime('booking_time', $bookingTime)
            ->whereIn('status', ['pending', 'confirmed'])
            ->exists();
    }
}
