<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Race;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    
    public function buyTicket(Request $request, $raceId)
    {
        $race = Race::find($raceId);

        if (!$race) {
            return response()->json([
                'status' => 'error',
                'message' => 'Race not found'
            ], 404);
        }

        $validated = $request->validate([
            'buyer_name' => 'required|string|max:255',
            'buyer_email' => 'required|email|max:255',
            'seat_number' => 'required|string|max:50|unique:tickets,seat_number',
            'quantity' => 'nullable|integer|min:1|max:2',
        ]);

        $validated['race_id'] = $race->id;
        $quantity = $validated['quantity'] ?? 1;
        unset($validated['quantity']);

        $ticketsSold = Ticket::where('race_id', $race->id)->count();
        $ticketsAvailable = $race->nbr_tickets ?? 0;

        if ($ticketsSold + $quantity > $ticketsAvailable) {
            return response()->json([
                'status' => 'error',
                'message' => 'Not enough tickets available',
                'available' => $ticketsAvailable - $ticketsSold
            ], 422);
        }

        $ticket = Ticket::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket purchased successfully',
            'data' => [
                'id' => $ticket->id,
                'race_id' => $ticket->race_id,
                'race_name' => $race->name,
                'buyer_name' => $ticket->buyer_name,
                'buyer_email' => $ticket->buyer_email,
                'seat_number' => $ticket->seat_number,
                'created_at' => $ticket->created_at,
            ]
        ], 201);
    }

    public function countTicketsSold($raceId)
    {
        $ticketsSold = Ticket::where('race_id', $raceId)->count();
        return response()->json([
            'message' => 'Tickets sold retrieved successfully',
            'data' => [
                'race_id' => $raceId,
                'tickets_sold' => $ticketsSold
            ]
        ], 200);
    }
}