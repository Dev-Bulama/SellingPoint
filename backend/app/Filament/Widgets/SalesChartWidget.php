<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class SalesChartWidget extends ChartWidget
{
    protected static ?string $heading = 'Revenue (Last 30 Days)';
    protected static ?int $sort = 2;

    protected function getData(): array
    {
        $data = collect(range(29, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            return [
                'date'   => $date->format('M d'),
                'amount' => Order::where('payment_status', 'paid')
                    ->whereDate('created_at', $date)->sum('total'),
            ];
        });

        return [
            'datasets' => [[
                'label'           => 'Revenue (₦)',
                'data'            => $data->pluck('amount')->toArray(),
                'borderColor'     => '#f97316',
                'backgroundColor' => 'rgba(249,115,22,0.1)',
                'fill'            => true,
            ]],
            'labels' => $data->pluck('date')->toArray(),
        ];
    }

    protected function getType(): string { return 'line'; }
}
