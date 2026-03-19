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
        Schema::table('users', function (Blueprint $table) {
            // Add avatar column – nullable string
            $table->string('avatar')->nullable()->after('email'); // or after any column you prefer

            // Add is_online column – boolean with default false
            $table->boolean('online')->default(false)->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop both columns
            $table->dropColumn(['avatar', 'online']);
        });
    }
};
