<?php

namespace App\Events;

use App\Models\Message;
use App\Models\ChatRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;
    protected $room;

    public function __construct(Message $message, ChatRoom $room)
    {
        $this->message = $message;
        $this->room = $room;
    }

    // Broadcast on a private channel named 'chat'
    public function broadcastOn() //: array
    {
        // return [
        //     new PrivateChannel('chat'),
        // ];

        return new Channel('chat.room.' . $this->room->id);

    }

    // Customize the broadcast name (optional)
    public function broadcastAs(): string
    {
        return 'new.message';
    }

    // Data sent with the event (by default all public properties are sent)
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
            ],
            'created_at' => $this->message->created_at->toISOString(),
        ];
    }
}