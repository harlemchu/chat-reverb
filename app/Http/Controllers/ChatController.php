<?php

namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Events\MessageSent;
use App\Events\NewMessageNotification;
use App\Events\ConversationUpdated;
use App\Events\UserAddedToGroup;
use App\Models\ChatRoom;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Conversation;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\User;

class ChatController extends Controller
{
    use AuthorizesRequests; // add this line
    public function index()
    {

        return Inertia::render('Chat/Index');
        // Load existing messages with user info
        // $messages = Message::with('user')->latest()->take(50)->get()->reverse()->values();

        // return Inertia::render('Chat', [
        //     'messages' => $messages,
        // ]);
    }

    public function store(Request $request, ChatRoom $room)
    {
        // return response()->json(['message' => 'Route works!']);
        // $request->validate([
        //     'content' => 'required|string|max:1000',
        // ]);

        // $message = Message::create([
        //     'user_id' => $request->user()->id,
        //     // 'content' => $request->content,'content' => $request->input('content'),
        //     'room_id' => $room->id,
        //     'content' => $request->post('content'),
        // ]);

        // // Load the user relation for broadcasting
        // $message->load('user');

        // // Broadcast the event
        // broadcast(new NewMessage($message, $room))->toOthers();

        // // Return the message as JSON for the frontend (optional)
        // return response()->json($message);
    }
    // app/Http/Controllers/ChatController.php
    public function getConversations()
    {
        $user = auth()->user();
        $conversations = $user->conversations()
            ->with(['users', 'messages' => fn($q) => $q->latest()->limit(1)])
            ->get()
            ->map(function ($conversation) use ($user) {
                $conversation->unread_count = $conversation->unreadCountForUser($user->id);
                $conversation->last_message = $conversation->messages->first();
                unset($conversation->messages);
                return $conversation;
            });


        // $conversations = $user->conversations()
        //     ->with([
        //         'users',
        //         'messages' => function ($q) {
        //             $q->latest()->limit(1); // last message
        //         }
        //     ])
        //     ->get();
        // ->map(function ($conversation) use ($user) {
        //     // Compute unread count efficiently
        //     $conversation->unread_count = $conversation->unreadCountForUser($user->id);

        //     // Attach the last message (already loaded)
        //     $conversation->last_message = $conversation->messages->first();

        //     // Remove the messages collection to keep response clean
        //     unset($conversation->messages);

        //     return $conversation;
        // });
        // ->map(function ($conversation) use ($user) {
        //     // Count unread messages
        //     $lastRead = $conversation->pivot->last_read_at;
        //     $unreadCount = $conversation->messages()
        //         ->where('user_id', '!=', $user->id)
        //         ->when($lastRead, fn($q) => $q->where('created_at', '>', $lastRead))
        //         ->count();

        //     // Attach unread count and last message
        //     $conversation->unread_count = $unreadCount;
        //     $conversation->last_message = $conversation->messages->first();
        //     unset($conversation->messages); // remove the collection
        //     return $conversation;
        // });

        return response()->json($conversations);
    }
    public function markAsRead(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $conversation->markAsReadForUser($request->user()->id);
        // For each other participant, broadcast a conversation update
        $otherUsers = $conversation->users->where('id', '!=', $request->user()->id);
        foreach ($otherUsers as $user) {
            broadcast(new ConversationUpdated($conversation, $user->id))->toOthers();
        }

        return response()->json(['status' => 'ok']);
    }
    // public function markAsRead(Conversation $conversation)
    // {
    //     $user = auth()->user();
    //     $user->conversations()->updateExistingPivot($conversation->id, [
    //         'last_read_at' => now(),
    //     ]);
    //     return response()->json(['status' => 'ok']);
    // }
    /**
     * Get messages for a specific conversation.
     */
    /**
     * Send a new message.
     */
    public function sendMessage(Request $request, Conversation $conversation)
    {
        $this->authorize('send', $conversation);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $message = $conversation->messages()->create([
            'user_id' => $request->user()->id,
            'content' => $validated['content'],
        ]);

        // Load the user relation for broadcasting
        $message->load('user');

        // Broadcast to others in the conversation (excluding the sender)
        broadcast(new MessageSent($message))->toOthers();

        // Broadcast to each participant's private channel (for notifications & unread counts)
        broadcast(new NewMessageNotification($message))->toOthers();

        // For each other participant, broadcast a conversation update
        // $otherUsers = $conversation->users->where('id', '!=', $request->user()->id);
        // foreach ($otherUsers as $user) {
        //     broadcast(new ConversationUpdated($conversation, $user->id))->toOthers();
        // }
        return response()->json($message);
    }

    public function getMessages(Request $request, Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        // For each other participant, broadcast a conversation update
        $otherUsers = $conversation->users->where('id', '!=', $request->user()->id);
        foreach ($otherUsers as $user) {
            broadcast(new ConversationUpdated($conversation, $user->id))->toOthers();
        }
        return response()->json($messages);
    }
    public function getUsers(Request $request)
    {
        $users = User::where('id', '!=', $request->user()->id)
            ->select('id', 'name', 'email')
            ->get();
        return response()->json($users);
    }
    public function createGroup(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        // Create the group conversation
        $group = Conversation::create([
            'type' => 'group',
            'name' => $validated['name'],
        ]);

        // Attach the creator (current user) and selected users
        $userIds = array_merge([$request->user()->id], $validated['user_ids']);
        $group->users()->attach($userIds);

        // Optionally mark creator as admin – you'd need an extra pivot column
        // For simplicity, we skip admin roles for now.
        // Broadcast to each newly added user (excluding the creator)
        foreach ($validated['user_ids'] as $newUserId) {
            broadcast(new UserAddedToGroup($group, $newUserId))->toOthers();
        }
        \Log::info('Broadcasting UserAddedToGroup', ['new_user' => $newUserId, 'group' => $group->id]);
        return response()->json($group->load('users'), 201);
    }
    public function startPrivateConversation(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $currentUser = $request->user();
        $otherUserId = $validated['user_id'];

        if ($otherUserId == $currentUser->id) {
            return response()->json(['error' => 'You cannot start a conversation with yourself'], 422);
        }

        // Find or create the private conversation
        $conversation = $currentUser->conversations()
            ->where('type', 'private')
            ->whereHas('users', fn($q) => $q->where('user_id', $otherUserId))
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create(['type' => 'private']);
            $conversation->users()->attach([
                $currentUser->id => ['last_read_at' => now()],
                $otherUserId => ['last_read_at' => now()],
            ]);
        }

        $conversation->load('users');
        $conversation->last_message = $conversation->messages()->latest()->first();
        $conversation->unread_count = 0;

        return response()->json($conversation);
    }
    public function addUsersToGroup(Request $request, Conversation $conversation)
    {
        // Ensure it's a group and user has permission (e.g., is admin)
        if ($conversation->type !== 'group') {
            return response()->json(['error' => 'Not a group'], 400);
        }

        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'exists:users,id',
        ]);

        $conversation->users()->syncWithoutDetaching($validated['user_ids']);
        foreach ($validated['user_ids'] as $newUserId) {
            broadcast(new UserAddedToGroup($conversation, $newUserId))->toOthers();
        }
        return response()->json(['status' => 'ok']);
    }
}