<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class ConversationUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $conversationId;
    public $lastMessage;
    public $unreadCount;
    private $recipientId; // store it for broadcastOn
    /**
     * Create a new event instance.
     */
    public function __construct(Conversation $conversation, int $recipientId)
    {
        $this->conversationId = $conversation->id;
        $this->recipientId = $recipientId;

        // Load the last message (the one just sent)
        $lastMessage = $conversation->messages()->latest()->first();
        $this->lastMessage = $lastMessage ? [
            'id' => $lastMessage->id,
            'content' => $lastMessage->content,
            'created_at' => $lastMessage->created_at->toISOString(),
            'user' => [
                'id' => $lastMessage->user->id,
                'name' => $lastMessage->user->name,
            ],
        ] : null;

        // Calculate the unread count for this recipient
        $this->unreadCount = $conversation->unreadCountForUser($recipientId);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn()
    {
        // Broadcast to the specific recipient's private channel
        return new PrivateChannel('user.' . $this->recipientId);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs()
    {
        return 'conversation.updated';
    }

    /**
     * Data to broadcast.
     */
    public function broadcastWith()
    {
        return [
            'conversation_id' => $this->conversationId,
            'last_message' => $this->lastMessage,
            'unread_count' => $this->unreadCount,
        ];
    }
}