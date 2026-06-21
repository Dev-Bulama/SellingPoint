<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('flash_sales', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('banner')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->decimal('discount_percentage', 5, 2)->default(0);
            $table->decimal('sale_price', 12, 2);
            $table->integer('quantity_limit')->nullable();
            $table->integer('sold_count')->default(0);
            $table->timestamps();
            $table->unique(['flash_sale_id', 'product_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('flash_sale_products');
        Schema::dropIfExists('flash_sales');
    }
};
