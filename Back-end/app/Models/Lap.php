<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Race;
use App\Models\Driver;
use App\Models\Team;
use App\Models\Cars;

class Lap extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'race_id',
        'driver_id',
        'lap_number',
        'team_id',
        'car_id',
        'lap_time',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'lap_number' => 'integer',
    ];

    /**
     * Get the race that this lap belongs to.
     */
    public function race()
    {
        return $this->belongsTo(Race::class);
    }

    /**
     * Get the driver who completed this lap.
     */
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Get the team for this lap.
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the car used for this lap.
     */
    public function car()
    {
        return $this->belongsTo(Cars::class);
    }
}
