<?php
namespace App\Filament\Resources;
use App\Filament\Resources\ShippingZoneResource\Pages;
use App\Models\ShippingZone;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ShippingZoneResource extends Resource {
    protected static ?string $model = ShippingZone::class;
    protected static ?string $navigationIcon = 'heroicon-o-truck';
    protected static ?string $navigationGroup = 'Configuration';

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\TextInput::make('name')->required(),
            Forms\Components\TagsInput::make('states')->required(),
            Forms\Components\TextInput::make('base_fee')->numeric()->prefix('₦')->required(),
            Forms\Components\TextInput::make('free_shipping_threshold')->numeric()->prefix('₦')->nullable(),
            Forms\Components\TextInput::make('estimated_days_min')->numeric()->default(1),
            Forms\Components\TextInput::make('estimated_days_max')->numeric()->default(5),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('name'),
            Tables\Columns\TextColumn::make('base_fee')->money('NGN'),
            Tables\Columns\TextColumn::make('free_shipping_threshold')->money('NGN')->placeholder('None'),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
        ])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListShippingZones::route('/'),
            'create' => Pages\CreateShippingZone::route('/create'),
            'edit'   => Pages\EditShippingZone::route('/{record}/edit'),
        ];
    }
}
