<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Race;
use App\Models\Driver;

class VerifyParticipation extends Command
{
    protected $signature = 'verify:participation';
    protected $description = 'Verify all drivers participate in all races';

    public function handle()
    {
        $races = Race::all();
        $drivers = Driver::all();

        $totalRaces = $races->count();
        $totalDrivers = $drivers->count();

        $this->line("\n=== RACE PARTICIPATION REPORT ===");
        $this->line("Total Races: {$totalRaces}");
        $this->line("Total Drivers: {$totalDrivers}");

        $racesWithAllDrivers = 0;
        $missingParticipations = [];

        foreach ($races as $race) {
            $driversInRace = $race->laps()->distinct('driver_id')->count('driver_id');
            
            if ($driversInRace == $totalDrivers) {
                $racesWithAllDrivers++;
                $this->info("✅ Race {$race->id} ({$race->name}): {$driversInRace}/{$totalDrivers} drivers");
            } else {
                $this->error("❌ Race {$race->id} ({$race->name}): {$driversInRace}/{$totalDrivers} drivers MISSING");
                
                // Find missing drivers
                $driversInRaceIds = $race->laps()->pluck('driver_id')->unique();
                $missingDrivers = $drivers->whereNotIn('id', $driversInRaceIds);
                foreach ($missingDrivers as $driver) {
                    $missingParticipations[] = "Race {$race->id} - Driver {$driver->id} ({$driver->first_name} {$driver->last_name})";
                }
            }
        }

        $this->line("\n=== SUMMARY ===");
        $this->line("Races with ALL drivers: {$racesWithAllDrivers}/{$totalRaces}");

        if (!empty($missingParticipations)) {
            $this->line("\n❌ Missing Participations:");
            foreach ($missingParticipations as $missing) {
                $this->line("  - {$missing}");
            }
        } else {
            $this->info("\n✅ All drivers participate in all races!");
        }
    }
}
