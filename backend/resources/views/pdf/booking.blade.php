<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Booking #{{ $booking->id }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; }
        .title { font-size: 22px; margin-bottom: 16px; }
        .table { width: 100%; border-collapse: collapse; }
        .table td { border: 1px solid #d1d5db; padding: 10px; }
        .key { width: 35%; font-weight: bold; background: #f3f4f6; }
    </style>
</head>
<body>
    <div class="title">Booking Confirmation #{{ $booking->id }}</div>
    <table class="table">
        <tr><td class="key">Name</td><td>{{ $booking->full_name }}</td></tr>
        <tr><td class="key">Email</td><td>{{ $booking->email }}</td></tr>
        <tr><td class="key">Phone</td><td>{{ $booking->phone }}</td></tr>
        <tr><td class="key">Date</td><td>{{ $booking->booking_date }}</td></tr>
        <tr><td class="key">Time</td><td>{{ \Carbon\Carbon::parse($booking->booking_time)->format('H:i') }}</td></tr>
        <tr><td class="key">Guests</td><td>{{ $booking->guests }}</td></tr>
        <tr><td class="key">Status</td><td>{{ ucfirst($booking->status) }}</td></tr>
        <tr><td class="key">Notes</td><td>{{ $booking->notes ?: '-' }}</td></tr>
    </table>
    <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
        Generated at {{ now()->format('Y-m-d H:i:s') }}
    </p>
</body>
</html>
