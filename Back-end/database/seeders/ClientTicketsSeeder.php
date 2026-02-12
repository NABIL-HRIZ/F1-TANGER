<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\Race;
use App\Models\Client;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ClientTicketsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Add fake tickets for client with ID 1 for Tanger races
     */
    public function run(): void
    {
        // Get the client with ID 1
        $client = Client::find(1);

        if (!$client) {
            echo "❌ Client with ID 1 not found\n";
            return;
        }

        // Get all Tanger races
        $races = Race::all();

        if ($races->isEmpty()) {
            echo "❌ No races found\n";
            return;
        }

        // Select 3-4 races for the client to have tickets
        $selectedRaces = $races->random(min(4, $races->count()));

        $ticketCount = 0;

        foreach ($selectedRaces as $race) {
            // Create 1-2 tickets per race (some clients buy multiple)
            $ticketsPerRace = rand(1, 2);

            for ($i = 1; $i <= $ticketsPerRace; $i++) {
                $issueDate = Carbon::now()->subMonths(rand(1, 6));
                $expiryDate = $race->date ? Carbon::parse($race->date)->addDays(7) : $issueDate->addYears(1);

                // Generate unique ticket code
                $ticketCode = 'T' . strtoupper(uniqid()) . rand(1000, 9999);

                // Determine ticket status based on race date
                $raceDate = $race->date ? Carbon::parse($race->date) : null;
                if ($raceDate && $raceDate->isPast()) {
                    $status = 'used';
                } elseif ($expiryDate && Carbon::now()->isAfter($expiryDate)) {
                    $status = 'expired';
                } else {
                    $status = 'active';
                }

                Ticket::create([
                    'race_id' => $race->id,
                    'client_id' => $client->id,
                    'ticket_code' => $ticketCode,
                    'issue_date' => $issueDate->format('Y-m-d'),
                    'expiry_date' => $expiryDate->format('Y-m-d'),
                    'status' => $status,
                ]);

                $ticketCount++;
            }
        }

        echo "\n✅ Client Tickets Seeded Successfully!\n";
        echo "✅ Created {$ticketCount} tickets for client ID 1\n";
        echo "✅ Tickets are linked to real Tanger races\n";
    }
}
