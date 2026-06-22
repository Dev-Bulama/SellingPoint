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
        // Resolve categories by slug pattern
        $cat = fn(string $slug) => Category::where('slug', 'like', $slug . '%')->first();

        // Resolve brands
        $brand = fn(string $slug) => Brand::where('slug', $slug)->first()?->id;

        $products = [

            // ── Electronics: Smartphones ──────────────────────────────────
            ['name' => 'Samsung Galaxy S24 Ultra',  'category' => 'smartphones', 'brand' => 'samsung',
             'price' => 750000, 'discount_price' => 699000, 'stock' => 50,
             'short' => 'Latest Samsung flagship with 200MP camera and S Pen.',
             'specs' => ['Display' => '6.8" Dynamic AMOLED', 'RAM' => '12GB', 'Storage' => '256GB', 'Camera' => '200MP', 'Battery' => '5000mAh'],
             'featured' => true, 'new_arrival' => true, 'best_seller' => true],

            ['name' => 'iPhone 15 Pro Max', 'category' => 'smartphones', 'brand' => 'apple',
             'price' => 950000, 'discount_price' => 899000, 'stock' => 30,
             'short' => "Apple's most powerful iPhone with titanium design.",
             'specs' => ['Display' => '6.7" Super Retina XDR', 'Chip' => 'A17 Pro', 'Storage' => '256GB', 'Battery' => '4422mAh'],
             'featured' => true, 'best_seller' => true],

            ['name' => 'Xiaomi Redmi Note 13 Pro', 'category' => 'smartphones', 'brand' => 'xiaomi',
             'price' => 250000, 'discount_price' => 220000, 'stock' => 100,
             'short' => 'Best budget smartphone with 200MP camera.',
             'specs' => ['Display' => '6.67" AMOLED', 'RAM' => '8GB', 'Storage' => '256GB', 'Camera' => '200MP', 'Battery' => '5100mAh'],
             'featured' => true, 'new_arrival' => true, 'flash_sale' => true],

            ['name' => 'Tecno Camon 20 Pro', 'category' => 'smartphones', 'brand' => 'tecno',
             'price' => 180000, 'discount_price' => 160000, 'stock' => 80,
             'short' => '50MP front camera smartphone for selfie lovers.',
             'specs' => ['Display' => '6.67" AMOLED', 'RAM' => '8GB', 'Storage' => '256GB', 'Battery' => '5000mAh'],
             'new_arrival' => true],

            ['name' => 'Infinix Note 30 Pro', 'category' => 'smartphones', 'brand' => 'infinix',
             'price' => 150000, 'discount_price' => 135000, 'stock' => 120,
             'short' => 'Slim design with 68W fast charging.',
             'specs' => ['Display' => '6.78" AMOLED', 'RAM' => '8GB', 'Storage' => '256GB', 'Battery' => '5000mAh'],
             'flash_sale' => true],

            ['name' => 'Samsung Galaxy A54', 'category' => 'smartphones', 'brand' => 'samsung',
             'price' => 280000, 'discount_price' => null, 'stock' => 60,
             'short' => 'Galaxy A series with 5000mAh battery and 50MP camera.',
             'specs' => ['Display' => '6.4" Super AMOLED', 'RAM' => '8GB', 'Storage' => '128GB', 'Battery' => '5000mAh'],
             'best_seller' => true],

            // ── Electronics: Laptops ─────────────────────────────────────
            ['name' => 'HP Pavilion Laptop 15', 'category' => 'laptops', 'brand' => 'hp',
             'price' => 450000, 'discount_price' => 420000, 'stock' => 25,
             'short' => '15.6" laptop with Intel Core i5 and 8GB RAM.',
             'specs' => ['Display' => '15.6" FHD', 'Processor' => 'Intel Core i5-13th Gen', 'RAM' => '8GB', 'Storage' => '512GB SSD'],
             'featured' => true],

            ['name' => 'Dell Inspiron 15 3520', 'category' => 'laptops', 'brand' => 'dell',
             'price' => 520000, 'discount_price' => 490000, 'stock' => 20,
             'short' => 'Dell Inspiron with 12th Gen Intel Core i7.',
             'specs' => ['Display' => '15.6" FHD', 'Processor' => 'Intel Core i7-1255U', 'RAM' => '16GB', 'Storage' => '512GB SSD'],
             'featured' => true, 'new_arrival' => true],

            ['name' => 'HP EliteBook 840 G9', 'category' => 'laptops', 'brand' => 'hp',
             'price' => 780000, 'discount_price' => 720000, 'stock' => 10,
             'short' => 'Business ultrabook with Intel Evo certification.',
             'specs' => ['Display' => '14" IPS FHD', 'Processor' => 'Intel Core i7-1265U', 'RAM' => '16GB', 'Storage' => '1TB SSD'],
             'best_seller' => true],

            ['name' => 'Dell XPS 13', 'category' => 'laptops', 'brand' => 'dell',
             'price' => 1200000, 'discount_price' => 1100000, 'stock' => 8,
             'short' => 'Ultra-thin laptop with InfinityEdge display.',
             'specs' => ['Display' => '13.4" OLED', 'Processor' => 'Intel Core i7-1360P', 'RAM' => '32GB', 'Storage' => '1TB SSD'],
             'featured' => true],

            ['name' => 'HP 250 G9 Laptop', 'category' => 'laptops', 'brand' => 'hp',
             'price' => 320000, 'discount_price' => 295000, 'stock' => 35,
             'short' => 'Affordable everyday laptop for students and professionals.',
             'specs' => ['Display' => '15.6" HD', 'Processor' => 'Intel Core i3-1215U', 'RAM' => '8GB', 'Storage' => '256GB SSD'],
             'flash_sale' => true],

            // ── Fashion: Shoes ─────────────────────────────────────────────
            ['name' => 'Nike Air Max 270', 'category' => 'shoes', 'brand' => 'nike',
             'price' => 55000, 'discount_price' => 45000, 'stock' => 200,
             'short' => 'Iconic Nike Air Max with maximum cushioning.',
             'specs' => ['Material' => 'Mesh upper', 'Sole' => 'Rubber', 'Closure' => 'Lace-up'],
             'featured' => true, 'best_seller' => true, 'flash_sale' => true],

            ['name' => 'Adidas Ultraboost 23', 'category' => 'shoes', 'brand' => 'adidas',
             'price' => 65000, 'discount_price' => 58000, 'stock' => 150,
             'short' => 'Premium running shoes with Boost cushioning.',
             'specs' => ['Upper' => 'Primeknit', 'Midsole' => 'Boost foam', 'Outsole' => 'Continental rubber'],
             'featured' => true, 'best_seller' => true],

            ['name' => 'Nike Air Force 1 Low', 'category' => 'shoes', 'brand' => 'nike',
             'price' => 48000, 'discount_price' => 42000, 'stock' => 180,
             'short' => 'Classic all-white sneakers, timeless style.',
             'specs' => ['Upper' => 'Leather', 'Sole' => 'Rubber cupsole', 'Closure' => 'Lace-up'],
             'new_arrival' => true],

            ['name' => 'Adidas Stan Smith', 'category' => 'shoes', 'brand' => 'adidas',
             'price' => 38000, 'discount_price' => null, 'stock' => 220,
             'short' => 'The iconic tennis shoe turned streetwear classic.',
             'specs' => ['Upper' => 'Leather', 'Lining' => 'Textile'],
             'best_seller' => true],

            ['name' => 'Nike Revolution 6', 'category' => 'shoes', 'brand' => 'nike',
             'price' => 28000, 'discount_price' => 24000, 'stock' => 300,
             'short' => 'Lightweight everyday running shoe for beginners.',
             'specs' => ['Upper' => 'Mesh', 'Sole' => 'Foam midsole'],
             'flash_sale' => true],

            // ── Fashion: Men's Clothing ────────────────────────────────────
            ["name" => "Men's Classic Polo Shirt", 'category' => 'men-s-clothing', 'brand' => 'nike',
             'price' => 12000, 'discount_price' => 9500, 'stock' => 500,
             'short' => 'Premium cotton polo shirt for everyday wear.',
             'specs' => ['Material' => '100% Cotton', 'Fit' => 'Regular', 'Sizes' => 'S-3XL'],
             'new_arrival' => true],

            ["name" => "Men's Slim Fit Chinos", 'category' => 'men-s-clothing', 'brand' => 'adidas',
             'price' => 18000, 'discount_price' => 15000, 'stock' => 300,
             'short' => 'Stylish slim-fit chinos for office and casual wear.',
             'specs' => ['Material' => 'Cotton blend', 'Fit' => 'Slim', 'Sizes' => '28-40'],
             'best_seller' => true],

            ["name" => "Men's Formal Suit Set", 'category' => 'men-s-clothing', 'brand' => null,
             'price' => 65000, 'discount_price' => 58000, 'stock' => 80,
             'short' => 'Complete 3-piece suit for business and formal events.',
             'specs' => ['Material' => 'Wool blend', 'Includes' => 'Jacket, Trousers, Waistcoat'],
             'featured' => true],

            ["name" => "Men's Graphic Tee", 'category' => 'men-s-clothing', 'brand' => 'nike',
             'price' => 7500, 'discount_price' => null, 'stock' => 600,
             'short' => 'Comfortable 100% cotton graphic t-shirt.',
             'specs' => ['Material' => '100% Cotton', 'Fit' => 'Regular'],
             'flash_sale' => true],

            ["name" => "Men's Denim Jacket", 'category' => 'men-s-clothing', 'brand' => null,
             'price' => 22000, 'discount_price' => 19000, 'stock' => 150,
             'short' => 'Classic blue denim jacket for casual styling.',
             'specs' => ['Material' => 'Denim', 'Closure' => 'Button front'],
             'new_arrival' => true],

            // ── Home & Living: Furniture ───────────────────────────────────
            ['name' => '3-Seater Sofa Set', 'category' => 'furniture', 'brand' => null,
             'price' => 180000, 'discount_price' => 160000, 'stock' => 15,
             'short' => 'Comfortable fabric sofa set for modern living rooms.',
             'specs' => ['Material' => 'Fabric + Wood', 'Dimensions' => '210cm x 90cm x 80cm', 'Color' => 'Grey'],
             'featured' => true],

            ['name' => 'King Size Bed Frame', 'category' => 'furniture', 'brand' => null,
             'price' => 120000, 'discount_price' => 105000, 'stock' => 20,
             'short' => 'Solid wood king size bed frame with headboard.',
             'specs' => ['Material' => 'Solid wood', 'Size' => 'King (180cm x 200cm)', 'Color' => 'Walnut'],
             'best_seller' => true],

            ['name' => 'Office Desk with Drawers', 'category' => 'furniture', 'brand' => null,
             'price' => 75000, 'discount_price' => 65000, 'stock' => 30,
             'short' => 'Spacious office desk with 3 storage drawers.',
             'specs' => ['Material' => 'MDF + Metal', 'Dimensions' => '120cm x 60cm x 75cm'],
             'new_arrival' => true],

            ['name' => 'Ergonomic Office Chair', 'category' => 'furniture', 'brand' => null,
             'price' => 55000, 'discount_price' => 48000, 'stock' => 40,
             'short' => 'Adjustable lumbar support chair for long work sessions.',
             'specs' => ['Material' => 'Mesh + PU', 'Adjustable' => 'Yes', 'Max Load' => '120kg'],
             'featured' => true, 'flash_sale' => true],

            ['name' => 'Bookshelf 5-Tier', 'category' => 'furniture', 'brand' => null,
             'price' => 35000, 'discount_price' => 30000, 'stock' => 60,
             'short' => 'Modern 5-tier bookshelf for home and office.',
             'specs' => ['Material' => 'Engineered wood', 'Dimensions' => '80cm x 30cm x 180cm'],
             'best_seller' => true],

            // ── Home & Living: Kitchen & Dining ───────────────────────────
            ['name' => 'Non-Stick Cookware Set (5 Pcs)', 'category' => 'kitchen-dining', 'brand' => null,
             'price' => 28000, 'discount_price' => 23000, 'stock' => 100,
             'short' => 'Complete non-stick cookware set with lids.',
             'specs' => ['Material' => 'Aluminium', 'Coating' => 'PTFE non-stick', 'Pieces' => '5'],
             'featured' => true, 'best_seller' => true],

            ['name' => 'Blender & Smoothie Maker', 'category' => 'kitchen-dining', 'brand' => null,
             'price' => 18000, 'discount_price' => 15500, 'stock' => 80,
             'short' => '600W powerful blender for smoothies and juices.',
             'specs' => ['Power' => '600W', 'Capacity' => '1.5L', 'Speed' => '3 settings'],
             'new_arrival' => true],

            ['name' => 'Dinner Set (24 Pieces)', 'category' => 'kitchen-dining', 'brand' => null,
             'price' => 22000, 'discount_price' => null, 'stock' => 120,
             'short' => 'Complete ceramic dinner set for 6 persons.',
             'specs' => ['Material' => 'Ceramic', 'Pieces' => '24', 'Dishwasher Safe' => 'Yes'],
             'best_seller' => true],

            // ── Beauty & Health: Skincare ──────────────────────────────────
            ['name' => 'Vitamin C Face Serum 30ml', 'category' => 'skincare', 'brand' => null,
             'price' => 8500, 'discount_price' => 7000, 'stock' => 300,
             'short' => 'Brightening vitamin C serum for glowing skin.',
             'specs' => ['Volume' => '30ml', 'Skin Type' => 'All skin types', 'Key Ingredient' => 'Vitamin C 20%'],
             'featured' => true, 'new_arrival' => true],

            ['name' => 'Moisturizing Face Cream', 'category' => 'skincare', 'brand' => null,
             'price' => 6500, 'discount_price' => 5500, 'stock' => 400,
             'short' => '24-hour hydration cream with hyaluronic acid.',
             'specs' => ['Volume' => '50ml', 'Key Ingredient' => 'Hyaluronic Acid'],
             'best_seller' => true],

            ['name' => 'SPF 50 Sunscreen Lotion', 'category' => 'skincare', 'brand' => null,
             'price' => 4500, 'discount_price' => null, 'stock' => 500,
             'short' => 'Broad spectrum SPF 50 protection for all skin tones.',
             'specs' => ['Volume' => '150ml', 'SPF' => '50', 'Water Resistant' => 'Yes'],
             'flash_sale' => true],

            ['name' => 'Anti-Aging Retinol Cream', 'category' => 'skincare', 'brand' => null,
             'price' => 12000, 'discount_price' => 10000, 'stock' => 200,
             'short' => 'Retinol-infused night cream to reduce fine lines.',
             'specs' => ['Volume' => '50ml', 'Key Ingredient' => 'Retinol 0.5%'],
             'featured' => true],

            ['name' => 'Charcoal Face Wash 150ml', 'category' => 'skincare', 'brand' => null,
             'price' => 3500, 'discount_price' => 2900, 'stock' => 600,
             'short' => 'Deep-cleansing charcoal face wash for oily skin.',
             'specs' => ['Volume' => '150ml', 'Skin Type' => 'Oily/Combination'],
             'new_arrival' => true],

            // ── Beauty & Health: Hair Care ─────────────────────────────────
            ['name' => 'Argan Oil Hair Treatment', 'category' => 'hair-care', 'brand' => null,
             'price' => 5500, 'discount_price' => 4800, 'stock' => 350,
             'short' => 'Moroccan argan oil serum for smooth, shiny hair.',
             'specs' => ['Volume' => '100ml', 'Hair Type' => 'All types'],
             'best_seller' => true, 'new_arrival' => true],

            ['name' => 'Keratin Shampoo & Conditioner Set', 'category' => 'hair-care', 'brand' => null,
             'price' => 9500, 'discount_price' => 8000, 'stock' => 250,
             'short' => 'Salon-grade keratin duo for frizz-free hair.',
             'specs' => ['Shampoo' => '400ml', 'Conditioner' => '400ml'],
             'featured' => true],

            ['name' => 'Electric Hair Straightener', 'category' => 'hair-care', 'brand' => null,
             'price' => 15000, 'discount_price' => 12500, 'stock' => 180,
             'short' => 'Ceramic plates hair straightener with temp control.',
             'specs' => ['Plates' => 'Ceramic', 'Temperature' => '150-230°C', 'Heat-up Time' => '30s'],
             'best_seller' => true, 'flash_sale' => true],

            // ── Sports & Outdoors: Exercise Equipment ─────────────────────
            ['name' => 'Adjustable Dumbbell Set 20kg', 'category' => 'exercise-equipment', 'brand' => null,
             'price' => 35000, 'discount_price' => 29000, 'stock' => 50,
             'short' => 'Adjustable cast-iron dumbbell set for home gym.',
             'specs' => ['Weight' => '20kg (2x10kg)', 'Material' => 'Cast iron', 'Adjustable' => 'Yes'],
             'featured' => true, 'best_seller' => true],

            ['name' => 'Yoga Mat Premium 6mm', 'category' => 'exercise-equipment', 'brand' => null,
             'price' => 8500, 'discount_price' => 7000, 'stock' => 300,
             'short' => 'Non-slip premium yoga mat with carrying strap.',
             'specs' => ['Thickness' => '6mm', 'Material' => 'NBR', 'Dimensions' => '183cm x 61cm'],
             'new_arrival' => true, 'flash_sale' => true],

            ['name' => 'Resistance Bands Set (5 Pcs)', 'category' => 'exercise-equipment', 'brand' => null,
             'price' => 6500, 'discount_price' => 5000, 'stock' => 400,
             'short' => 'Full-body workout resistance bands in 5 resistance levels.',
             'specs' => ['Levels' => '5', 'Material' => 'Natural latex'],
             'best_seller' => true],

            ['name' => 'Jump Rope Speed Cable', 'category' => 'exercise-equipment', 'brand' => null,
             'price' => 4000, 'discount_price' => null, 'stock' => 500,
             'short' => 'Ball-bearing speed rope for cardio and boxing training.',
             'specs' => ['Material' => 'Steel cable + foam handles', 'Adjustable' => 'Yes'],
             'flash_sale' => true],

            ['name' => 'Pull-Up Bar (Doorframe)', 'category' => 'exercise-equipment', 'brand' => null,
             'price' => 12000, 'discount_price' => 10000, 'stock' => 80,
             'short' => 'No-drill doorframe pull-up bar for upper body strength.',
             'specs' => ['Material' => 'Steel', 'Max Load' => '150kg', 'Installation' => 'No drill'],
             'new_arrival' => true],

            // ── Sports & Outdoors: Sports Apparel ─────────────────────────
            ['name' => 'Nike Dri-FIT Running T-Shirt', 'category' => 'sports-apparel', 'brand' => 'nike',
             'price' => 14500, 'discount_price' => 12000, 'stock' => 400,
             'short' => 'Moisture-wicking running shirt for intense workouts.',
             'specs' => ['Material' => 'Polyester Dri-FIT', 'Fit' => 'Athletic'],
             'featured' => true, 'best_seller' => true],

            ['name' => 'Adidas Tiro Track Pants', 'category' => 'sports-apparel', 'brand' => 'adidas',
             'price' => 18000, 'discount_price' => 15000, 'stock' => 350,
             'short' => 'Classic Adidas track pants for training and casual wear.',
             'specs' => ['Material' => 'Polyester', 'Pockets' => '2 side zips'],
             'new_arrival' => true],

            ['name' => 'Compression Sports Shorts', 'category' => 'sports-apparel', 'brand' => null,
             'price' => 7500, 'discount_price' => 6000, 'stock' => 500,
             'short' => 'Compression shorts for reduced muscle fatigue.',
             'specs' => ['Material' => 'Spandex blend', 'Length' => '9"'],
             'flash_sale' => true],

            // ── Groceries: Beverages ───────────────────────────────────────
            ['name' => 'Lipton Yellow Label Tea (100 Bags)', 'category' => 'beverages', 'brand' => null,
             'price' => 3200, 'discount_price' => 2800, 'stock' => 1000,
             'short' => 'Classic Lipton black tea, 100 tea bags.',
             'specs' => ['Count' => '100 bags', 'Type' => 'Black tea'],
             'best_seller' => true],

            ['name' => "Bigi Chapman 50cl (24 Pack)", 'category' => 'beverages', 'brand' => null,
             'price' => 4800, 'discount_price' => null, 'stock' => 500,
             'short' => 'Refreshing Nigerian Chapman flavour soft drink.',
             'specs' => ['Volume' => '50cl per bottle', 'Pack' => '24 bottles'],
             'featured' => true],

            ['name' => 'Peak Full Cream Milk 400g', 'category' => 'beverages', 'brand' => null,
             'price' => 3500, 'discount_price' => 3000, 'stock' => 800,
             'short' => 'Creamy full-fat powdered milk for family nutrition.',
             'specs' => ['Weight' => '400g', 'Type' => 'Full cream'],
             'best_seller' => true, 'flash_sale' => true],

            ['name' => 'Nestle Milo 400g', 'category' => 'beverages', 'brand' => null,
             'price' => 4200, 'discount_price' => 3800, 'stock' => 700,
             'short' => 'Energy chocolate malt drink for kids and adults.',
             'specs' => ['Weight' => '400g'],
             'featured' => true],

            ['name' => 'Eva Water 75cl (12 Pack)', 'category' => 'beverages', 'brand' => null,
             'price' => 2200, 'discount_price' => null, 'stock' => 2000,
             'short' => 'Pure natural spring water, 12-bottle pack.',
             'specs' => ['Volume' => '75cl per bottle', 'Pack' => '12 bottles'],
             'new_arrival' => true],

            // ── Groceries: Snacks ──────────────────────────────────────────
            ['name' => 'Pringles Original 165g', 'category' => 'snacks', 'brand' => null,
             'price' => 2800, 'discount_price' => 2400, 'stock' => 600,
             'short' => 'Original Pringles stackable potato chips.',
             'specs' => ['Weight' => '165g', 'Flavour' => 'Original'],
             'best_seller' => true],

            ['name' => 'Digestive Biscuits 400g', 'category' => 'snacks', 'brand' => null,
             'price' => 1800, 'discount_price' => null, 'stock' => 800,
             'short' => 'Whole wheat digestive biscuits, great with tea.',
             'specs' => ['Weight' => '400g'],
             'flash_sale' => true],

            ['name' => 'Indomie Instant Noodles (40 Pack)', 'category' => 'snacks', 'brand' => null,
             'price' => 6500, 'discount_price' => 5800, 'stock' => 1500,
             'short' => "Nigeria's favourite instant noodles, 40-pack carton.",
             'specs' => ['Flavour' => 'Chicken', 'Pack' => '40 x 70g'],
             'featured' => true, 'best_seller' => true],

            ['name' => 'Cadbury Chocolate Fingers', 'category' => 'snacks', 'brand' => null,
             'price' => 2200, 'discount_price' => 1900, 'stock' => 700,
             'short' => 'Delicious chocolate-covered biscuit fingers.',
             'specs' => ['Weight' => '114g'],
             'new_arrival' => true],

            ['name' => "Gala Sausage Roll (Box of 12)", 'category' => 'snacks', 'brand' => null,
             'price' => 3600, 'discount_price' => null, 'stock' => 400,
             'short' => "Nigeria's iconic Gala sausage roll, 12 per box.",
             'specs' => ['Count' => '12 pieces'],
             'best_seller' => true],
        ];

        foreach ($products as $data) {
            $category = $cat($data['category']);
            $brandId  = $data['brand'] ? $brand($data['brand']) : null;
            $slug     = Str::slug($data['name']);

            // Map category to a stable picsum seed for consistent placeholder images
            $imageSeeds = [
                'smartphones' => 180, 'laptops' => 119, 'electronics' => 48,
                'shoes' => 349, 'fashion' => 292, 'clothing' => 326,
                'furniture' => 20, 'kitchen' => 292, 'home' => 137,
                'skincare' => 325, 'beauty' => 356, 'hair' => 334,
                'sports' => 416, 'fitness' => 247, 'outdoors' => 15,
                'beverages' => 431, 'groceries' => 429, 'snacks' => 493,
            ];
            $imgSeed = $imageSeeds[$data['category']] ?? (100 + ($category?->id ?? 0));
            $thumbnailUrl = "https://picsum.photos/seed/{$data['category']}{$imgSeed}/400/400";

            $existing = Product::where('slug', $slug)->first();
            if ($existing && !$existing->thumbnail) {
                $existing->update(['thumbnail' => $thumbnailUrl]);
            }

            Product::firstOrCreate(
                ['slug' => $slug],
                [
                    'name'              => $data['name'],
                    'slug'              => $slug,
                    'sku'               => 'SP-' . strtoupper(Str::random(8)),
                    'category_id'       => $category?->id ?? 1,
                    'brand_id'          => $brandId,
                    'price'             => $data['price'],
                    'discount_price'    => $data['discount_price'] ?? null,
                    'stock_quantity'    => $data['stock'],
                    'short_description' => $data['short'],
                    'description'       => '<p>' . $data['short'] . '</p>',
                    'specifications'    => $data['specs'],
                    'thumbnail'         => $thumbnailUrl,
                    'status'            => 'active',
                    'is_featured'       => $data['featured'] ?? false,
                    'is_new_arrival'    => $data['new_arrival'] ?? false,
                    'is_best_seller'    => $data['best_seller'] ?? false,
                    'is_flash_sale'     => $data['flash_sale'] ?? false,
                ]
            );
        }
    }
}
