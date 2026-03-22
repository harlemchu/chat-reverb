<?php

use App\Models\ChatRoom;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;
Broadcast::routes();

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