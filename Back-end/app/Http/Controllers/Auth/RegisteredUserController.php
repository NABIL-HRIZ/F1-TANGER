<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Client;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'phone' => ['required', 'string', 'max:20'],
            'cin' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign client role automatically
        $user->addRole('client');

        // Create client record with proper error handling
        try {
            Client::create([
                'user_id' => $user->id,
                'phone_nbr' => $request->phone,
                'cin' => $request->cin,
            ]);
        } catch (\Exception $e) {
            // Log error but don't fail the registration
            \Log::error('Client creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'User created but client profile failed: ' . $e->getMessage(),
                'error' => true,
            ], 500);
        }

        event(new Registered($user));

        Auth::login($user);

        // Create an API token
        $token = $user->createToken('API Token')->plainTextToken;

        // Load roles for the response
        $user->load('roles');

        // Determine redirect based on user role (should be client)
        $redirect = '/dashboard/client';

        return response()->json([
            'message' => 'User registered successfully!',
            'user' => $user,
            'token' => $token,
            'redirect' => $redirect,
        ], 201);
    }
}
