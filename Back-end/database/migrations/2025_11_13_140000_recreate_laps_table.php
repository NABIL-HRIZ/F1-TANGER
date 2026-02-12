<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if laps table exists, if not create it
        if (!Schema::hasTable('laps')) {
            Schema::create('laps', function (Blueprint $table) {
                $table->id();
                $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
                $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
                $table->integer('lap_number');
                $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
                $table->foreignId('car_id')->constrained('cars')->onDelete('cascade');
                $table->time('lap_time');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('laps');
    }
};
