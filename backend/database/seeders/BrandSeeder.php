<?php

namespace Database\Seeders;

use App\Models\Brand;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        $brands = [
            ['name' => 'Samsung',  'is_featured' => true],
            ['name' => 'Apple',    'is_featured' => true],
            ['name' => 'Nike',     'is_featured' => true],
            ['name' => 'Adidas',   'is_featured' => true],
            ['name' => 'Sony',     'is_featured' => false],
            ['name' => 'LG',       'is_featured' => false],
            ['name' => 'Xiaomi',   'is_featured' => true],
            ['name' => 'Tecno',    'is_featured' => false],
            ['name' => 'Itel',     'is_featured' => false],
            ['name' => 'Infinix',  'is_featured' => false],
            ['name' => 'HP',       'is_featured' => false],
            ['name' => 'Dell',     'is_featured' => false],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(
                ['slug' => Str::slug($brand['name'])],
                ['name' => $brand['name'], 'is_active' => true, 'is_featured' => $brand['is_featured']]
            );
        }
    }
}
