<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'title'       => 'Mega Sale Up To 50% Off',
                'subtitle'    => 'Shop the best deals on electronics',
                'image'       => 'banners/banner-1.jpg',
                'type'        => 'slider',
                'button_text' => 'Shop Now',
                'bg_color'    => '#FF6B00',
                'sort_order'  => 1,
                'is_active'   => true,
            ],
            [
                'title'       => 'New Arrivals 2025',
                'subtitle'    => 'Discover the latest smartphones',
                'image'       => 'banners/banner-2.jpg',
                'type'        => 'slider',
                'button_text' => 'Explore',
                'bg_color'    => '#1A1A2E',
                'sort_order'  => 2,
                'is_active'   => true,
            ],
            [
                'title'       => 'Flash Sale — Ends Tonight!',
                'subtitle'    => 'Limited time offers on top brands',
                'image'       => 'banners/flash-sale.jpg',
                'type'        => 'flash_sale',
                'button_text' => 'Grab Now',
                'bg_color'    => '#E63946',
                'sort_order'  => 1,
                'is_active'   => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::firstOrCreate(['title' => $banner['title'], 'type' => $banner['type']], $banner);
        }
    }
}
