<?php

namespace App\Http\Controllers\Finance;

use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Services\BalanceService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountStatementController extends Controller
{
    public function __construct(private readonly BalanceService $balanceService)
    {
    }

    public function show(Request $request, Account $account): Response
    {
        $statement = $this->balanceService->accountStatement(
            $account,
            $request->query('start_date'),
            $request->query('end_date'),
        );

        return Inertia::render('Finance/Accounts/Statement', [
            'account' => $account->only(['id', 'name', 'currency_code', 'opening_balance', 'current_balance']),
            'transactions' => $statement['transactions'],
            'summary' => $statement['summary'],
            'starting_balance' => $statement['starting_balance'],
            'ending_balance' => $statement['ending_balance'],
            'filters' => [
                'start_date' => $request->query('start_date') ?? '',
                'end_date' => $request->query('end_date') ?? '',
            ],
        ]);
    }
}
