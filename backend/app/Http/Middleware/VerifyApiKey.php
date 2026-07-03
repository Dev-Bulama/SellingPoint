<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $expectedKey = config('app.api_key');

        // If no key is configured, skip check (backwards compat during rollout)
        if (empty($expectedKey)) {
            return $next($request);
        }

        $providedKey = $request->header('X-Api-Key')
            ?? $request->header('X-App-Key')
            ?? $request->query('api_key');

        if (!$providedKey || !hash_equals($expectedKey, $providedKey)) {
            return response()->json(['message' => 'Invalid API key'], 401);
        }

        return $next($request);
    }
}
