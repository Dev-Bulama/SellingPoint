<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SupportIssueResource\Pages;
use App\Models\SupportIssue;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SupportIssueResource extends Resource
{
    protected static ?string $model = SupportIssue::class;
    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationGroup = 'Support';
    protected static ?string $navigationLabel = 'Support Issues';
    protected static ?int $navigationSort = 1;

    public static function canCreate(): bool { return false; }

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::where('status', 'open')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Issue Details')->schema([
                Forms\Components\TextInput::make('issue_type')->disabled(),
                Forms\Components\Select::make('status')
                    ->options([
                        'open'        => 'Open',
                        'in_progress' => 'In Progress',
                        'resolved'    => 'Resolved',
                        'closed'      => 'Closed',
                    ])
                    ->required(),
                Forms\Components\Textarea::make('description')->disabled()->rows(5)->columnSpanFull(),
                Forms\Components\TextInput::make('order_number')->disabled(),
            ])->columns(2),

            Forms\Components\Section::make('Admin Reply')->schema([
                Forms\Components\Textarea::make('admin_reply')
                    ->label('Reply to User')
                    ->rows(4)
                    ->placeholder('Type your reply here...')
                    ->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Customer')->searchable(),
                Tables\Columns\TextColumn::make('issue_type')
                    ->label('Type')->badge(),
                Tables\Columns\TextColumn::make('description')
                    ->limit(60)->tooltip(fn($record) => $record->description),
                Tables\Columns\TextColumn::make('order_number')->label('Order #'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->color(fn(string $state): string => match($state) {
                        'open'        => 'warning',
                        'in_progress' => 'info',
                        'resolved'    => 'success',
                        'closed'      => 'gray',
                        default       => 'gray',
                    }),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'open'        => 'Open',
                        'in_progress' => 'In Progress',
                        'resolved'    => 'Resolved',
                        'closed'      => 'Closed',
                    ]),
            ])
            ->actions([
                Tables\Actions\EditAction::make()->label('Reply'),
                Tables\Actions\Action::make('resolve')
                    ->action(fn($record) => $record->update(['status' => 'resolved']))
                    ->color('success')->icon('heroicon-o-check-circle')
                    ->visible(fn($record) => !in_array($record->status, ['resolved', 'closed'])),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('mark_resolved')
                    ->action(fn($records) => $records->each->update(['status' => 'resolved']))
                    ->label('Mark Resolved')
                    ->color('success'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSupportIssues::route('/'),
            'edit'  => Pages\EditSupportIssue::route('/{record}/edit'),
        ];
    }
}
