<?php

namespace App\Http\Controllers;

use App\Models\Standing;
use Illuminate\Http\Request;

class StandingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $standings = Standing::with('driver', 'team')
            ->where('year', date('Y'))
            ->orderBy('points', 'desc')
            ->get();

        $formattedStandings = $standings->map(function ($standing, $index) {
            return [
                'id' => $standing->id,
                'rank' => $index + 1,
                'driver' => [
                    'id' => $standing->driver->id,
                    'first_name' => $standing->driver->first_name,
                    'last_name' => $standing->driver->last_name,
                    'nationality' => $standing->driver->nationality,
                    'driver_img' => $standing->driver->driver_img,
                ],
                'team' => [
                    'id' => $standing->team->id,
                    'name' => $standing->team->name,
                    'logo' => $standing->team->logo,
                ],
                'points' => $standing->points,
                'year' => $standing->year,
            ];
        });

        return response()->json($formattedStandings);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Standing $standing)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Standing $standing)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Standing $standing)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Standing $standing)
    {
        //
    }
}
