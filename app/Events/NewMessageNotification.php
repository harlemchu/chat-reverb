<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

class NewMessageNotification implements ShouldBroadcast
{
    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message->load('user');
    }

    public function broadcastOn()
    {
        // Send to each participant's private channel (excluding the sender)
        $recipients = $this->message->conversation->users
            ->pluck('id')
            ->filter(fn($id) => $id !== $this->message->user_id);

        return $recipients->map(fn($id) => new PrivateChannel('user.' . $id))->values()->toArray();
    }

    public function broadcastAs()
    {
        return 'new.message';
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'content' => $this->message->body,
            'conversation_id' => $this->message->conversation_id,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
            ],
            'created_at' => $this->message->created_at->toISOString(),
        ];
    }
}