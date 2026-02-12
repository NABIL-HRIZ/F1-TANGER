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
        Schema::dropIfExists('tickets');
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('race_id')->constrained('races')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('clients')->onDelete('cascade');
            $table->string('ticket_code')->unique();
            $table->date('issue_date');
            $table->date('expiry_date');
            $table->enum('status', ['active', 'expired', 'used'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
