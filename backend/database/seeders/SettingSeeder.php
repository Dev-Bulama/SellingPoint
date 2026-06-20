<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'app_name',                'value' => 'Sellingpoint',                     'group' => 'general'],
            ['key' => 'support_email',           'value' => 'support@sellingpoint.com',          'group' => 'general'],
            ['key' => 'support_phone',           'value' => '+234 800 000 0000',                 'group' => 'general'],
            ['key' => 'whatsapp_number',         'value' => '+2348000000000',                    'group' => 'general'],
            ['key' => 'currency',                'value' => 'NGN',                               'group' => 'general'],
            ['key' => 'currency_symbol',         'value' => '₦',                                'group' => 'general'],
            ['key' => 'tax_percentage',          'value' => '0',                                 'group' => 'general'],
            ['key' => 'cash_on_delivery_enabled','value' => '1',                                 'group' => 'general'],
            ['key' => 'maintenance_mode',        'value' => '0',                                 'group' => 'general'],
            ['key' => 'paystack_mode',           'value' => 'test',                              'group' => 'payment'],
            ['key' => 'paystack_public_key',     'value' => 'pk_test_xxxxxxxxxxxxxxxxxxxx',      'group' => 'payment'],
            ['key' => 'paystack_secret_key',     'value' => 'sk_test_xxxxxxxxxxxxxxxxxxxx',      'group' => 'payment'],
            ['key' => 'onesignal_app_id',        'value' => 'your-onesignal-app-id',             'group' => 'notifications'],
            ['key' => 'onesignal_rest_api_key',  'value' => 'your-onesignal-rest-api-key',       'group' => 'notifications'],
            ['key' => 'min_app_version',         'value' => '1.0.0',                             'group' => 'app'],
            ['key' => 'force_update_message',    'value' => 'Please update your app to continue shopping.', 'group' => 'app'],
        ];

        foreach ($settings as $setting) {
            Setting::firstOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
