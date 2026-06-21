<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportIssue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function submitIssue(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'issue_type'   => 'required|string',
            'description'  => 'required|string|min:10',
            'order_number' => 'nullable|string',
        ]);

        $issue = SupportIssue::create([
            'user_id'      => $request->user()->id,
            'issue_type'   => $validated['issue_type'],
            'description'  => $validated['description'],
            'order_number' => $validated['order_number'] ?? null,
            'status'       => 'open',
        ]);

        return response()->json([
            'message' => 'Your issue has been submitted successfully.',
            'data'    => $issue,
        ], 201);
    }

    public function myIssues(Request $request): JsonResponse
    {
        $issues = SupportIssue::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['data' => $issues]);
    }
}
