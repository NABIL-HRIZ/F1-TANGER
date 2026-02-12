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
        Schema::table('laps', function (Blueprint $table) {
            // Change lap_time from TIME to TIME(3) to support milliseconds
            $table->time('lap_time', precision: 3)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laps', function (Blueprint $table) {
            // Change back to TIME
            $table->time('lap_time')->change();
        });
    }
};
