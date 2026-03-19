<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = ['type', 'name'];

    protected $casts = [
        'type' => 'string',
    ];

    /**
     * Users in this conversation.
     */
    public function users()
    {
        return $this->belongsToMany(User::class)
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    /**
     * Messages in this conversation.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the other user in a private conversation.
     */
    public function otherUser($currentUserId)
    {
        if ($this->type === 'group') {
            return null;
        }
        return $this->users()->where('user_id', '!=', $currentUserId)->first();
    }

    /**
     * Mark the conversation as read for a user.
     */
    public function markAsReadForUser($userId)
    {
        $this->users()->updateExistingPivot($userId, [
            'last_read_at' => now(),
        ]);
    }

    /**
     * Get unread count for a user.
     */
    public function unreadCountForUser($userId)
    {
        $lastRead = $this->users()
            ->where('user_id', $userId)
            ->first()
            ?->pivot
            ->last_read_at;

        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->when($lastRead, fn($q) => $q->where('created_at', '>', $lastRead))
            ->count();
    }
}