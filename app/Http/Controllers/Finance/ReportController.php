<?php

namespace App\Http\Controllers\Finance;

use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\ReportFilterRequest;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports)
    {
    }

    public function index(ReportFilterRequest $request): Response
    {
        $filters = $request->validated();

        $daily = $this->reports->dailySummary(
            $filters['start_date'] ?? null,
            $filters['end_date'] ?? null,
            $filters['account_id'] ?? null,
        );

        $monthly = $this->reports->monthlySummary(
            $filters['start_date'] ?? null,
            $filters['end_date'] ?? null,
            $filters['account_id'] ?? null,
        );

        $categoryTotals = $this->reports->categoryTotals(
            $filters['start_date'] ?? null,
            $filters['end_date'] ?? null,
            $filters['account_id'] ?? null,
        );

        $accounts = Account::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Finance/Reports/Index', [
            'daily' => $daily,
            'monthly' => $monthly,
            'categoryTotals' => $categoryTotals,
            'accounts' => $accounts,
            'filters' => [
                'start_date' => $filters['start_date'] ?? '',
                'end_date' => $filters['end_date'] ?? '',
                'account_id' => $filters['account_id'] ?? '',
            ],
        ]);
    }
}
