<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatRoomController;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Http\Request;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Route::get('/chatroom', [ChatRoomController::class, 'index'])->name('chat.index');
    // Route::post('/chatrooms', [ChatRoomController::class, 'store'])->name('chat.rooms.store');
    // Route::get('/chatroom/{room}', [ChatRoomController::class, 'show'])->name('chat.room');
    // Route::post('/chat/{room}', [ChatController::class, 'store'])->name('chat.store');

    // Route::post('/chat/conversations/{conversation}/read', [ChatController::class, 'markAsRead']);

    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');

    // API-like routes for chat
    Route::get('/chat/conversations', [ChatController::class, 'getConversations']);
    Route::get('/chat/conversations/{conversation}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);
    Route::post('/chat/conversations/{conversation}/read', [ChatController::class, 'markAsRead']);
    Route::post('/chat/groups', [ChatController::class, 'createGroup']);
    Route::post('/chat/groups/{conversation}/add-users', [ChatController::class, 'addUsersToGroup']);
    Route::get('/chat/users', [ChatController::class, 'getUsers']); // for selecting participants
    Route::post('/chat/start-private', [ChatController::class, 'startPrivateConversation']);

    // Custom broadcast auth endpoint
    Route::post('/broadcasting/auth', function (Request $request) {
        return Broadcast::auth($request);
    })->middleware(['web', 'auth']);
    // Route::post('/broadcasting/auth', function (Request $request) {
    //     $channelName = $request->input('channel_name');
    //     $user = $request->user();

    //     if (!$user) {
    //         return response()->json(['error' => 'Unauthenticated'], 403);
    //     }

    //     if ($channelName === 'online') {
    //         // Return the auth string using Pusher's format
    //         $auth = $user->id . ':' . hash_hmac('sha256', $channelName, config('broadcasting.connections.reverb.secret'));
    //         return response()->json(['auth' => $auth]);
    //     }

    //     return response()->json(['error' => 'Unauthorized'], 403);
    // })->middleware('auth');
});

require __DIR__ . '/auth.php';
