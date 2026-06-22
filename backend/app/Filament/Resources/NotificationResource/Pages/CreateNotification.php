<?php

namespace App\Filament\Resources\NotificationResource\Pages;

use App\Filament\Resources\NotificationResource;
use App\Models\User;
use App\Models\UserNotification;
use Filament\Resources\Pages\CreateRecord;

class CreateNotification extends CreateRecord
{
    protected static string $resource = NotificationResource::class;

    protected function handleRecordCreation(array $data): \Illuminate\Database\Eloquent\Model
    {
        $target = $data['target'] ?? 'specific';

        if ($target === 'all') {
            $first = null;
            User::chunk(100, function ($users) use ($data, &$first) {
                foreach ($users as $user) {
                    $record = UserNotification::create([
                        'user_id' => $user->id,
                        'type'    => $data['type'],
                        'title'   => $data['title'],
                        'body'    => $data['body'],
                    ]);
                    if (!$first) $first = $record;
                }
            });
            return $first ?? new UserNotification();
        }

        return UserNotification::create([
            'user_id' => $data['user_id'],
            'type'    => $data['type'],
            'title'   => $data['title'],
            'body'    => $data['body'],
        ]);
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('index');
    }
}
