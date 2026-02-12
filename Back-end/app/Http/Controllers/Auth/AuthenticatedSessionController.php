<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $user = Auth::user();
        $user->load(['roles', 'client']); // Load both roles and client relationship
        
        // Create Sanctum token for API
        $token = $user->createToken('api-token')->plainTextToken;

        // Determine redirect based on user role
        $redirect = '/dashboard';  // Default fallback
        
        if ($user->hasRole('admin')) {
            $redirect = '/dashboard/admin';
        } elseif ($user->hasRole('team')) {
            $redirect = '/dashboard/team';
        } elseif ($user->hasRole('client')) {
            $redirect = '/dashboard/client';
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'redirect' => $redirect,  // ← Backend determines redirect based on role
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        // Delete current access token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }
}
