<?php

namespace App\Events;

use App\Models\Conversation;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// app/Events/UserAddedToGroup.php
class UserAddedToGroup implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $conversation;
    public $addedUserId;

    public function __construct(Conversation $conversation, int $addedUserId)
    {
        $this->conversation = $conversation->load('users');
        $this->addedUserId = $addedUserId;
    }

    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->addedUserId);
    }

    public function broadcastAs()
    {
        return 'user.added.to.group';
    }

    public function broadcastWith()
    {
        return [
            'conversation' => [
                'id' => $this->conversation->id,
                'name' => $this->conversation->name,
                'type' => 'group',
                'users' => $this->conversation->users->map(fn($u) => ['id' => $u->id, 'name' => $u->name]),
                'last_message' => null,
                'unread_count' => 0,
                'updated_at' => $this->conversation->updated_at->toISOString(),
            ],
        ];
    }
}