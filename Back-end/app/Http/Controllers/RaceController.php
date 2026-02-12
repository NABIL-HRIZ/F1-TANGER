<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Race;

class RaceController extends Controller
{
    public function index(){
        $races = Race::paginate(10);

        $formattedRaces = $races->map(function ($race) {
            return [
                'id' => $race->id,
                'name' => $race->name,
                'location' => $race->location,
                'date' => $race->date->format('Y-m-d'),
                'start_time' => $race->start_time,
                'status' => $race->status,
                'laps_nbr' => $race->laps_nbr,
                'nbr_tickets' => $race->nbr_tickets,
                'price' => $race->price,
                'img' => $race->img,
                'participants' => 20,
            ];
        });

        return response()->json([
            'data' => $formattedRaces,
            'pagination' => [
                'current_page' => $races->currentPage(),
                'per_page' => $races->perPage(),
                'total' => $races->total(),
                'last_page' => $races->lastPage(),
                'from' => $races->firstItem(),
                'to' => $races->lastItem(),
            ]
        ]);
    }

    /**
     * Get only the count of races for admin dashboard
     */
    public function indexAdminDashboard(){
        $count = Race::count();
        return response()->json([
            'count' => $count
        ]);
    }

    /**
     * Get top 6 races for dashboard schedule
     */
    public function topRacesForDashboard(){
        $topRaces = Race::limit(6)
            ->get()
            ->map(function ($race) {
                return [
                    'id' => $race->id,
                    'name' => $race->name,
                    'location' => $race->location,
                    'date' => $race->date->format('Y-m-d'),
                    'start_time' => $race->start_time,
                    'status' => $race->status,
                    'laps_nbr' => $race->laps_nbr,
                    'nbr_tickets' => $race->nbr_tickets,
                    'price' => $race->price,
                    'img' => $race->img,
                ];
            });

        return response()->json($topRaces);
    }

    /**
     * Get featured races sorted by date (upcoming races)
     */
    public function featuredRaces(){
        // Return the most recent past races (latest completed or held races)
        // so the frontend "Latest Race Results" section shows data.
        $featuredRaces = Race::where('date', '<=', now())
            ->orderBy('date', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($race) {
                return [
                    'id' => $race->id,
                    'name' => $race->name,
                    'location' => $race->location,
                    'date' => $race->date->format('Y-m-d'),
                    'start_time' => $race->start_time,
                    'status' => $race->status,
                    'laps_nbr' => $race->laps_nbr,
                    'nbr_tickets' => $race->nbr_tickets,
                    'price' => $race->price,
                    'img' => $race->img,
                ];
            });

        return response()->json($featuredRaces);
    }

    public function search(Request $request){
        $query = $request->get('q', '');
        
        $races = Race::where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('location', 'like', "%{$query}%")
                  ->orWhere('status', 'like', "%{$query}%");
            })
            ->paginate(10);

        $formattedRaces = $races->map(function ($race) {
            return [
                'id' => $race->id,
                'name' => $race->name,
                'location' => $race->location,
                'date' => $race->date->format('Y-m-d'),
                'start_time' => $race->start_time,
                'status' => $race->status,
                'laps_nbr' => $race->laps_nbr,
                'nbr_tickets' => $race->nbr_tickets,
                'price' => $race->price,
                'img' => $race->img
            ];
        });

        return response()->json([
            'message' => 'Search results',
            'query' => $query,
            'data' => $formattedRaces,
            'pagination' => [
                'current_page' => $races->currentPage(),
                'per_page' => $races->perPage(),
                'total' => $races->total(),
                'last_page' => $races->lastPage(),
                'from' => $races->firstItem(),
                'to' => $races->lastItem(),
            ]
        ], 200);
    }

    public function store(Request $request){
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'start_time' => 'nullable|string',
            'status' => 'required|in:scheduled,ongoing,completed',
            'nbr_tickets' => 'nullable|integer|min:0',
            'laps_nbr' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'img' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
        ]);

        $imgPath = null;

        if ($request->hasFile('img') && $request->file('img')->isValid()) {
            $image = $request->file('img');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('store/races'), $imageName);
            $imgPath = 'store/races/' . $imageName;
        }

        $race = Race::create([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'date' => $validated['date'],
            'start_time' => $validated['start_time'],
            'status' => $validated['status'],
            'nbr_tickets' => $validated['nbr_tickets'],
            'laps_nbr' => $validated['laps_nbr'],
            'price' => $validated['price'],
            'img' => $imgPath,
        ]);

        return response()->json([
            'message' => 'Race created successfully',
            'race' => $race
        ], 201);
    }

    public function edit($id){
        $race = Race::findOrFail($id);

        return response()->json([
            'message' => 'Race retrieved successfully',
            'race' => [
                'id' => $race->id,
                'name' => $race->name,
                'location' => $race->location,
                'date' => $race->date->format('Y-m-d'),
                'start_time' => $race->start_time,
                'status' => $race->status,
                'laps_nbr' => $race->laps_nbr,
                'nbr_tickets' => $race->nbr_tickets,
                'price' => $race->price,
                'img' => $race->img
            ]
        ], 200);
    }

    public function update(Request $request, $id){
        $race = Race::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'start_time' => 'nullable|string',
            'status' => 'required|in:scheduled,ongoing,completed',
            'laps_nbr' => 'nullable|integer|min:0',
            'nbr_tickets' => 'nullable|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'img' => 'nullable|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
        ]);

        // Update all fields
        $race->name = $validated['name'];
        $race->location = $validated['location'];
        $race->date = $validated['date'];
        $race->start_time = $validated['start_time'] ?? null;
        $race->status = $validated['status'];
        $race->laps_nbr = $validated['laps_nbr'] ?? null;
        $race->nbr_tickets = $validated['nbr_tickets'] ?? null;
        $race->price = $validated['price'] ?? null;

        // Handle image upload if provided
        if ($request->hasFile('img') && $request->file('img')->isValid()) {
            // Delete old image if exists
            if ($race->img && file_exists(public_path($race->img))) {
                unlink(public_path($race->img));
            }

            // Upload new image
            $image = $request->file('img');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('store/races'), $imageName);
            $race->img = 'store/races/' . $imageName;
        }

        $race->save();

        return response()->json([
            'message' => 'Race updated successfully',
            'race' => [
                'id' => $race->id,
                'name' => $race->name,
                'location' => $race->location,
                'date' => $race->date->format('Y-m-d'),
                'start_time' => $race->start_time,
                'status' => $race->status,
                'laps_nbr' => $race->laps_nbr,
                'nbr_tickets' => $race->nbr_tickets,
                'price' => $race->price,
                'img' => $race->img
            ]
        ], 200);
    }

    public function destroy($id){
        $race = Race::findOrFail($id);

        // Delete image if exists
        if ($race->img && file_exists(public_path($race->img))) {
            unlink(public_path($race->img));
        }

        $race->delete();

        return response()->json([
            'message' => 'Race deleted successfully',
            'deleted_id' => $id
        ], 200);
    }
}
