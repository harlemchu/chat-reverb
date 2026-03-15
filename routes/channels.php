<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('chat', function (User $user) {
    // Any authenticated user can listen to the global chat channel
    return true; // or you can add extra logic like $user->can('access-chat')
});