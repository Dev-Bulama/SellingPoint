<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportIssue extends Model
{
    protected $fillable = [
        'user_id',
        'issue_type',
        'description',
        'order_number',
        'status',
        'admin_reply',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
