<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'booking_date',
        'booking_time',
        'guests',
        'notes',
        'status',
    ];

    protected $casts = [
        'booking_date' => 'date:Y-m-d',
    ];
}
