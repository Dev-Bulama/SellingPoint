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
            'brand_color', 'brand_color_dark', 'brand_color_light',
            'play_store_url', 'app_store_url',
            // Email SMTP
            'mail_mailer', 'mail_host', 'mail_port',
            'mail_username', 'mail_password', 'mail_encryption',
            'mail_from_address', 'mail_from_name',
            // Email Templates
            'email_welcome_subject', 'email_welcome_body',
            'email_order_confirmed_subject', 'email_order_confirmed_body',
            'email_order_processing_subject', 'email_order_processing_body',
            'email_order_shipped_subject', 'email_order_shipped_body',
            'email_order_delivered_subject', 'email_order_delivered_body',
            'email_order_cancelled_subject', 'email_order_cancelled_body',
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
                    Forms\Components\TextInput::make('brand_color')
                        ->label('Brand Color (Hex)')
                        ->placeholder('#F97316')
                        ->helperText('Primary brand color used on the website landing page. Example: #F97316')
                        ->default('#F97316'),
                    Forms\Components\TextInput::make('brand_color_dark')
                        ->label('Brand Color Dark (Hex)')
                        ->placeholder('#EA6C0B')
                        ->helperText('Darker shade for hover/gradient effects.')
                        ->default('#EA6C0B'),
                    Forms\Components\TextInput::make('play_store_url')
                        ->label('Google Play Store URL')
                        ->url()
                        ->placeholder('https://play.google.com/store/apps/details?id=com.yourapp'),
                    Forms\Components\TextInput::make('app_store_url')
                        ->label('Apple App Store URL')
                        ->url()
                        ->placeholder('https://apps.apple.com/app/your-app'),
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

                Forms\Components\Tabs\Tab::make('Email (SMTP)')->schema([
                    Forms\Components\Section::make('Mail Driver')->schema([
                        Forms\Components\Select::make('mail_mailer')
                            ->label('Mail Driver')
                            ->options([
                                'smtp'     => 'SMTP',
                                'mailgun'  => 'Mailgun',
                                'ses'      => 'Amazon SES',
                                'sendgrid' => 'SendGrid',
                                'log'      => 'Log (Testing only)',
                            ])
                            ->default('smtp')
                            ->required()
                            ->helperText('Select your email sending service. Use "Log" to test without sending real emails.'),
                    ])->columns(1)->collapsible(false),

                    Forms\Components\Section::make('SMTP Server')->schema([
                        Forms\Components\TextInput::make('mail_host')
                            ->label('SMTP Host')
                            ->placeholder('smtp.gmail.com')
                            ->helperText('Gmail: smtp.gmail.com | Zoho: smtp.zoho.com | Mailgun: smtp.mailgun.org'),
                        Forms\Components\TextInput::make('mail_port')
                            ->label('SMTP Port')
                            ->numeric()
                            ->placeholder('587')
                            ->helperText('TLS: 587 | SSL: 465 | Plain: 25'),
                        Forms\Components\Select::make('mail_encryption')
                            ->label('Encryption')
                            ->options([
                                'tls'  => 'TLS (Recommended)',
                                'ssl'  => 'SSL',
                                ''     => 'None',
                            ])
                            ->default('tls'),
                        Forms\Components\TextInput::make('mail_username')
                            ->label('SMTP Username')
                            ->placeholder('your@email.com'),
                        Forms\Components\TextInput::make('mail_password')
                            ->label('SMTP Password / App Password')
                            ->password()
                            ->revealable()
                            ->helperText('For Gmail, generate an App Password at myaccount.google.com → Security → 2-Step Verification → App passwords.'),
                    ])->columns(2)->collapsible()->collapsed(false),

                    Forms\Components\Section::make('Sender Identity')->schema([
                        Forms\Components\TextInput::make('mail_from_address')
                            ->label('From Email Address')
                            ->email()
                            ->placeholder('noreply@sellingpointshop.com'),
                        Forms\Components\TextInput::make('mail_from_name')
                            ->label('From Name')
                            ->placeholder('SellingPoint'),
                    ])->columns(2)->collapsible()->collapsed(false),
                ])->columns(1),

                Forms\Components\Tabs\Tab::make('Email Templates')->schema([
                    Forms\Components\Section::make('Welcome Email')->schema([
                        Forms\Components\TextInput::make('email_welcome_subject')
                            ->label('Subject')
                            ->placeholder('Welcome to {app_name}! Your account is ready')
                            ->helperText('Available variables: {app_name}, {user_name}')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('email_welcome_body')
                            ->label('Body')
                            ->rows(5)
                            ->placeholder("Thank you for joining {app_name}! We're excited to have you.\n\nYour account is ready. Browse thousands of products and enjoy a seamless shopping experience.\n\nIf you need help, our support team is always here.")
                            ->helperText('Available variables: {app_name}, {user_name}')
                            ->columnSpanFull(),
                    ])->collapsible()->collapsed(false),

                    Forms\Components\Section::make('Order Confirmed')->schema([
                        Forms\Components\TextInput::make('email_order_confirmed_subject')
                            ->label('Subject')
                            ->placeholder('Order {order_number} Confirmed!')
                            ->helperText('Variables: {app_name}, {user_name}, {order_number}, {order_total}')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('email_order_confirmed_body')
                            ->label('Body')
                            ->rows(4)
                            ->placeholder("We have received your order and are preparing it for processing.")
                            ->helperText('Variables: {app_name}, {user_name}, {order_number}, {order_total}')
                            ->columnSpanFull(),
                    ])->collapsible()->collapsed(true),

                    Forms\Components\Section::make('Order Processing')->schema([
                        Forms\Components\TextInput::make('email_order_processing_subject')
                            ->label('Subject')
                            ->placeholder('Order {order_number} is Being Processed')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('email_order_processing_body')
                            ->label('Body')
                            ->rows(4)
                            ->placeholder("Our team is packing your items and getting them ready for shipment.")
                            ->columnSpanFull(),
                    ])->collapsible()->collapsed(true),

                    Forms\Components\Section::make('Order Shipped')->schema([
                        Forms\Components\TextInput::make('email_order_shipped_subject')
                            ->label('Subject')
                            ->placeholder('Order {order_number} Has Been Shipped!')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('email_order_shipped_body')
                            ->label('Body')
                            ->rows(4)
                            ->placeholder("Great news — your order is on its way! Your package has been dispatched and is heading to you.")
                            ->columnSpanFull(),
                    ])->collapsible()->collapsed(true),

                    Forms\Components\Section::make('Order Delivered')->schema([
                        Forms\Components\TextInput::make('email_order_delivered_subject')
                            ->label('Subject')
                            ->placeholder('Order {order_number} Delivered')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('email_order_delivered_body')
                            ->label('Body')
                            ->rows(4)
                            ->placeholder("We hope you enjoy your purchase! If anything is wrong, please contact our support team.")
                            ->columnSpanFull(),
                    ])->collapsible()->collapsed(true),

                    Forms\Components\Section::make('Order Cancelled')->schema([
                        Forms\Components\TextInput::make('email_order_cancelled_subject')
                            ->label('Subject')
                            ->placeholder('Order {order_number} Cancelled')
                            ->columnSpanFull(),
                        Forms\Components\Textarea::make('email_order_cancelled_body')
                            ->label('Body')
                            ->rows(4)
                            ->placeholder("Your order was cancelled. If you have questions, please contact support.")
                            ->columnSpanFull(),
                    ])->collapsible()->collapsed(true),
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
                        ->placeholder('https://sellingpointshop.com/api/v1')
                        ->helperText('The live backend API URL for release builds.'),
                    Forms\Components\TextInput::make('production_domain')
                        ->label('Production Domain')
                        ->url()
                        ->placeholder('https://sellingpointshop.com')
                        ->helperText('Root domain (used for image URLs and deep links).'),
                    Forms\Components\Placeholder::make('active_api_url_preview')
                        ->label('Currently Active API URL')
                        ->content(function () {
                            $env   = Setting::get('active_environment', 'local');
                            $force = (bool) Setting::get('force_production', false);
                            $url   = ($force || $env === 'production')
                                ? Setting::get('production_api_url', 'https://sellingpointshop.com/api/v1')
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

        // Apply mail config at runtime so emails use the new settings immediately
        $mailer = $data['mail_mailer'] ?? 'smtp';
        config([
            'mail.default'                              => $mailer,
            'mail.mailers.smtp.host'                    => $data['mail_host'] ?? '',
            'mail.mailers.smtp.port'                    => $data['mail_port'] ?? 587,
            'mail.mailers.smtp.encryption'              => $data['mail_encryption'] ?? 'tls',
            'mail.mailers.smtp.username'                => $data['mail_username'] ?? '',
            'mail.mailers.smtp.password'                => $data['mail_password'] ?? '',
            'mail.from.address'                         => $data['mail_from_address'] ?? '',
            'mail.from.name'                            => $data['mail_from_name'] ?? config('app.name'),
        ]);

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
