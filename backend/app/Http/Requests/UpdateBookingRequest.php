<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255'],
            'phone' => ['sometimes', 'required', 'string', 'max:50'],
            'booking_date' => ['sometimes', 'required', 'date', 'after_or_equal:today'],
            'booking_time' => ['sometimes', 'required', 'date_format:H:i'],
            'guests' => ['sometimes', 'required', 'integer', 'min:1', 'max:20'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'status' => ['sometimes', 'required', 'in:pending,confirmed,cancelled'],
        ];
    }
}
