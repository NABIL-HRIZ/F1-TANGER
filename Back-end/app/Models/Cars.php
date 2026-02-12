<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Team;
use App\Models\Driver;
use App\Models\Lap;


class Cars extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'car_number',
        'model',
        'brand',
        'chassis',
        'team_id',
        'driver_id',
        'engine',
        'year',
        'color',
        'horsepower',
        'weight',
        'image',
        'top_speed',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'year' => 'integer',
        'horsepower' => 'integer',
        'weight' => 'integer',
        'top_speed' => 'integer',
    ];

    /**
     * Get the team that owns the car.
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the driver that drives the car.
     */
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    /**
     * Get the laps for the car.
     */
    public function laps()
    {
        return $this->hasMany(Lap::class);
    }
}
