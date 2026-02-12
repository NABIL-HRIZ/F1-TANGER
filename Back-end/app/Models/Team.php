<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Driver;
use App\Models\Cars;
use App\Models\Standing;
use App\Models\Lap;

class Team extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'country',
        'base_location',
        'team_principal',
        'chassis',
        'engine_supplier',
        'founded_date',
        'logo',
        'total_points',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'founded_date' => 'date',
        'total_points' => 'integer',
    ];

    /**
     * Get the user that owns the team.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the drivers for the team.
     */
    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    /**
     * Get the cars for the team.
     */
    public function cars()
    {
        return $this->hasMany(Cars::class);
    }

    /**
     * Get the standings for the team.
     */
    public function standings()
    {
        return $this->hasMany(Standing::class);
    }

    /**
     * Get the laps for the team.
     */
    public function laps()
    {
        return $this->hasMany(Lap::class);
    }
}
