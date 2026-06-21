<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\NotificationResource;
use App\Models\PushToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()->userNotifications()
            ->latest()->paginate(20);

        return response()->json([
            'data'         => NotificationResource::collection($notifications),
            'unread_count' => $request->user()->userNotifications()->where('is_read', false)->count(),
            'meta'         => ['current_page' => $notifications->currentPage(), 'last_page' => $notifications->lastPage()],
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $notification = $request->user()->userNotifications()->findOrFail($id);
        $notification->update(['is_read' => true, 'read_at' => now()]);
        return response()->json(['message' => 'Marked as read']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->userNotifications()->where('is_read', false)->update([
            'is_read' => true, 'read_at' => now(),
        ]);
        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function savePushToken(Request $request): JsonResponse
    {
        $request->validate([
            'token'      => 'required|string',
            'platform'   => 'nullable|in:android,ios',
            'app_version' => 'nullable|string',
        ]);

        PushToken::updateOrCreate(
            ['player_id' => $request->token],
            [
                'user_id'     => $request->user()->id,
                'device_type' => $request->platform ?? 'android',
                'app_version' => $request->app_version,
            ]
        );

        return response()->json(['message' => 'Push token saved']);
    }
}
