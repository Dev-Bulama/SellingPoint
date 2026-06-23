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
            'active_environment', 'local_api_url', 'production_api_url',
            'production_domain', 'force_production',
            'support_chat_script',
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
                    Forms\Components\FileUpload::make('app_logo')
                        ->label('App Logo')
                        ->image()
                        ->disk('public')
                        ->directory('settings')
                        ->visibility('public')
                        ->imageResizeMode('cover')
                        ->imageResizeTargetWidth('512')
                        ->imageResizeTargetHeight('512')
                        ->helperText('Displayed on the splash screen. Recommended: 512×512 PNG.')
                        ->columnSpanFull(),
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

                Forms\Components\Tabs\Tab::make('Support')->schema([
                    Forms\Components\Textarea::make('support_chat_script')
                        ->label('Live Chat Script')
                        ->rows(6)
                        ->placeholder('<script>/* Paste your chatbot embed script here */</script>')
                        ->helperText('Paste the full embed script from your chat provider (e.g. Tidio, Crisp, Intercom, Tawk.to). The bubble will appear on the Support page of the mobile app.')
                        ->columnSpanFull(),
                ])->columns(1),

                Forms\Components\Tabs\Tab::make('Environment')->schema([
                    Forms\Components\Select::make('active_environment')
                        ->label('Active Environment')
                        ->options(['local' => 'Local Development', 'production' => 'Production'])
                        ->default('local')
                        ->required()
                        ->helperText('Controls which backend the mobile app connects to (only applies when Force Production is off).'),
                    Forms\Components\Toggle::make('force_production')
                        ->label('Force Mobile App to Use Production')
                        ->helperText('When ON, the mobile app always uses Production regardless of build type.'),
                    Forms\Components\TextInput::make('local_api_url')
                        ->label('Local API URL')
                        ->url()
                        ->placeholder('http://10.0.2.2:8000/api/v1')
                        ->helperText('Used during local development (Android emulator default: 10.0.2.2). For physical devices use your PC\'s LAN IP.'),
                    Forms\Components\TextInput::make('production_api_url')
                        ->label('Production API URL')
                        ->url()
                        ->placeholder('https://sellingpoint.ng/api/v1')
                        ->helperText('The live backend API URL for release builds.'),
                    Forms\Components\TextInput::make('production_domain')
                        ->label('Production Domain')
                        ->url()
                        ->placeholder('https://sellingpoint.ng')
                        ->helperText('Root domain (used for image URLs and deep links).'),
                    Forms\Components\Placeholder::make('active_api_url_preview')
                        ->label('Currently Active API URL')
                        ->content(function () {
                            $env   = Setting::get('active_environment', 'local');
                            $force = (bool) Setting::get('force_production', false);
                            $url   = ($force || $env === 'production')
                                ? Setting::get('production_api_url', 'https://sellingpoint.ng/api/v1')
                                : Setting::get('local_api_url', 'http://10.0.2.2:8000/api/v1');
                            return $url;
                        }),
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
