<?php
namespace App\Filament\Resources;
use App\Filament\Resources\CouponResource\Pages;
use App\Models\Coupon;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class CouponResource extends Resource {
    protected static ?string $model = Coupon::class;
    protected static ?string $navigationIcon = 'heroicon-o-ticket';
    protected static ?string $navigationGroup = 'Marketing';

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\TextInput::make('code')->required()->uppercase()->unique(ignoreRecord: true),
            Forms\Components\Textarea::make('description')->rows(2),
            Forms\Components\Select::make('type')->options(['percentage' => 'Percentage', 'fixed' => 'Fixed Amount'])->required(),
            Forms\Components\TextInput::make('value')->numeric()->required(),
            Forms\Components\TextInput::make('minimum_order_amount')->numeric()->prefix('₦')->default(0),
            Forms\Components\TextInput::make('maximum_discount')->numeric()->prefix('₦')->nullable(),
            Forms\Components\TextInput::make('usage_limit')->numeric()->nullable(),
            Forms\Components\TextInput::make('usage_limit_per_user')->numeric()->default(1),
            Forms\Components\DateTimePicker::make('starts_at'),
            Forms\Components\DateTimePicker::make('expires_at'),
            Forms\Components\Toggle::make('is_active')->default(true),
        ])->columns(2);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('code')->searchable()->copyable(),
            Tables\Columns\BadgeColumn::make('type'),
            Tables\Columns\TextColumn::make('value'),
            Tables\Columns\TextColumn::make('usage_count')->label('Used'),
            Tables\Columns\TextColumn::make('usage_limit')->placeholder('Unlimited'),
            Tables\Columns\IconColumn::make('is_active')->boolean(),
            Tables\Columns\TextColumn::make('expires_at')->dateTime()->placeholder('No expiry'),
        ])
        ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()]);
    }

    public static function getPages(): array {
        return [
            'index'  => Pages\ListCoupons::route('/'),
            'create' => Pages\CreateCoupon::route('/create'),
            'edit'   => Pages\EditCoupon::route('/{record}/edit'),
        ];
    }
}
