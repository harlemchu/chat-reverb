<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = ['user_id', 'content'];

    protected $with = ['user']; // eager load user for broadcasting

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
