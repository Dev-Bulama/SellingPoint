<?php

namespace App\Filament\Resources\SupportIssueResource\Pages;

use App\Filament\Resources\SupportIssueResource;
use Filament\Resources\Pages\EditRecord;

class EditSupportIssue extends EditRecord
{
    protected static string $resource = SupportIssueResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
