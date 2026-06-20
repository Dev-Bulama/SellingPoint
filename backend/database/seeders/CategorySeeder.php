<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Electronics', 'icon' => 'heroicon-o-cpu-chip', 'is_featured' => true, 'children' => [
                'Smartphones', 'Laptops', 'Tablets', 'Smart Watches', 'Headphones', 'Cameras',
            ]],
            ['name' => 'Fashion', 'icon' => 'heroicon-o-shopping-bag', 'is_featured' => true, 'children' => [
                "Men's Clothing", "Women's Clothing", 'Shoes', 'Bags & Purses', 'Accessories', 'Watches',
            ]],
            ['name' => 'Home & Living', 'icon' => 'heroicon-o-home', 'is_featured' => true, 'children' => [
                'Furniture', 'Kitchen & Dining', 'Bedding', 'Decor', 'Lighting',
            ]],
            ['name' => 'Beauty & Health', 'icon' => 'heroicon-o-sparkles', 'is_featured' => false, 'children' => [
                'Skincare', 'Hair Care', 'Makeup', 'Fragrances', 'Vitamins',
            ]],
            ['name' => 'Sports & Outdoors', 'icon' => 'heroicon-o-trophy', 'is_featured' => false, 'children' => [
                'Exercise Equipment', 'Sports Apparel', 'Outdoor Gear',
            ]],
            ['name' => 'Groceries', 'icon' => 'heroicon-o-shopping-cart', 'is_featured' => true, 'children' => [
                'Fresh Produce', 'Beverages', 'Snacks', 'Household Items',
            ]],
        ];

        foreach ($categories as $i => $data) {
            $parent = Category::create([
                'name'        => $data['name'],
                'slug'        => Str::slug($data['name']),
                'icon'        => $data['icon'],
                'is_active'   => true,
                'is_featured' => $data['is_featured'],
                'sort_order'  => $i + 1,
            ]);

            foreach ($data['children'] as $j => $child) {
                Category::create([
                    'parent_id'  => $parent->id,
                    'name'       => $child,
                    'slug'       => Str::slug($child) . '-' . $parent->id,
                    'is_active'  => true,
                    'sort_order' => $j + 1,
                ]);
            }
        }
    }
}
