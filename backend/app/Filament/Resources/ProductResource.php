<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';
    protected static ?string $navigationGroup = 'Catalog';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make()->columnSpanFull()->tabs([
                Forms\Components\Tabs\Tab::make('Basic Info')->schema([
                    Forms\Components\TextInput::make('name')
                        ->required()->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn($state, $set) => $set('slug', Str::slug($state))),
                    Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                    Forms\Components\TextInput::make('sku')->unique(ignoreRecord: true),
                    Forms\Components\Select::make('category_id')
                        ->label('Category')->relationship('category', 'name')->required()->searchable(),
                    Forms\Components\Select::make('brand_id')
                        ->label('Brand')->relationship('brand', 'name')->searchable()->nullable(),
                    Forms\Components\Textarea::make('short_description')->rows(2)->columnSpanFull(),
                    Forms\Components\RichEditor::make('description')->columnSpanFull(),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Pricing & Stock')->schema([
                    Forms\Components\TextInput::make('price')
                        ->numeric()->prefix('₦')->required(),
                    Forms\Components\TextInput::make('discount_price')
                        ->numeric()->prefix('₦')->nullable(),
                    Forms\Components\TextInput::make('stock_quantity')
                        ->numeric()->default(0)->required(),
                    Forms\Components\TextInput::make('min_stock_alert')
                        ->numeric()->default(5),
                    Forms\Components\TextInput::make('weight')
                        ->numeric()->suffix('kg')->nullable(),
                    Forms\Components\Select::make('status')
                        ->options(['active' => 'Active', 'inactive' => 'Inactive', 'draft' => 'Draft'])
                        ->default('active')->required(),
                ])->columns(2),

                Forms\Components\Tabs\Tab::make('Media')->schema([
                    Forms\Components\FileUpload::make('thumbnail')
                        ->image()->directory('products')->imageResizeMode('cover')
                        ->imageCropAspectRatio('1:1')->columnSpanFull(),
                    Forms\Components\Repeater::make('images')
                        ->relationship()->schema([
                            Forms\Components\FileUpload::make('image_path')
                                ->image()->directory('products')->required(),
                            Forms\Components\Toggle::make('is_primary'),
                            Forms\Components\TextInput::make('sort_order')->numeric()->default(0),
                        ])->columns(3)->columnSpanFull(),
                ]),

                Forms\Components\Tabs\Tab::make('Flags')->schema([
                    Forms\Components\Toggle::make('is_featured'),
                    Forms\Components\Toggle::make('is_new_arrival'),
                    Forms\Components\Toggle::make('is_best_seller'),
                    Forms\Components\Toggle::make('is_flash_sale'),
                    Forms\Components\Toggle::make('is_sponsored'),
                ])->columns(3),

                Forms\Components\Tabs\Tab::make('Specifications')->schema([
                    Forms\Components\KeyValue::make('specifications')->columnSpanFull(),
                    Forms\Components\TagsInput::make('tags')->columnSpanFull(),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail')->square(),
                Tables\Columns\TextColumn::make('name')->searchable()->sortable()->limit(40),
                Tables\Columns\TextColumn::make('category.name')->badge(),
                Tables\Columns\TextColumn::make('price')->money('NGN')->sortable(),
                Tables\Columns\TextColumn::make('discount_price')->money('NGN')->placeholder('—'),
                Tables\Columns\TextColumn::make('stock_quantity')->sortable()
                    ->color(fn($state) => $state <= 5 ? 'danger' : 'success'),
                Tables\Columns\TextColumn::make('status')->badge()
                    ->color(fn(string $state): string => match($state) {
                        'active'   => 'success',
                        'draft'    => 'warning',
                        'inactive' => 'danger',
                        default    => 'gray',
                    }),
                Tables\Columns\IconColumn::make('is_featured')->boolean(),
                Tables\Columns\TextColumn::make('sold_count')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->date()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(['active' => 'Active', 'inactive' => 'Inactive', 'draft' => 'Draft']),
                Tables\Filters\SelectFilter::make('category_id')
                    ->label('Category')->relationship('category', 'name'),
                Tables\Filters\TernaryFilter::make('is_featured')->label('Featured'),
                Tables\Filters\Filter::make('low_stock')
                    ->query(fn($query) => $query->where('stock_quantity', '<=', 5))
                    ->label('Low Stock'),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->bulkActions([Tables\Actions\BulkActionGroup::make([Tables\Actions\DeleteBulkAction::make()])]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit'   => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
