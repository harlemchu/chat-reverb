<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('room_id')->after('user_id')->constrained('chat_rooms')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Drop the foreign key constraint (Laravel names it automatically)
            $table->dropForeign(['room_id']);

            // Then drop the column
            $table->dropColumn('room_id');
        });
    }
};
