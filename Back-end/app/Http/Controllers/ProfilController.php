<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Team;

class ProfilController extends Controller
{
    /**
     * Get current user profile data
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        
        // Load client relationship if exists
        $user->load('clients');
        
        // Get client data if user has client profile
        $client = $user->clients->first();
        
        return response()->json([
            'message' => 'User profile retrieved successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'client' => $client ? [
                'cin' => $client->cin,
                'phone_nbr' => $client->phone_nbr,
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at,
            ] : null
        ], 200);
    }

    
    public function update(Request $request)
    {
        $user = $request->user();
        
        // Validate input
        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'password' => ['sometimes', 'required', 'confirmed', Password::defaults()],
            'current_password' => ['required', 'string'],
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['password incorrect.'],
            ]);
        }

        // Check if user is trying to make changes
        $hasChanges = false;
        
        // Update name if provided and different
        if ($request->has('name') && $request->name !== $user->name) {
            $user->name = $request->name;
            $hasChanges = true;
        }
        
        // Update password if provided
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
            $hasChanges = true;
        }

        // If no changes were made
        if (!$hasChanges) {
            return response()->json([
                'message' => 'No changes were made to your profile.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ]
            ], 200);
        }

        // Save changes
        $user->save();

        // Revoke all tokens if password was changed (security measure)
        if ($request->has('password')) {
            $user->tokens()->delete();
            
            // Create new token
            $newToken = $user->createToken('API Token')->plainTextToken;
            
            return response()->json([
                'message' => 'Profile updated successfully. Password changed - please use the new token.',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
                'new_token' => $newToken
            ], 200);
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ]
        ], 200);
    }

    public function createNewTeam(Request $request)
    {
        try {
            $currentUser = $request->user();

            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'country' => ['required', 'string', 'max:255'],
                'base_location' => ['required', 'string', 'max:255'],
                'team_principal' => ['required', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'string', Password::defaults()],
                'chassis' => ['required', 'string', 'max:255'],
                'engine_supplier' => ['required', 'string', 'max:255'],
                'founded_date' => ['required', 'date'],
                'logo' => ['required', 'file', 'mimes:webp,jpeg,jpg,png,gif', 'max:2048'],
                'total_points' => ['sometimes', 'integer', 'min:0'],
            ]);

            // Create user for the team
            $teamUser = User::create([
                'name' => $request->team_principal,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // Handle logo upload to your specified directory
            $logoPath = null;
            if ($request->hasFile('logo')) {
                $logo = $request->file('logo');
                $logoName = time() . '_' . $logo->getClientOriginalName();
                $logo->move(public_path('store/teams'), $logoName);
                $logoPath = 'store/teams/' . $logoName;
            }

            // Create team
            $team = new Team();
            $team->name = $request->name;
            $team->country = $request->country;
            $team->base_location = $request->base_location;
            $team->team_principal = $request->team_principal;
            $team->chassis = $request->chassis;
            $team->engine_supplier = $request->engine_supplier;
            $team->founded_date = $request->founded_date;
            $team->total_points = $request->total_points ?? 0;
            $team->user_id = $teamUser->id;
            $team->logo = $logoPath;
            $team->save();

            $teamUser->addRole('team');

            return response()->json([
                'message' => 'Team and associated user created successfully',
                'team' => $team,
                'team_user' => [
                    'id' => $teamUser->id,
                    'name' => $teamUser->name,
                    'email' => $teamUser->email,
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    // edit team ( for get data of selected team )
    public function editTeam(Request $request, $id)
    {
        $team = Team::find($id);
        if (!$team) {
            return response()->json([
                'message' => 'Team not found'
            ], 404);
        }

        return response()->json([
            'message' => 'Team retrieved successfully',
            'team' => $team
        ], 200);
    }


    // update team ( for update data of selected team )
    public function updateTeamAsAdmin(Request $request, $id)
    {

        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'message' => 'Team not found'
            ], 404);
        }

        $request->validate([
                'name' => ['sometimes', 'required', 'string', 'max:255'],
                'country' => ['sometimes', 'required', 'string', 'max:255'],
                'base_location' => ['sometimes', 'required', 'string', 'max:255'],
                'team_principal' => ['sometimes', 'required', 'string', 'max:255'],
                'chassis' => ['sometimes', 'required', 'string', 'max:255'],
                'engine_supplier' => ['sometimes', 'required', 'string', 'max:255'],
                'founded_date' => ['sometimes', 'required', 'date'],
                'total_points' => ['sometimes', 'integer', 'min:0'],
                'logo' => ['sometimes', 'file', 'mimes:webp,jpeg,jpg,png,gif', 'max:2048'],
                'password' => ['sometimes', 'required', 'confirmed', Password::defaults()],
        ]);

        // Store original values for comparison
        $originalTeam = $team->toArray();

        // Update team fields if provided
        $fieldsToUpdate = $request->only([
            'name', 'country', 'base_location', 
            'team_principal', 'chassis', 
            'engine_supplier', 'founded_date', 
            'total_points'
        ]);

        foreach ($fieldsToUpdate as $key => $value) {
            if ($value !== null && $value !== '') {
                $team->$key = $value;
            }
        }

        if ($request->hasFile('logo')) {
            // Delete old logo file if exists
            if ($team->logo && file_exists(public_path($team->logo))) {
                unlink(public_path($team->logo));
            }

            $logo = $request->file('logo');
            $logoName = time() . '_' . $logo->getClientOriginalName();
            $logo->move(public_path('store/teams'), $logoName);
            $team->logo = 'store/teams/' . $logoName;
        }

        // Save team first
        $saved = $team->save();

        // Update associated user separately
        if (($request->has('team_principal') || $request->has('password')) && $team->user_id) {
            $teamUser = User::find($team->user_id);
            if ($teamUser) {
                if ($request->has('team_principal') && $request->team_principal !== '') {
                    // \Log::info("Updating user name: '{$teamUser->name}' → '{$request->team_principal}'");
                    $teamUser->name = $request->team_principal;
                }

                if ($request->has('password') && $request->password !== '') {
                    // \Log::info('Updating user password');
                    $teamUser->password = Hash::make($request->password);
                }
                $userSaved = $teamUser->save();
            }
        }

        // Get fresh data
        $freshTeam = $team->fresh();

        return response()->json([
            'message' => 'Team updated successfully',
            'team' => $freshTeam,
            'debug' => [
                'fields_sent' => array_keys($fieldsToUpdate),
                'original_data' => $originalTeam,
                'updated_data' => $freshTeam->toArray()
            ]
        ], 200);
    }

    public function indexTeams(){
        $teams = Team::select('logo', 'name', 'team_principal', 'country')->paginate(10);
        return response()->json($teams);
    }

    // Delete team
    public function deleteTeam(Request $request, $id)
    {
        $team = Team::find($id);
        if (!$team) {
            return response()->json([
                'message' => 'Team not found'
            ], 404);
        }

        // Also delete associated user
        $teamUser = User::find($team->user_id);
        if ($teamUser) {
            $teamUser->delete();
        }

        // Delete team logo file if exists
        if ($team->logo && file_exists(public_path($team->logo))) {
            unlink(public_path($team->logo));
        }

        $team->delete();

        return response()->json([
            'message' => 'Team and associated user deleted successfully'
        ], 200);
    }
    

}