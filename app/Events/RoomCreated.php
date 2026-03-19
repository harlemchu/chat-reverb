<?php

// app/Events/RoomCreated.php
namespace App\Events;

use App\Models\ChatRoom;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class RoomCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $room;

    public function __construct(ChatRoom $room)
    {
        $this->room = $room;
    }

    public function broadcastOn()
    {
        // Use a public channel (or private if you want authentication)
        return new Channel('rooms');
    }

    public function broadcastAs()
    {
        return 'room.created';
    }
}