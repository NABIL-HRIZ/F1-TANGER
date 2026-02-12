<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use App\Models\Race;
use App\Models\Ticket;
use App\Models\Role;
use Carbon\Carbon;

class AddTicketsToAllClientsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the client role
        $clientRole = Role::where('name', 'client')->first();

        if (!$clientRole) {
            $this->command->error('❌ Client role not found!');
            return;
        }

        // Get all users with client role
        $clientUsers = $clientRole->users()->get();

        foreach ($clientUsers as $user) {
            // Get or create client for this user
            $client = Client::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'cin' => fake()->bothify('??######'),
                    'phone_nbr' => fake()->phoneNumber(),
                ]
            );

            // Get all races
            $races = Race::all();

            // Create 1-2 tickets per race for this client
            foreach ($races as $race) {
                // Check if ticket already exists for this client and race
                $ticketExists = Ticket::where('client_id', $client->id)
                    ->where('race_id', $race->id)
                    ->exists();

                if (!$ticketExists) {
                    // Randomly create 1 or 2 tickets
                    $ticketCount = rand(1, 2);
                    
                    for ($i = 0; $i < $ticketCount; $i++) {
                        // Generate random issue date (1-6 months ago)
                        $issueDate = Carbon::now()->subMonths(rand(1, 6));
                        
                        // Expiry date is 7 days after race date
                        $expiryDate = $race->date->addDays(7);
                        
                        // Determine status based on dates
                        $now = Carbon::now();
                        if ($now > $race->date) {
                            $status = 'used';
                        } elseif ($now > $expiryDate) {
                            $status = 'expired';
                        } else {
                            $status = 'active';
                        }

                        Ticket::create([
                            'client_id' => $client->id,
                            'race_id' => $race->id,
                            'ticket_code' => 'T' . uniqid() . rand(10000, 99999),
                            'issue_date' => $issueDate,
                            'expiry_date' => $expiryDate,
                            'status' => $status,
                        ]);
                    }
                }
            }
        }

        $this->command->info('✅ Tickets created for all client users!');
    }
}
