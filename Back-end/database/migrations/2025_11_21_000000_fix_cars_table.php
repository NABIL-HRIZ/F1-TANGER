<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Disable strict SQL mode temporarily
        DB::statement("SET sql_mode=''");
        
        // First update any existing invalid status values to 'active'
        DB::statement("UPDATE cars SET status = 'active' WHERE status NOT IN ('active', 'inactive', 'maintenance')");
        
        // Now modify the column to only accept the frontend values
        DB::statement("ALTER TABLE cars MODIFY status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("SET sql_mode=''");
        DB::statement("ALTER TABLE cars MODIFY status ENUM('available', 'in_maintenance', 'damaged', 'retired') DEFAULT 'available'");
    }
};
