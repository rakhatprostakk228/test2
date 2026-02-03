<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone', 50);
            $table->date('booking_date');
            $table->time('booking_time');
            $table->unsignedTinyInteger('guests');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->timestamps();

            $table->index(['booking_date', 'booking_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
