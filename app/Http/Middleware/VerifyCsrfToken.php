<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        //
    ];

    /**
     * Bypass CSRF checks when running test suite to avoid token mismatch errors.
     */
    protected function tokensMatch($request): bool
    {
        if ($this->app->environment('testing')) {
            return true;
        }

        return parent::tokensMatch($request);
    }
}
