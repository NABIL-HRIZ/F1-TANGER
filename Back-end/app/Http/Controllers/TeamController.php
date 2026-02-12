<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;

class TeamController extends Controller
{
    public function index(Request $request)
    {
        $teams = Team::all();
        return response()->json([
            'data' => $teams,
            'count' => $teams->count()
        ]);
    }

    /**
     * Get only the count of teams for admin dashboard
     */
    public function indexAdminDashboard()
    {
        $count = Team::count();
        return response()->json([
            'count' => $count
        ]);
    }

    public function indexAdmin(Request $request)
    {
        $teams = Team::select('id', 'name', 'founded_date', 'country', 'base_location', 'total_points')
            ->withCount('drivers')
            ->when($request->search, fn($q) => $q->where('name', 'LIKE', '%' . $request->search . '%'))
            ->orderBy('total_points', 'desc')
            ->paginate(6);

        return response()->json($teams);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'country' => 'nullable|string|max:255',
            'base_location' => 'nullable|string|max:255',
            'team_principal' => 'nullable|string|max:255',
            'chassis' => 'nullable|string|max:255',
            'engine_supplier' => 'nullable|string|max:255',
            'founded_date' => 'nullable|date',
            'logo' => 'nullable|string|max:255',
            'total_points' => 'nullable|integer',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $team = $request->user()->teams()->create([
            'name' => $request->name,
            'country' => $request->country,
            'base_location' => $request->base_location,
            'team_principal' => $request->team_principal,
            'chassis' => $request->chassis,
            'engine_supplier' => $request->engine_supplier,
            'founded_date' => $request->founded_date,
            'logo' => $request->logo,
            'total_points' => $request->total_points,
            'user_id' => $request->user_id ?? $request->user()->id,
        ]);

        return response()->json($team, 201);
    }

    public function update(Request $request, $id)
    {
        $team = $request->user()->teams()->findOrFail($id);

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'country' => 'sometimes|nullable|string|max:255',
            'base_location' => 'sometimes|nullable|string|max:255',
            'team_principal' => 'sometimes|nullable|string|max:255',
            'chassis' => 'sometimes|nullable|string|max:255',
            'engine_supplier' => 'sometimes|nullable|string|max:255',
            'founded_date' => 'sometimes|nullable|date',
            'logo' => 'sometimes|nullable|string|max:255',
            'total_points' => 'sometimes|nullable|integer',
        ]);

        $team->update($request->only([
            'name',
            'country',
            'base_location',
            'team_principal',
            'chassis',
            'engine_supplier',
            'founded_date',
            'logo',
            'total_points',
        ]));

        return response()->json($team);
    }

    public function search(Request $request){
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $teams = Team::where('name', 'LIKE', '%' . $request->name . '%')
            ->paginate(6);

        return response()->json($teams);
    }

    // delete
    public function destroy(Request $request, $id)
    {
        $team = $request->user()->teams()->findOrFail($id);
        $team->delete();

        return response()->json(null, 204);
    }

    /**
     * Get current user's team
     */
    public function getTeam(Request $request)
    {
        $user = $request->user();
        
        // Get the first team created by this user with all relationships
        $team = Team::where('user_id', $user->id)
            ->with(['drivers', 'cars', 'laps'])
            ->withCount(['drivers', 'cars'])
            ->first();

        if (!$team) {
            return response()->json([
                'status' => 'error',
                'message' => 'User has no team assigned'
            ], 404);
        }

        // Count unique races instead of laps
        $racesCount = $team->laps()->distinct('race_id')->count('race_id');
        $team->races_count = $racesCount;

        return response()->json([
            'status' => 'success',
            'data' => $team
        ]);
    }

    /**
     * Get team's drivers
     */
    public function getTeamDrivers($teamId, Request $request)
    {
        $team = Team::findOrFail($teamId);
        $drivers = $team->drivers;

        return response()->json([
            'status' => 'success',
            'team_id' => $teamId,
            'team_name' => $team->name,
            'data' => $drivers
        ]);
    }

    /**
     * Get team's cars
     */
    public function getTeamCars($teamId, Request $request)
    {
        $team = Team::findOrFail($teamId);
        $cars = $team->cars;

        return response()->json([
            'status' => 'success',
            'team_id' => $teamId,
            'team_name' => $team->name,
            'data' => $cars
        ]);
    }
}
