<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Team;
use App\Models\Driver;

class Standing extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'team_id',
        'driver_id',
        'points',
        'year',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'points' => 'integer',
        'year' => 'integer',
    ];

    /**
     * Get the team for this standing.
     */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the driver for this standing.
     */
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }
}
