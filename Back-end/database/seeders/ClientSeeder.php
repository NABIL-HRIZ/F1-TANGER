<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Create a test client user with ID 1
     */
    public function run(): void
    {
        // Create a test client user
        $user = User::create([
            'name' => 'HAKIM ZIYECH',
            'email' => 'client@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Assign 'client' role to this user
        $user->syncRoles(['client']);

        // Create corresponding client record
        Client::create([
            'user_id' => $user->id,
            'phone_nbr' => '0612842908',
            'cin' => 'BE913673',
        ]);

        echo "\n✅ Client Seeder Completed!\n";
        echo "✅ Created client user: HAKIM ZIYECH\n";
        echo "✅ Email: client@example.com\n";
        echo "✅ Password: password123\n";
    }
}
