<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Team;
use App\Models\Cars;
use App\Models\Standing;
use App\Models\Lap;

class Driver extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'nationality',
        'date_of_birth',
        'team_id',
        'total_points',
        'driver_img',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'total_points' => 'integer',
    ];

    /**
     * Get the team that owns the driver.
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the cars for the driver.
     */
    public function cars()
    {
        return $this->hasMany(Cars::class);
    }

    /**
     * Get the standings for the driver.
     */
    public function standings()
    {
        return $this->hasMany(Standing::class);
    }

    /**
     * Get the laps for the driver.
     */
    public function laps()
    {
        return $this->hasMany(Lap::class);
    }

    /**
     * Get the driver's full name.
     *
     * @return string
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}
