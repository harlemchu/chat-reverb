<?php

use App\Models\Conversation;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class PrivateConversationCreated implements ShouldBroadcastNow
{
    public $conversation;

    public function __construct(Conversation $conversation)
    {
        $this->conversation = $conversation->load('users', 'last_message');
    }

    public function broadcastOn()
    {
        // Send to the other user only (not the creator)
        $otherUser = $this->conversation->users->firstWhere('id', '!=', $this->conversation->users->firstWhere('pivot.user_id', auth()->id())?->id ?? auth()->id());
        return new PrivateChannel('user.' . $otherUser->id);
    }

    public function broadcastAs()
    {
        return 'private.conversation.created';
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