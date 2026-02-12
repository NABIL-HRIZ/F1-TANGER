<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

use App\Models\Driver;
use App\Models\Team;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('car_number')->unique();
            $table->string('model');
            $table->string('brand');
            $table->string('chassis');
            $table->foreignId('team_id')->constrained('teams')->onDelete('cascade');
            $table->foreignId('driver_id')->constrained('drivers')->onDelete('cascade');
            $table->string('engine')->nullable();
            $table->year('year');
            $table->string('color')->nullable();
            $table->integer('horsepower')->nullable();
            $table->integer('weight')->nullable();
            $table->string('image')->nullable();
            $table->integer('top_speed')->nullable();
            $table->enum('status', ['available', 'in_maintenance', 'damaged', 'retired'])->default('available');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
