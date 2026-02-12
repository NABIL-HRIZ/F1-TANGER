<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cars;

class CarsController extends Controller
{
    public function index(Request $request){
        $cars = Cars::with('team:id,name', 'driver:id,first_name,last_name')
            ->when($request->search, fn($q) => $q->where('model', 'LIKE', '%' . $request->search . '%')
                ->orWhere('brand', 'LIKE', '%' . $request->search . '%')
                ->orWhere('car_number', 'LIKE', '%' . $request->search . '%'))
            ->orderBy('car_number', 'asc')
            ->paginate(6);

        $formattedCars = $cars->map(function ($car) {
            return [
                'id' => $car->id,
                'car_number' => $car->car_number,
                'model' => $car->model,
                'brand' => $car->brand,
                'team_id' => $car->team_id,
                'team_name' => $car->team?->name ?? 'N/A',
                'driver_id' => $car->driver_id,
                'driver_name' => ($car->driver ? $car->driver->first_name . ' ' . $car->driver->last_name : 'N/A'),
                'status' => $car->status,
                'horsepower' => $car->horsepower,
                'top_speed' => $car->top_speed,
            ];
        });

        return response()->json([
            'data' => $formattedCars,
            'current_page' => $cars->currentPage(),
            'last_page' => $cars->lastPage(),
            'total' => $cars->total(),
            'per_page' => $cars->perPage(),
        ]);
    }

    public function search(Request $request){
        $query = $request->get('q', '');
        
        $cars = Cars::with('team:id,name', 'driver:id,first_name,last_name')
            ->where(function ($q) use ($query) {
                $q->where('model', 'like', "%{$query}%")
                  ->orWhere('brand', 'like', "%{$query}%")
                  ->orWhere('car_number', 'like', "%{$query}%")
                  ->orWhere('status', 'like', "%{$query}%")
                  ->orWhereHas('team', function ($teamQuery) use ($query) {
                      $teamQuery->where('name', 'like', "%{$query}%");
                  })
                  ->orWhereHas('driver', function ($driverQuery) use ($query) {
                      $driverQuery->where('first_name', 'like', "%{$query}%")
                                  ->orWhere('last_name', 'like', "%{$query}%");
                  });
            })
            ->paginate(10);

        $formattedCars = $cars->map(function ($car) {
            return [
                'id' => $car->id,
                'car_number' => $car->car_number,
                'model' => $car->model,
                'brand' => $car->brand,
                'team_name' => $car->team?->name ?? 'N/A',
                'driver_name' => ($car->driver ? $car->driver->first_name . ' ' . $car->driver->last_name : 'N/A'),
                'status' => $car->status,
                'horsepower' => $car->horsepower,
                'top_speed' => $car->top_speed,
            ];
        });

        return response()->json([
            'message' => 'Search results',
            'query' => $query,
            'data' => $formattedCars,
            'pagination' => [
                'current_page' => $cars->currentPage(),
                'per_page' => $cars->perPage(),
                'total' => $cars->total(),
                'last_page' => $cars->lastPage(),
                'from' => $cars->firstItem(),
                'to' => $cars->lastItem(),
            ]
        ], 200);
    }

    public function store(Request $request){
        $request->validate([
            'car_number' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'chassis' => 'required|string|max:255',
            'team_id' => 'required|integer|exists:teams,id',
            'driver_id' => 'nullable|integer|exists:drivers,id',
            'engine' => 'nullable|string|max:255',
            'year' => 'required|integer',
            'color' => 'nullable|string|max:255',
            'horsepower' => 'nullable|integer',
            'weight' => 'nullable|integer',
            'image' => 'nullable|file|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'top_speed' => 'nullable|integer',
            'status' => 'nullable|string|max:255',
        ]);

        $imagePath = null;

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('store/cars'), $imageName);
            $imagePath = 'store/cars/' . $imageName;
        }

        $car = Cars::create([
            'car_number' => $request->car_number,
            'model' => $request->model,
            'brand' => $request->brand,
            'chassis' => $request->chassis,
            'team_id' => $request->team_id,
            'driver_id' => $request->driver_id,
            'engine' => $request->engine,
            'year' => $request->year,
            'color' => $request->color,
            'horsepower' => $request->horsepower,
            'weight' => $request->weight,
            'image' => $imagePath,
            'top_speed' => $request->top_speed,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Car created successfully',
            'car' => $car
        ], 201);
    }

    public function edit($id){
        $car = Cars::with('team:id,name', 'driver:id,first_name,last_name')->findOrFail($id);

        return response()->json([
            'message' => 'Car retrieved successfully',
            'car' => [
                'id' => $car->id,
                'car_number' => $car->car_number,
                'model' => $car->model,
                'brand' => $car->brand,
                'chassis' => $car->chassis,
                'team_id' => $car->team_id,
                'team_name' => $car->team?->name,
                'driver_id' => $car->driver_id,
                'driver_name' => ($car->driver ? $car->driver->first_name . ' ' . $car->driver->last_name : 'N/A'),
                'engine' => $car->engine,
                'year' => $car->year,
                'color' => $car->color,
                'horsepower' => $car->horsepower,
                'weight' => $car->weight,
                'image' => $car->image,
                'top_speed' => $car->top_speed,
                'status' => $car->status
            ]
        ], 200);
    }

    public function update(Request $request, $id){
        $car = Cars::findOrFail($id);

        $validated = $request->validate([
            'car_number' => 'sometimes|required|string|max:255',
            'model' => 'sometimes|required|string|max:255',
            'brand' => 'sometimes|required|string|max:255',
            'chassis' => 'sometimes|required|string|max:255',
            'team_id' => 'sometimes|required|integer|exists:teams,id',
            'driver_id' => 'sometimes|nullable|integer|exists:drivers,id',
            'engine' => 'sometimes|nullable|string|max:255',
            'year' => 'sometimes|required|integer',
            'color' => 'sometimes|nullable|string|max:255',
            'horsepower' => 'sometimes|nullable|integer',
            'weight' => 'sometimes|nullable|integer',
            'image' => 'sometimes|nullable|file|mimes:jpeg,jpg,png,gif,webp|max:2048',
            'top_speed' => 'sometimes|nullable|integer',
            'status' => 'sometimes|nullable|string|max:255',
        ]);

        foreach ($validated as $key => $value) {
            if ($key !== 'image') {
                $car->$key = $value;
            }
        }

        if ($request->hasFile('image')) {
            if ($car->image && file_exists(public_path($car->image))) {
                unlink(public_path($car->image));
            }

            $image = $request->file('image');
            $imageName = time() . '_' . $image->getClientOriginalName();
            $image->move(public_path('store/cars'), $imageName);
            $car->image = 'store/cars/' . $imageName;
        }

        $car->save();

        return response()->json([
            'message' => 'Car updated successfully',
            'car' => $car
        ], 200);
    }

    public function destroy($id){
        $car = Cars::findOrFail($id);

        // Delete image if exists
        if ($car->image && file_exists(public_path($car->image))) {
            unlink(public_path($car->image));
        }

        $car->delete();

        return response()->json([
            'message' => 'Car deleted successfully',
            'deleted_id' => $id
        ], 200);
    }
}
