<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\TeamController;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\CarsController;
use App\Http\Controllers\RaceController;
use App\Http\Controllers\LapController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\StandingController;
use App\Http\Controllers\ClientController;


// Include authentication routes for API
require __DIR__.'/auth.php';

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

// Public routes

    // Team routes
Route::get('/teams', [TeamController::class, 'index']);
Route::get('/teams/search', [TeamController::class, 'search']);
Route::get('/teams/admin/dashboard', [TeamController::class, 'indexAdminDashboard']);
Route::get('/teams/admin/paginated', [TeamController::class, 'indexAdmin']);
    // Driver routes
Route::get('/drivers', [DriverController::class, 'index']);
Route::get('/drivers/search', [DriverController::class, 'search']);
Route::get('/drivers/admin/dashboard', [DriverController::class, 'indexAdminDashboard']);
Route::get('/drivers/top-drivers', [DriverController::class, 'topDriversForDashboard']);
    // Cars routes
Route::get('/cars', [CarsController::class, 'index']);
Route::get('/cars/search', [CarsController::class, 'search']);
    // Race routes
Route::get('/races', [RaceController::class, 'index']);
Route::get('/races/search', [RaceController::class, 'search']);
Route::get('/races/admin/dashboard', [RaceController::class, 'indexAdminDashboard']);
Route::get('/races/top-races', [RaceController::class, 'topRacesForDashboard']);
Route::get('/races/featured', [RaceController::class, 'featuredRaces']);
    // Standings/Championship routes
Route::get('/standings', [StandingController::class, 'index']);
    // Laps routes
Route::get('/laps', [LapController::class, 'index']);
Route::get('/laps/search', [LapController::class, 'search']);

// Authenticated routes
Route::middleware(['auth:sanctum'])->group(function () {
    // Profile routes
    Route::get('/profile', [ProfilController::class, 'edit']);
    Route::put('/profile', [ProfilController::class, 'update']);
    
    // Admin routes
    Route::post('/admin/teams/create', [ProfilController::class, 'createNewTeam']);
    Route::get('/admin/teams/edit/{id}', [ProfilController::class, 'editTeam']);
    Route::post('/admin/teams/update/{id}', [ProfilController::class, 'updateTeamAsAdmin']);
    Route::post('/admin/teams/simple-update/{id}', [ProfilController::class, 'updateTeamOnly']);
    Route::get('/admin/teams', [ProfilController::class, 'indexTeams']);
    Route::delete('/admin/teams/delete/{id}', [ProfilController::class, 'deleteTeam']);

    // Team routes
    Route::post('/teams/create', [TeamController::class, 'store']);
    Route::post('/teams/update/{id}', [TeamController::class, 'update']);
    Route::delete('/teams/delete/{id}', [TeamController::class, 'destroy']);
    
    // Driver routes
    Route::get('/admin/drivers', [DriverController::class, 'index']);
    Route::get('/admin/drivers/search', [DriverController::class, 'search']);
    Route::get('/admin/drivers/edit/{id}', [DriverController::class, 'edit']);
    Route::post('/admin/drivers/create', [DriverController::class, 'store']);
    Route::post('/admin/drivers/update/{id}', [DriverController::class, 'update']);
    Route::delete('/admin/drivers/delete/{id}', [DriverController::class, 'destroy']);
    // Cars routes
    Route::post('/admin/cars/create', [CarsController::class, 'store']);
    Route::get('/admin/cars', [CarsController::class, 'index']);
    Route::get('/admin/cars/search', [CarsController::class, 'search']);
    Route::get('/admin/cars/edit/{id}', [CarsController::class, 'edit']);
    Route::post('/admin/cars/update/{id}', [CarsController::class, 'update']);
    Route::delete('/admin/cars/delete/{id}', [CarsController::class, 'destroy']);
    // Race routes
    Route::post('/admin/race/create', [RaceController::class, 'store']);
    Route::get('/admin/races', [RaceController::class, 'index']);
    Route::get('/admin/race/search', [RaceController::class, 'search']);
    Route::get('/admin/race/edit/{id}', [RaceController::class, 'edit']);
    Route::post('/admin/race/update/{id}', [RaceController::class, 'update']);
    Route::delete('/admin/race/delete/{id}', [RaceController::class, 'destroy']);
    // Laps routes
    Route::get('/admin/laps', [LapController::class, 'index']);
    Route::get('/admin/laps/search', [LapController::class, 'search']);
    Route::get('/admin/laps/race/{raceId}', [LapController::class, 'getByRace']);
    Route::get('/admin/laps/edit/{id}', [LapController::class, 'edit']);
    Route::post('/admin/laps/create', [LapController::class, 'store']);
    Route::post('/admin/laps/update/{id}', [LapController::class, 'update']);
    Route::delete('/admin/laps/delete/{id}', [LapController::class, 'destroy']);
    // Ticket routes
    Route::post('/tickets/create', [DriverController::class, 'ticketsStore']);

    // Team User routes
    Route::get('/team', [TeamController::class, 'getTeam']);
    Route::get('/team/{teamId}/drivers', [TeamController::class, 'getTeamDrivers']);
    Route::get('/team/{teamId}/cars', [TeamController::class, 'getTeamCars']);
    Route::get('/driver/{driverId}/performance', [DriverController::class, 'getPerformance']);

    // Client routes
    Route::get('/client', [ClientController::class, 'getProfile']);
    Route::get('/client/tickets', [ClientController::class, 'getTickets']);
    Route::put('/client/profile', [ClientController::class, 'updateProfile']);
    Route::post('/client/change-password', [ClientController::class, 'changePassword']);
});