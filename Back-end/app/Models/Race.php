<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Lap;
use App\Models\Ticket;

class Race extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'location',
        'date',
        'start_time',
        'status',
        'laps_nbr',
        'nbr_tickets',
        'price',
        'img'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'date',
        'price' => 'decimal:2',
    ];

    /**
     * Get the laps for this race.
     */
    public function laps()
    {
        return $this->hasMany(Lap::class);
    }

    /**
     * Get the tickets for this race.
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }
}
