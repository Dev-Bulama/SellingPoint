<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $totalRevenue = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders  = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        try {
            $totalCustomers = User::role('customer')->count();
        } catch (\Exception $e) {
            $totalCustomers = User::count();
        }
        $lowStock = Product::where('stock_quantity', '<=', 5)->where('status', 'active')->count();

        return [
            Stat::make('Total Revenue', '₦' . number_format($totalRevenue, 2))
                ->description('All time paid orders')
                ->color('success')
                ->icon('heroicon-o-currency-dollar'),

            Stat::make('Total Orders', number_format($totalOrders))
                ->description("{$pendingOrders} pending")
                ->color('primary')
                ->icon('heroicon-o-shopping-bag'),

            Stat::make('Customers', number_format($totalCustomers))
                ->description('Registered customers')
                ->color('info')
                ->icon('heroicon-o-users'),

            Stat::make('Low Stock Products', $lowStock)
                ->description('Need restocking')
                ->color($lowStock > 0 ? 'danger' : 'success')
                ->icon('heroicon-o-exclamation-triangle'),
        ];
    }
}
