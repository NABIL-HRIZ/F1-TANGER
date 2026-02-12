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
        // Migration already handled in create_races_table
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('races', function (Blueprint $table) {
            // Revert status back to string
            $table->string('status')->change();
            // Drop new columns
            if (Schema::hasColumn('races', 'start_time')) {
                $table->dropColumn('start_time');
            }
            if (Schema::hasColumn('races', 'price')) {
                $table->dropColumn('price');
            }
            if (Schema::hasColumn('races', 'img')) {
                $table->dropColumn('img');
            }
        });
    }
};
