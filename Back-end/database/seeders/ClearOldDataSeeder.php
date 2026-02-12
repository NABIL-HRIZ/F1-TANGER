<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ClearOldDataSeeder extends Seeder
{
    public function run(): void
    {
        // Clear old data - only if tables exist
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        if (Schema::hasTable('standings')) DB::table('standings')->truncate();
        if (Schema::hasTable('cars')) DB::table('cars')->truncate();
        if (Schema::hasTable('drivers')) DB::table('drivers')->truncate();
        if (Schema::hasTable('teams')) DB::table('teams')->truncate();
        if (Schema::hasTable('races')) DB::table('races')->truncate();
        
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        
        echo "\n✅ Old data cleared\n";
    }
}
