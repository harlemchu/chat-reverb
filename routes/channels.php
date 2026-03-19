<?php

use App\Models\ChatRoom;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('chat.room.{roomId}', function (User $user, int $roomId) {
//     // Allow any authenticated user to join the room
//     // You can add additional checks if needed (e.g., user is member of room)
//     return $user; // or return ['id' => $user->id, 'name' => $user->name];
// });

// // For presence channel (same name as private, but prefixed with 'presence')
// Broadcast::channel('chat.room.{roomId}', function (User $user, int $roomId) {
//     // Return user data that will be visible to others
//     return ['id' => $user->id, 'name' => $user->name];
// }, ['guards' => ['web']]);

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    \Log::info('Broadcast auth for conversation', ['user' => $user->id, 'conversationId' => $conversationId]);
    return $user->conversations()->where('conversation_id', $conversationId)->exists();
});
// Optional: presence channel for online status
Broadcast::channel('online', function ($user) {
    return $user ? ['id' => $user->id, 'name' => $user->name] : null;
});
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});