<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'title'     => 'About Us',
                'slug'      => 'about-us',
                'content'   => '<h2>About Sellingpoint</h2><p>Sellingpoint is Nigeria\'s premier online marketplace, connecting millions of buyers and sellers across the country. We are committed to providing the best shopping experience with genuine products, secure payments, and fast delivery.</p><p>Our mission is to democratize commerce across Africa by making it easy for anyone to buy and sell online.</p>',
                'is_active' => true,
            ],
            [
                'title'     => 'Privacy Policy',
                'slug'      => 'privacy-policy',
                'content'   => '<h2>Privacy Policy</h2><p>At Sellingpoint, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information.</p><h3>Data Collection</h3><p>We collect information you provide when registering, making purchases, or contacting support.</p><h3>Data Usage</h3><p>Your data is used to process orders, improve our services, and send relevant communications.</p>',
                'is_active' => true,
            ],
            [
                'title'     => 'Terms and Conditions',
                'slug'      => 'terms-and-conditions',
                'content'   => '<h2>Terms and Conditions</h2><p>Welcome to Sellingpoint. By using our platform, you agree to these terms and conditions.</p><h3>Account</h3><p>You are responsible for maintaining the security of your account credentials.</p><h3>Orders</h3><p>All orders are subject to product availability. We reserve the right to cancel orders in case of stock issues.</p>',
                'is_active' => true,
            ],
        ];

        foreach ($pages as $page) {
            Page::firstOrCreate(['slug' => $page['slug']], $page);
        }
    }
}
