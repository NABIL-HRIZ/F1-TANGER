<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class ClientController extends Controller
{
    /**
     * Get current client's tickets
     */
    public function getTickets()
    {
        $user = Auth::user();
        $client = $user->client;

        if (!$client) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        $tickets = $client->tickets()->with('race')->get();

        return response()->json($tickets, 200);
    }

    /**
     * Get client data
     */
    public function getProfile()
    {
        $user = Auth::user();
        $client = $user->client;

        if (!$client) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        return response()->json([
            'id' => $client->id,
            'cin' => $client->cin,
            'phone_nbr' => $client->phone_nbr,
            'user_id' => $client->user_id,
        ], 200);
    }

    /**
     * Update client profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $client = $user->client;

        if (!$client) {
            return response()->json(['message' => 'Client not found'], 404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'cin' => ['required', 'string', 'max:20'],
        ]);

        // Update user name
        $user->update(['name' => $validated['name']]);

        // Update client phone and cin
        $client->update([
            'phone_nbr' => $validated['phone'],
            'cin' => $validated['cin'],
        ]);

        $user->load('client');

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ], 200);
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password changed successfully',
        ], 200);
    }
}
