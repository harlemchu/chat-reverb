<?php

namespace App\Http\Controllers;

use App\Events\NewMessage;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        // Load existing messages with user info
        $messages = Message::with('user')->latest()->take(50)->get()->reverse()->values();

        return Inertia::render('Chat', [
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $message = Message::create([
            'user_id' => $request->user()->id,
            // 'content' => $request->content,'content' => $request->input('content'),
            'content' => $request->post('content'),
        ]);

        // Load the user relation for broadcasting
        $message->load('user');

        // Broadcast the event
        broadcast(new NewMessage($message))->toOthers();

        // Return the message as JSON for the frontend (optional)
        return response()->json($message);
    }
}