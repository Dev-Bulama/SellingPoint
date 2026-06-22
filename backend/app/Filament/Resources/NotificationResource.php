<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NotificationResource\Pages;
use App\Models\User;
use App\Models\UserNotification;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NotificationResource extends Resource
{
    protected static ?string $model = UserNotification::class;
    protected static ?string $navigationIcon = 'heroicon-o-bell-alert';
    protected static ?string $navigationGroup = 'Configuration';
    protected static ?string $navigationLabel = 'In-App Notifications';
    protected static ?string $pluralLabel = 'In-App Notifications';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make()->schema([
                Forms\Components\Select::make('target')
                    ->label('Send To')
                    ->options([
                        'all'      => 'All Users',
                        'specific' => 'Specific User',
                    ])
                    ->default('all')
                    ->required()
                    ->reactive()
                    ->hiddenOn('edit'),

                Forms\Components\Select::make('user_id')
                    ->label('Select User')
                    ->options(fn () => User::orderBy('name')->pluck('name', 'id'))
                    ->searchable()
                    ->required()
                    ->visible(fn (Forms\Get $get) => $get('target') === 'specific')
                    ->hiddenOn('edit'),

                Forms\Components\Select::make('type')
                    ->options([
                        'general' => 'General',
                        'promo'   => 'Promotion',
                        'order'   => 'Order Update',
                        'system'  => 'System',
                    ])
                    ->default('general')
                    ->required(),

                Forms\Components\TextInput::make('title')->required()->maxLength(255),
                Forms\Components\Textarea::make('body')->required()->rows(3),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->default('— Broadcast —')
                    ->searchable(),
                Tables\Columns\TextColumn::make('type')->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'promo'  => 'success',
                        'order'  => 'info',
                        'system' => 'warning',
                        default  => 'gray',
                    }),
                Tables\Columns\TextColumn::make('title')->searchable()->limit(40),
                Tables\Columns\TextColumn::make('body')->limit(60)->wrap(),
                Tables\Columns\IconColumn::make('is_read')->boolean()->label('Read'),
                Tables\Columns\TextColumn::make('created_at')->since()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options(['general' => 'General', 'promo' => 'Promo', 'order' => 'Order', 'system' => 'System']),
                Tables\Filters\TernaryFilter::make('is_read')->label('Read status'),
            ])
            ->headerActions([
                Tables\Actions\Action::make('broadcast')
                    ->label('Send to All Users')
                    ->icon('heroicon-o-megaphone')
                    ->color('primary')
                    ->form([
                        Forms\Components\Select::make('type')
                            ->options(['general' => 'General', 'promo' => 'Promotion', 'order' => 'Order Update', 'system' => 'System'])
                            ->default('general')->required(),
                        Forms\Components\TextInput::make('title')->required(),
                        Forms\Components\Textarea::make('body')->required()->rows(3),
                    ])
                    ->action(function (array $data) {
                        $count = 0;
                        User::chunk(100, function ($users) use ($data, &$count) {
                            foreach ($users as $user) {
                                UserNotification::create([
                                    'user_id' => $user->id,
                                    'type'    => $data['type'],
                                    'title'   => $data['title'],
                                    'body'    => $data['body'],
                                ]);
                                $count++;
                            }
                        });
                        Notification::make()
                            ->title("Notification sent to {$count} users")
                            ->success()->send();
                    }),
            ])
            ->actions([
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function canCreate(): bool { return true; }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListNotifications::route('/'),
            'create' => Pages\CreateNotification::route('/create'),
        ];
    }
}
