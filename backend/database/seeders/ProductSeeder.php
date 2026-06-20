<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $smartphoneCategory = Category::where('slug', 'like', 'smartphones%')->first();
        $laptopCategory     = Category::where('slug', 'like', 'laptops%')->first();
        $fashionCategory    = Category::where('slug', 'like', 'men-s-clothing%')->first();
        $samsungBrand       = Brand::where('slug', 'samsung')->first();
        $appleBrand         = Brand::where('slug', 'apple')->first();
        $nikeBrand          = Brand::where('slug', 'nike')->first();
        $xiaomiBrand        = Brand::where('slug', 'xiaomi')->first();
        $hpBrand            = Brand::where('slug', 'hp')->first();

        $products = [
            [
                'name'              => 'Samsung Galaxy S24 Ultra',
                'category_id'       => $smartphoneCategory?->id ?? 1,
                'brand_id'          => $samsungBrand?->id,
                'price'             => 750000,
                'discount_price'    => 699000,
                'stock_quantity'    => 50,
                'short_description' => 'Latest Samsung flagship with 200MP camera and S Pen.',
                'description'       => '<p>The Samsung Galaxy S24 Ultra is the pinnacle of Android smartphones...</p>',
                'specifications'    => ['Display' => '6.8" Dynamic AMOLED', 'RAM' => '12GB', 'Storage' => '256GB', 'Camera' => '200MP', 'Battery' => '5000mAh'],
                'is_featured'       => true,
                'is_new_arrival'    => true,
                'is_best_seller'    => true,
                'status'            => 'active',
            ],
            [
                'name'              => 'iPhone 15 Pro Max',
                'category_id'       => $smartphoneCategory?->id ?? 1,
                'brand_id'          => $appleBrand?->id,
                'price'             => 950000,
                'discount_price'    => 899000,
                'stock_quantity'    => 30,
                'short_description' => 'Apple\'s most powerful iPhone with titanium design.',
                'description'       => '<p>The iPhone 15 Pro Max features a titanium frame and A17 Pro chip...</p>',
                'specifications'    => ['Display' => '6.7" Super Retina XDR', 'Chip' => 'A17 Pro', 'Storage' => '256GB', 'Camera' => '48MP Triple', 'Battery' => '4422mAh'],
                'is_featured'       => true,
                'is_best_seller'    => true,
                'status'            => 'active',
            ],
            [
                'name'              => 'Xiaomi Redmi Note 13 Pro',
                'category_id'       => $smartphoneCategory?->id ?? 1,
                'brand_id'          => $xiaomiBrand?->id,
                'price'             => 250000,
                'discount_price'    => 220000,
                'stock_quantity'    => 100,
                'short_description' => 'Best budget smartphone with 200MP camera.',
                'description'       => '<p>The Redmi Note 13 Pro delivers flagship features at a mid-range price...</p>',
                'specifications'    => ['Display' => '6.67" AMOLED', 'RAM' => '8GB', 'Storage' => '256GB', 'Camera' => '200MP', 'Battery' => '5100mAh'],
                'is_featured'       => true,
                'is_new_arrival'    => true,
                'is_flash_sale'     => true,
                'status'            => 'active',
            ],
            [
                'name'              => 'HP Pavilion Laptop 15',
                'category_id'       => $laptopCategory?->id ?? 2,
                'brand_id'          => $hpBrand?->id,
                'price'             => 450000,
                'discount_price'    => 420000,
                'stock_quantity'    => 25,
                'short_description' => '15.6" laptop with Intel Core i5 and 8GB RAM.',
                'description'       => '<p>The HP Pavilion 15 is a versatile laptop for work and entertainment...</p>',
                'specifications'    => ['Display' => '15.6" FHD', 'Processor' => 'Intel Core i5-13th Gen', 'RAM' => '8GB DDR4', 'Storage' => '512GB SSD', 'OS' => 'Windows 11'],
                'is_featured'       => true,
                'status'            => 'active',
            ],
            [
                'name'              => 'Nike Air Max 270',
                'category_id'       => $fashionCategory?->id ?? 3,
                'brand_id'          => $nikeBrand?->id,
                'price'             => 55000,
                'discount_price'    => 45000,
                'stock_quantity'    => 200,
                'short_description' => 'Iconic Nike Air Max with maximum cushioning.',
                'description'       => '<p>The Nike Air Max 270 delivers visible Air cushioning for all-day comfort...</p>',
                'specifications'    => ['Material' => 'Mesh upper', 'Sole' => 'Rubber', 'Closure' => 'Lace-up'],
                'is_featured'       => true,
                'is_best_seller'    => true,
                'is_flash_sale'     => true,
                'status'            => 'active',
                'tags'              => ['shoes', 'nike', 'sneakers', 'sports'],
            ],
        ];

        foreach ($products as $data) {
            $tags = $data['tags'] ?? null;
            unset($data['tags']);
            $product = Product::create(array_merge($data, [
                'slug' => Str::slug($data['name']),
                'sku'  => 'SP-' . strtoupper(Str::random(8)),
                'tags' => $tags,
            ]));
        }
    }
}
