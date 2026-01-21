<?php

namespace App\Http\Controllers\Finance;

use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Services\ActivityLogService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreAccountRequest;
use App\Http\Requests\Finance\UpdateAccountRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function __construct(private readonly ActivityLogService $activityLog)
    {
    }

    public function index(Request $request): Response
    {
        $accounts = Account::query()
            ->orderBy('name')
            ->paginate(10)
            ->through(function (Account $account) {
                return [
                    'id' => $account->id,
                    'name' => $account->name,
                    'type' => $account->type,
                    'currency_code' => $account->currency_code,
                    'opening_balance' => $account->opening_balance,
                    'current_balance' => $account->current_balance,
                    'created_at' => $account->created_at?->toDateString(),
                ];
            })
            ->onEachSide(1);

        return Inertia::render('Finance/Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(StoreAccountRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['current_balance'] = $data['opening_balance'] ?? 0;

        $account = Account::create($data);
        $this->activityLog->log('account.created', $account);

        return redirect()
            ->route('accounts.index')
            ->with('type', 'success')
            ->with('message', 'Account created.');
    }

    public function update(
        UpdateAccountRequest $request,
        Account $account,
    ): RedirectResponse {
        $account->update($request->validated());
        $this->activityLog->log('account.updated', $account);

        return redirect()
            ->route('accounts.index')
            ->with('type', 'success')
            ->with('message', 'Account updated.');
    }

    public function destroy(Account $account): RedirectResponse
    {
        $account->delete();
        $this->activityLog->log('account.deleted', $account);

        return redirect()
            ->route('accounts.index')
            ->with('type', 'success')
            ->with('message', 'Account deleted.');
    }
}
