<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\JobListing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

/**
 * Headline counts for the public landing page.
 *
 * These are real counts, not marketing figures: the landing hero animates
 * them, so anything invented here would be a claim the product cannot back.
 *
 * Cached for five minutes. The numbers move slowly and the landing page is the
 * most-hit route on the site, so three aggregate queries per visitor would be
 * the page's most expensive work for no visible benefit.
 */
class PlatformStatsController extends Controller
{
    private const CacheKey = 'public:platform-stats';

    private const CacheSeconds = 300;

    public function __invoke(): JsonResponse
    {
        $stats = Cache::remember(self::CacheKey, self::CacheSeconds, fn (): array => [
            'open_roles' => $this->openRoles(),
            'recruiters' => User::query()->where('role', UserRole::Employer)->count(),
            'candidates' => User::query()->where('role', UserRole::Candidate)->count(),
        ]);

        return response()->json(['data' => $stats]);
    }

    /**
     * Mirrors the public job query: approved, published, and not past its
     * deadline. A visitor who reads "N open roles" and then browses the board
     * must find the same N.
     */
    private function openRoles(): int
    {
        return JobListing::query()
            ->where('approval_status', 'approved')
            ->whereNotNull('published_at')
            ->where(function ($query): void {
                $query
                    ->whereNull('application_deadline')
                    ->orWhere('application_deadline', '>=', now());
            })
            ->count();
    }
}
