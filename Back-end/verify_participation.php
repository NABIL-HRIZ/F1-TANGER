<?php

// Verify all drivers are in all races
$races = \App\Models\Race::all();
$drivers = \App\Models\Driver::all();

$totalRaces = $races->count();
$totalDrivers = $drivers->count();

echo "\n=== RACE PARTICIPATION REPORT ===\n";
echo "Total Races: {$totalRaces}\n";
echo "Total Drivers: {$totalDrivers}\n";

$racesWithAllDrivers = 0;
$missingParticipations = [];

foreach ($races as $race) {
    $driversInRace = $race->laps()->distinct('driver_id')->count('driver_id');
    
    if ($driversInRace == $totalDrivers) {
        $racesWithAllDrivers++;
        echo "✅ Race {$race->id} ({$race->name}): {$driversInRace}/{$totalDrivers} drivers\n";
    } else {
        echo "❌ Race {$race->id} ({$race->name}): {$driversInRace}/{$totalDrivers} drivers MISSING\n";
        
        // Find missing drivers
        $driversInRace = $race->laps()->pluck('driver_id')->unique();
        $missingDrivers = $drivers->whereNotIn('id', $driversInRace);
        foreach ($missingDrivers as $driver) {
            $missingParticipations[] = "Race {$race->id} - Driver {$driver->id} ({$driver->first_name} {$driver->last_name})";
        }
    }
}

echo "\n=== SUMMARY ===\n";
echo "Races with ALL drivers: {$racesWithAllDrivers}/{$totalRaces}\n";

if (!empty($missingParticipations)) {
    echo "\n❌ Missing Participations:\n";
    foreach ($missingParticipations as $missing) {
        echo "  - {$missing}\n";
    }
} else {
    echo "\n✅ All drivers participate in all races!\n";
}
