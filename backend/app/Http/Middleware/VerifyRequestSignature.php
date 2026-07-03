<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyRequestSignature
{
    // Allowed clock skew in seconds (5 minutes)
    private const WINDOW = 300;

    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('app.api_secret');

        // No secret configured → pass through (safe rollout / local dev)
        if (empty($secret)) {
            return $next($request);
        }

        $timestamp = $request->query('_t');
        $signature = $request->query('_s');

        if (!$timestamp || !$signature) {
            return response()->json(['message' => 'Missing request signature'], 403);
        }

        // Reject stale / future requests
        if (abs(time() - (int) $timestamp) > self::WINDOW) {
            return response()->json(['message' => 'Request expired'], 403);
        }

        // Sign: TIMESTAMP:METHOD:PATH
        $message = $timestamp . ':' . strtoupper($request->method()) . ':' . $request->path();
        $expected = hash_hmac('sha256', $message, $secret);

        if (!hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid request signature'], 403);
        }

        return $next($request);
    }
}
