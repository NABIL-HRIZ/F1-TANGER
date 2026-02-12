<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Race;
use App\Models\Client;

class Ticket extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'race_id',
        'client_id',
        'ticket_code',
        'issue_date',
        'expiry_date',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'issue_date' => 'date',
        'expiry_date' => 'date',
    ];

    /**
     * Get the race that the ticket is for.
     */
    public function race()
    {
        return $this->belongsTo(Race::class);
    }

    /**
     * Get the client that owns the ticket.
     */
    public function client()
    {
        return $this->belongsTo(Client::class);
    }
}
