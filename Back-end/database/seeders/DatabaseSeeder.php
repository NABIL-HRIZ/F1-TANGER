<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(LaratrustSeeder::class);
        $this->call(F1DataSeeder::class);
        $this->call(ClientSeeder::class);
        $this->call(LapsSeeder::class);
        $this->call(Team12RacesSeeder::class);
        $this->call(ClientTicketsSeeder::class);
        $this->call(AddTicketsToAllClientsSeeder::class);
    }
}
