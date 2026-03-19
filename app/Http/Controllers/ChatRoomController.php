<?php

namespace App\Http\Controllers;

use App\Models\ChatRoom;
use Illuminate\Http\Request;
use Inertia\Inertia;
use app\Events\RoomCreated;

class ChatRoomController extends Controller
{
    public function index()
    {
        // Return a view (or Inertia page) that lists all rooms
        $rooms = ChatRoom::all();
        // dd($rooms);
        return Inertia::render('Chatroom', [
            'rooms' => $rooms,
        ]);
        // return response()->json($rooms);
    }

    public function show(ChatRoom $room)
    {
        $messages = $room->messages()
            ->with('user')
            ->latest()
            ->take(50)
            ->get()
            ->reverse()
            ->values();

        $rooms = ChatRoom::all(); // get all rooms for the sidebar

        return Inertia::render('ChatBox', [   // or 'Chat/Index' if you renamed
            'rooms' => $rooms,
            'currentRoom' => $room,
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        // return response()->json(['message' => 'Route works!']);
        $request->validate([
            'name' => 'required|string|max:255|unique:chat_rooms,name',
        ]);

        // dd($request->name);
        $room = ChatRoom::create([
            'name' => $request->name,
        ]);
        // Broadcast to all users that a new room has been created
        broadcast(new RoomCreated($room))->toOthers();

        return redirect()->route('chat.room', $room)->with('success', 'Room created successfully.');
    }
}