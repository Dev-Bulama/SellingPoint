<?php
namespace App\Filament\Resources;
use App\Filament\Resources\ReviewResource\Pages;
use App\Models\Review;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ReviewResource extends Resource {
    protected static ?string $model = Review::class;
    protected static ?string $navigationIcon = 'heroicon-o-star';
    protected static ?string $navigationGroup = 'Sales';

    public static function form(Form $form): Form {
        return $form->schema([
            Forms\Components\Select::make('status')
                ->options(['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected'])->required(),
            Forms\Components\Textarea::make('admin_reply')->rows(3),
        ]);
    }

    public static function table(Table $table): Table {
        return $table->columns([
            Tables\Columns\TextColumn::make('user.name')->label('Customer')->searchable(),
            Tables\Columns\TextColumn::make('product.name')->label('Product')->limit(30),
            Tables\Columns\TextColumn::make('rating'),
            Tables\Columns\TextColumn::make('title')->limit(40),
            Tables\Columns\BadgeColumn::make('status')
                ->colors(['warning' => 'pending', 'success' => 'approved', 'danger' => 'rejected']),
            Tables\Columns\IconColumn::make('is_verified_purchase')->boolean()->label('Verified'),
            Tables\Columns\TextColumn::make('created_at')->date(),
        ])
        ->filters([
            Tables\Filters\SelectFilter::make('status')
                ->options(['pending' => 'Pending', 'approved' => 'Approved', 'rejected' => 'Rejected']),
        ])
        ->actions([
            Tables\Actions\EditAction::make(),
            Tables\Actions\Action::make('approve')
                ->action(fn($record) => $record->update(['status' => 'approved']))
                ->color('success')->icon('heroicon-o-check'),
            Tables\Actions\Action::make('reject')
                ->action(fn($record) => $record->update(['status' => 'rejected']))
                ->color('danger')->icon('heroicon-o-x-mark'),
        ]);
    }

    public static function getPages(): array {
        return [
            'index' => Pages\ListReviews::route('/'),
            'edit'  => Pages\EditReview::route('/{record}/edit'),
        ];
    }
}
