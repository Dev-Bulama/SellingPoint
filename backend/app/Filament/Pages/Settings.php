<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Pages\Page;

class Settings extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';
    protected static string $view = 'filament.pages.settings';
    protected static ?string $navigationGroup = 'Configuration';
    protected static ?string $title = 'App Settings';

    public ?array $data = [];

    public function mount(): void
    {
        $keys = [
            'app_name', 'app_logo', 'support_email', 'support_phone',
            'whatsapp_number', 'currency', 'currency_symbol',
            'paystack_public_key', 'paystack_secret_key', 'paystack_mode',
            'onesignal_app_id', 'onesignal_rest_api_key',
            'cash_on_delivery_enabled', 'maintenance_mode',
            'min_app_version', 'force_update_message',
            'tax_percentage', 'about_app',
        ];
        foreach ($keys as $key) {
            $this->data[$key] = Setting::get($key, '');
        }
        $this->form->fill($this->data);
    }

    public function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make()->columnSpanFull()->tabs([
                Forms\Components\Tabs\Tab::make('General')->schema([
                    Forms\Components\TextInput::make('app_name')->label('App Name')->required(),
                    Forms\Components\TextInput::make('support_email')->email(),
                    Forms\Components\TextInput::make('support_phone'),
                    Forms\Components\TextInput::make('whatsapp_number'),
                    Forms\Components\TextInput::make('currency')->default('NGN'),
                    Forms\Components\TextInput::make('currency_symbol')->default('₦'),
                    Forms\Components\TextInput::make('tax_percentage')->numeric()->default(0)->suffix('%'),
                    Forms\Components\Toggle::make('cash_on_delivery_enabled')->label('Cash on Delivery'),
                    Forms\Components\Toggle::make('maintenance_mode'),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Paystack')->schema([
                    Forms\Components\Select::make('paystack_mode')
                        ->options(['test' => 'Test Mode', 'live' => 'Live Mode'])->default('test'),
                    Forms\Components\TextInput::make('paystack_public_key')->label('Public Key'),
                    Forms\Components\TextInput::make('paystack_secret_key')->label('Secret Key')->password()->revealable(),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('OneSignal')->schema([
                    Forms\Components\TextInput::make('onesignal_app_id')->label('App ID'),
                    Forms\Components\TextInput::make('onesignal_rest_api_key')->label('REST API Key')->password()->revealable(),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('App Update')->schema([
                    Forms\Components\TextInput::make('min_app_version')->label('Minimum App Version'),
                    Forms\Components\Textarea::make('force_update_message')->rows(2)->label('Force Update Message'),
                ])->columns(2),
            ]),
        ])->statePath('data');
    }

    public function save(): void
    {
        $data = $this->form->getState();
        foreach ($data as $key => $value) {
            Setting::set($key, $value);
        }
        Notification::make()->title('Settings saved successfully')->success()->send();
    }

    protected function getFormActions(): array
    {
        return [
            Forms\Components\Actions\Action::make('save')
                ->label('Save Settings')->submit('save'),
        ];
    }
}
