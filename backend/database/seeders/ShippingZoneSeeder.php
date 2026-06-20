<?php

namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        $zones = [
            [
                'name'                     => 'Lagos',
                'states'                   => ['Lagos'],
                'base_fee'                 => 1500,
                'free_shipping_threshold'  => 50000,
                'estimated_days_min'       => 1,
                'estimated_days_max'       => 2,
                'is_active'                => true,
            ],
            [
                'name'                     => 'South West',
                'states'                   => ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
                'base_fee'                 => 2500,
                'free_shipping_threshold'  => 70000,
                'estimated_days_min'       => 2,
                'estimated_days_max'       => 4,
                'is_active'                => true,
            ],
            [
                'name'                     => 'South East & South South',
                'states'                   => ['Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi', 'Rivers', 'Bayelsa', 'Akwa Ibom', 'Delta', 'Cross River', 'Edo'],
                'base_fee'                 => 3000,
                'free_shipping_threshold'  => 80000,
                'estimated_days_min'       => 3,
                'estimated_days_max'       => 5,
                'is_active'                => true,
            ],
            [
                'name'                     => 'North',
                'states'                   => ['Kano', 'Kaduna', 'Abuja', 'Niger', 'Katsina', 'Sokoto', 'Zamfara', 'Kebbi', 'Jigawa', 'Borno', 'Yobe', 'Adamawa', 'Taraba', 'Gombe', 'Bauchi', 'Plateau', 'Nassarawa', 'Benue', 'Kogi', 'Kwara', 'FCT'],
                'base_fee'                 => 3500,
                'free_shipping_threshold'  => 100000,
                'estimated_days_min'       => 4,
                'estimated_days_max'       => 7,
                'is_active'                => true,
            ],
        ];

        foreach ($zones as $zone) {
            ShippingZone::firstOrCreate(['name' => $zone['name']], $zone);
        }
    }
}
