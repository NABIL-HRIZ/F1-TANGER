<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Driver;

class DriverController extends Controller
{   
    public function index(Request $request){
        $drivers = Driver::with('team:id,name')
            ->when($request->search, fn($q) => $q->where('first_name', 'LIKE', '%' . $request->search . '%')
                ->orWhere('last_name', 'LIKE', '%' . $request->search . '%'))
            ->orderBy('total_points', 'desc')
            ->paginate(6);

        $formattedDrivers = $drivers->map(function ($driver) {
            return [
                'id' => $driver->id,
                'first_name' => $driver->first_name,
                'last_name' => $driver->last_name,
                'nationality' => $driver->nationality,
                'date_of_birth' => $driver->date_of_birth,
                'team' => $driver->team,
                'total_points' => $driver->total_points,
                'driver_img' => $driver->driver_img,
            ];
        });

        return response()->json([
            'data' => $formattedDrivers,
            'current_page' => $drivers->currentPage(),
            'last_page' => $drivers->lastPage(),
            'total' => $drivers->total(),
            'per_page' => $drivers->perPage(),
        ]);
    }

    /**
     * Get only the count of drivers for admin dashboard
     */
    public function indexAdminDashboard(){
        $count = Driver::count();
        return response()->json([
            'count' => $count
        ]);
    }

    /**
     * Get top 5 drivers sorted by total_points for dashboard
     */
    public function topDriversForDashboard(){
        $topDrivers = Driver::with('team:id,name')
            ->orderBy('total_points', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($driver) {
                return [
                    'id' => $driver->id,
                    'first_name' => $driver->first_name,
                    'last_name' => $driver->last_name,
                    'team' => $driver->team,
                    'total_points' => $driver->total_points,
                    'driver_img' => $driver->driver_img,
                ];
            });

        return response()->json($topDrivers);
    }

    public function search(Request $request){
        $query = $request->get('q', '');
        
        $drivers = Driver::with('team:id,name')
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                  ->orWhere('last_name', 'like', "%{$query}%")
                  ->orWhere('nationality', 'like', "%{$query}%")
                  ->orWhereHas('team', function ($teamQuery) use ($query) {
                      $teamQuery->where('name', 'like', "%{$query}%");
                  });
            })
            ->paginate(10);

        $formattedDrivers = $drivers->map(function ($driver) {
            return [
                'id' => $driver->id,
                'full_name' => $driver->first_name . ' ' . $driver->last_name,
                'nationality' => $driver->nationality,
                'team_name' => $driver->team?->name ?? 'N/A',
                'total_points' => $driver->total_points,
            ];
        });

        return response()->json([
            'message' => 'Search results',
            'query' => $query,
            'data' => $formattedDrivers,
            'pagination' => [
                'current_page' => $drivers->currentPage(),
                'per_page' => $drivers->perPage(),
                'total' => $drivers->total(),
                'last_page' => $drivers->lastPage(),
                'from' => $drivers->firstItem(),
                'to' => $drivers->lastItem(),
            ]
        ], 200);
    }

    public function store(Request $request){

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'nationality' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'team_id' => 'required|integer|exists:teams,id',
            'total_points' => 'nullable|integer',
            'driver_img' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp|max:2048',
        ]);

        $driverImgPath = null;

        if ($request->hasFile('driver_img')) {
            $image = $request->file('driver_img');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('store/drivers'), $imageName);
            $driverImgPath = 'store/drivers/' . $imageName;
        }

        $driver = Driver::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'team_id' => $request->team_id,
            'nationality' => $request->nationality,
            'date_of_birth' => $request->date_of_birth,
            'total_points' => $request->total_points,
            'driver_img' => $driverImgPath,
        ]);

        return response()->json([
            'message' => 'Driver created successfully',
            'driver' => $driver
        ], 201);
    }

    public function edit($id){
        $driver = Driver::with('team:id,name')->findOrFail($id);

        return response()->json([
            'message' => 'Driver retrieved successfully',
            'driver' => [
                'id' => $driver->id,
                'first_name' => $driver->first_name,
                'last_name' => $driver->last_name,
                'nationality' => $driver->nationality,
                'date_of_birth' => $driver->date_of_birth,
                'team_id' => $driver->team_id,
                'team_name' => $driver->team?->name ?? 'N/A',
                'total_points' => $driver->total_points,
                'driver_img' => $driver->driver_img,
                'created_at' => $driver->created_at,
                'updated_at' => $driver->updated_at,
            ]
        ], 201);
    }

    public function update(Request $request, $id){
        $driver = Driver::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'nationality' => 'sometimes|required|string|max:255',
            'date_of_birth' => 'sometimes|required|date',
            'team_id' => 'sometimes|required|integer|exists:teams,id',
            'total_points' => 'sometimes|nullable|integer',
            'driver_img' => 'sometimes|nullable|file|mimes:jpeg,jpg,png,gif,webp|max:2048',
        ]);

        // Only update fields that were provided in the request (except driver_img)
        foreach ($validated as $key => $value) {
            if ($key !== 'driver_img') {
                $driver->$key = $value;
            }
        }

        // Handle driver image upload if provided
        if ($request->hasFile('driver_img')) {
            // Delete old image if exists
            if ($driver->driver_img && file_exists(public_path($driver->driver_img))) {
                unlink(public_path($driver->driver_img));
            }

            // Upload new image
            $image = $request->file('driver_img');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('store/drivers'), $imageName);
            $driver->driver_img = 'store/drivers/' . $imageName;
        }

        $driver->save();

        return response()->json([
            'message' => 'Driver updated successfully',
            'driver' => $driver
        ], 200);
    }

    public function destroy($id){
        $driver = Driver::findOrFail($id);

        // Delete driver image if exists
        if ($driver->driver_img && file_exists(public_path($driver->driver_img))) {
            unlink(public_path($driver->driver_img));
        }

        $driver->delete();

        return response()->json([
            'message' => 'Driver deleted successfully',
            'deleted_id' => $id
        ], 200);
    }

    /**
     * Get driver performance statistics
     */
    public function getPerformance($driverId)
    {
        $driver = Driver::findOrFail($driverId);
        
        // Get all laps for this driver
        $laps = \App\Models\Lap::where('driver_id', $driverId)
            ->with(['race'])
            ->get();

        // Group laps by race and calculate stats
        $raceStats = $laps->groupBy('race_id')->map(function($raceLaps) {
            $race = $raceLaps->first()->race;
            
            // Find best lap time and calculate total race time
            $bestLap = null;
            $bestLapMs = PHP_INT_MAX;
            $totalMs = 0;
            
            foreach ($raceLaps as $lap) {
                // Convert HH:MM:SS:MMM format to milliseconds
                $parts = explode(':', $lap->lap_time);
                if (count($parts) === 4) {
                    $ms = (int)$parts[0] * 3600000 + (int)$parts[1] * 60000 + (int)$parts[2] * 1000 + (int)$parts[3];
                    $totalMs += $ms;
                    
                    if ($ms < $bestLapMs) {
                        $bestLapMs = $ms;
                        $bestLap = $lap->lap_time;
                    }
                }
            }
            
            // Convert total time back to HH:MM:SS:MMM format
            $totalTimeFormatted = $this->millisecondsToTimeFormat($totalMs);
            
            return [
                'race_id' => $race->id,
                'race_name' => $race->name,
                'lap_count' => $raceLaps->count(),
                'best_lap_time' => $bestLap ?? 'N/A',
                'total_time' => $totalTimeFormatted,
                'position' => $raceLaps->count() > 0 ? $raceLaps->count() : 'DNF',
                'points' => 0, // Will be calculated from race results
            ];
        })->values();

        return response()->json([
            'status' => 'success',
            'driver_id' => $driverId,
            'driver_name' => $driver->first_name . ' ' . $driver->last_name,
            'data' => $raceStats
        ]);
    }
    
    /**
     * Convert milliseconds to HH:MM:SS:MMM format
     */
    private function millisecondsToTimeFormat($ms)
    {
        $hours = intdiv($ms, 3600000);
        $ms = $ms % 3600000;
        $minutes = intdiv($ms, 60000);
        $ms = $ms % 60000;
        $seconds = intdiv($ms, 1000);
        $milliseconds = $ms % 1000;
        
        return sprintf('%02d:%02d:%02d:%03d', $hours, $minutes, $seconds, $milliseconds);
    }
}
