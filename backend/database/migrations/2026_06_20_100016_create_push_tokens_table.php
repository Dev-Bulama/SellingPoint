<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('push_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('player_id')->unique();
            $table->string('device_type')->nullable();
            $table->string('app_version')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('push_tokens'); }
};
