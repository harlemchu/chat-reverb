<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Database\Seeder;

class ChatSeeder extends Seeder
{
    public function run()
    {
        // Create two users
        $user1 = User::factory()->create(['name' => 'Anil']);
        $user2 = User::factory()->create(['name' => 'Victoria H']);

        // Create a private conversation between them
        $conversation = Conversation::create(['type' => 'private']);

        // Attach both users
        $conversation->users()->attach([$user1->id, $user2->id]);

        // Add some messages
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user1->id,
            'content' => 'Hey There!',
        ]);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user1->id,
            'content' => 'How are you?',
        ]);
        Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user2->id,
            'content' => 'Hello!',
        ]);
        // ... add more as needed

        // You can also create group conversations
        $group = Conversation::create(['type' => 'group', 'name' => 'Friends Forever']);
        $group->users()->attach([$user1->id, $user2->id, User::factory()->create(['name' => 'Bill Gates'])->id]);
        // ... messages
    }
}