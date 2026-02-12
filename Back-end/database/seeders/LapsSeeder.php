<?php

namespace Database\Seeders;

use App\Models\Lap;
use App\Models\Race;
use App\Models\Driver;
use App\Models\Team;
use App\Models\Cars;
use Illuminate\Database\Seeder;

class LapsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all races
        $races = Race::all();

        foreach ($races as $race) {
            // Get ALL drivers that have teams (not random selection)
            $drivers = Driver::with('team')->get();

            if ($drivers->isEmpty()) {
                continue;
            }

            // Create laps for ALL drivers in the race
            foreach ($drivers as $driver) {
                // Ensure driver has a team
                if (!$driver->team) {
                    continue;
                }

                // Get a car for this driver's team
                $car = Cars::where('team_id', $driver->team_id)->first();
                if (!$car) {
                    continue;
                }

                // Create 10-20 laps for this driver in this race
                $lapCount = rand(10, 20);
                // Base lap time varies per driver (some are faster)
                // Base in seconds: 1:15 to 2:45
                $baseSeconds = rand(75, 165);

                for ($lapNumber = 1; $lapNumber <= $lapCount; $lapNumber++) {
                    // Generate realistic lap times with variation
                    // Most laps within 2-3 seconds of base time
                    $lapSeconds = $baseSeconds + rand(-2, 3);
                    
                    // Ensure lap time is positive
                    if ($lapSeconds < 60) {
                        $lapSeconds = 60;
                    }
                    
                    // Convert to HH:MM:SS:MMM format
                    $hours = intdiv($lapSeconds, 3600);
                    $minutes = intdiv($lapSeconds % 3600, 60);
                    $seconds = $lapSeconds % 60;
                    $milliseconds = rand(0, 999);
                    
                    $lapTime = sprintf('%02d:%02d:%02d:%03d', $hours, $minutes, $seconds, $milliseconds);

                    Lap::create([
                        'race_id' => $race->id,
                        'driver_id' => $driver->id,
                        'lap_number' => $lapNumber,
                        'team_id' => $driver->team_id,
                        'car_id' => $car->id,
                        'lap_time' => $lapTime,
                    ]);
                }
            }
        }
    }
}
