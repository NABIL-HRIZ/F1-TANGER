<?php

namespace Database\Seeders;

use App\Models\Lap;
use App\Models\Race;
use App\Models\Driver;
use App\Models\Team;
use App\Models\Cars;
use Illuminate\Database\Seeder;

class Team12RacesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Add fake races for Team 12 (driver 62, car 23)
     */
    public function run(): void
    {
        $teamId = 12;
        $driverId = 62;
        $carId = 23;

        // Verify team, driver, and car exist
        $team = Team::find($teamId);
        if (!$team) {
            echo "Team {$teamId} not found\n";
            return;
        }

        $driver = Driver::find($driverId);
        if (!$driver) {
            echo "Driver {$driverId} not found\n";
            return;
        }

        $car = Cars::find($carId);
        if (!$car) {
            echo "Car {$carId} not found\n";
            return;
        }

        // Get all existing races
        $races = Race::all();

        if ($races->isEmpty()) {
            echo "No races found\n";
            return;
        }

        // Create laps for this team across all existing races
        foreach ($races as $race) {
            // Create 10-20 laps per race
            $lapCount = rand(10, 20);

            for ($lapNumber = 1; $lapNumber <= $lapCount; $lapNumber++) {
                // Generate realistic lap times (1:45 to 2:15 range in MM:SS format)
                $minutes = rand(1, 2);
                $seconds = rand(0, 59);
                $lapTime = sprintf('%02d:%02d:00', $minutes, $seconds);

                Lap::create([
                    'race_id' => $race->id,
                    'driver_id' => $driverId,
                    'lap_number' => $lapNumber,
                    'team_id' => $teamId,
                    'car_id' => $carId,
                    'lap_time' => $lapTime,
                ]);
            }

            echo "Added " . $lapCount . " laps for driver {$driverId} in race: {$race->name}\n";
        }
    }
}
