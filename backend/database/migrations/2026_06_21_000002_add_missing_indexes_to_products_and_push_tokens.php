<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->index(['is_new_arrival', 'status']);
            $table->index(['is_best_seller', 'status']);
            $table->index(['is_flash_sale', 'status']);
        });

        Schema::table('push_tokens', function (Blueprint $table) {
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['is_new_arrival', 'status']);
            $table->dropIndex(['is_best_seller', 'status']);
            $table->dropIndex(['is_flash_sale', 'status']);
        });

        Schema::table('push_tokens', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
        });
    }
};
