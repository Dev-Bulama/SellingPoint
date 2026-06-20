<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushToken extends Model
{
    protected $fillable = ['user_id', 'player_id', 'device_type', 'app_version'];

    public function user() { return $this->belongsTo(User::class); }
}
