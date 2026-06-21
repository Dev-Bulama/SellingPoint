<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PushNotificationResource\Pages;
use App\Models\PushToken;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Http;
use App\Models\Setting;

class PushNotificationResource extends Resource
{
    protected static ?string $model = PushToken::class;
    protected static ?string $navigationIcon = 'heroicon-o-bell';
    protected static ?string $navigationGroup = 'Configuration';
    protected static ?string $navigationLabel = 'Push Notifications';
    protected static ?string $pluralLabel = 'Push Notifications';
    protected static ?int $navigationSort = 3;

    public static function canCreate(): bool { return false; }

    public static function form(Form $form): Form
    {
        return $form->schema([]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('User')->searchable(),
                Tables\Columns\TextColumn::make('player_id')->label('Player ID')->limit(30)->copyable(),
                Tables\Columns\TextColumn::make('device_type')->label('Platform')->badge(),
                Tables\Columns\TextColumn::make('app_version')->label('App Version'),
                Tables\Columns\TextColumn::make('updated_at')->label('Last Seen')->since(),
            ])
            ->headerActions([
                Tables\Actions\Action::make('send_broadcast')
                    ->label('Send Broadcast Notification')
                    ->icon('heroicon-o-megaphone')
                    ->color('primary')
                    ->form([
                        Forms\Components\TextInput::make('title')->required()->label('Notification Title'),
                        Forms\Components\Textarea::make('message')->required()->rows(3)->label('Message'),
                        Forms\Components\Select::make('target')
                            ->options(['all' => 'All Users', 'android' => 'Android Only', 'ios' => 'iOS Only'])
                            ->default('all')->required(),
                    ])
                    ->action(function (array $data) {
                        $appId   = Setting::get('onesignal_app_id');
                        $apiKey  = Setting::get('onesignal_rest_api_key');

                        if (!$appId || !$apiKey || str_contains($appId, 'your-')) {
                            Notification::make()
                                ->title('OneSignal not configured')
                                ->body('Please configure OneSignal App ID and REST API key in Settings.')
                                ->warning()->send();
                            return;
                        }

                        $payload = [
                            'app_id'   => $appId,
                            'headings' => ['en' => $data['title']],
                            'contents' => ['en' => $data['message']],
                        ];

                        if ($data['target'] === 'all') {
                            $payload['included_segments'] = ['All'];
                        } else {
                            $payload['filters'] = [
                                ['field' => 'device_type', 'relation' => '=', 'value' => $data['target'] === 'android' ? '1' : '0'],
                            ];
                        }

                        $response = Http::withHeaders([
                            'Authorization' => 'Basic ' . $apiKey,
                            'Content-Type'  => 'application/json',
                        ])->post('https://onesignal.com/api/v1/notifications', $payload);

                        if ($response->successful()) {
                            $recipients = $response->json('recipients', 0);
                            Notification::make()
                                ->title("Notification sent to {$recipients} devices")
                                ->success()->send();
                        } else {
                            Notification::make()
                                ->title('Failed to send notification')
                                ->body($response->json('errors.0') ?? 'Unknown error')
                                ->danger()->send();
                        }
                    }),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('device_type')
                    ->options(['android' => 'Android', 'ios' => 'iOS']),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPushNotifications::route('/'),
        ];
    }
}
