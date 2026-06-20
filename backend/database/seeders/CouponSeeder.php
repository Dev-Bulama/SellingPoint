<?php

namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code'                  => 'WELCOME10',
                'description'           => 'Welcome discount — 10% off your first order',
                'type'                  => 'percentage',
                'value'                 => 10,
                'minimum_order_amount'  => 5000,
                'maximum_discount'      => 5000,
                'usage_limit'           => 1000,
                'is_active'             => true,
            ],
            [
                'code'                  => 'SAVE5000',
                'description'           => 'Get ₦5,000 off orders above ₦50,000',
                'type'                  => 'fixed',
                'value'                 => 5000,
                'minimum_order_amount'  => 50000,
                'usage_limit'           => 500,
                'is_active'             => true,
            ],
            [
                'code'                  => 'FLASH20',
                'description'           => '20% off flash sale items',
                'type'                  => 'percentage',
                'value'                 => 20,
                'minimum_order_amount'  => 10000,
                'maximum_discount'      => 20000,
                'expires_at'            => now()->addDays(7),
                'is_active'             => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::firstOrCreate(['code' => $coupon['code']], $coupon);
        }
    }
}
