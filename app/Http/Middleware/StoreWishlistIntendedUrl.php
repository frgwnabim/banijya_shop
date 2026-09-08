<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StoreWishlistIntendedUrl
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null && $request->filled('return_to')) {
            $returnTo = (string) $request->input('return_to');

            if (str_starts_with($returnTo, '/') && ! str_starts_with($returnTo, '//')) {
                $request->session()->put('url.intended', $returnTo);

                return redirect()->route('login');
            }
        }

        return $next($request);
    }
}