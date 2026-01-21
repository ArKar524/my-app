<?php

namespace App\Http\Controllers\Finance;

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Category;
use App\Domains\Finance\Models\Transaction;
use App\Domains\Finance\Services\TransactionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreTransactionRequest;
use App\Http\Requests\Finance\UpdateTransactionRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(private readonly TransactionService $service)
    {
    }

    public function index(Request $request): Response
    {
        $transactions = Transaction::query()
            ->with(['account:id,name', 'toAccount:id,name', 'category:id,name,type'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->through(function (Transaction $transaction) {
                return [
                    'id' => $transaction->id,
                    'type' => $transaction->type->value,
                    'amount' => $transaction->amount,
                    'description' => $transaction->description,
                    'occurred_at' => $transaction->occurred_at?->toDateString(),
                    'account' => $transaction->account?->only(['id', 'name']),
                    'to_account' => $transaction->toAccount?->only(['id', 'name']),
                    'category' => $transaction->category?->only(['id', 'name', 'type']),
                ];
            })
            ->onEachSide(1);

        $accounts = Account::orderBy('name')->get(['id', 'name']);
        $categories = Category::orderBy('name')->get(['id', 'name', 'type']);

        return Inertia::render('Finance/Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'transactionTypes' => array_map(fn (TransactionType $type) => $type->value, TransactionType::cases()),
        ]);
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        $payload['user_id'] = Auth::id();
        $payload['created_by'] = Auth::id();

        $this->service->create($payload);

        return redirect()
            ->route('transactions.index')
            ->with('type', 'success')
            ->with('message', 'Transaction created.');
    }

    public function update(
        UpdateTransactionRequest $request,
        Transaction $transaction,
    ): RedirectResponse {
        $this->service->update($transaction, $request->validated());

        return redirect()
            ->route('transactions.index')
            ->with('type', 'success')
            ->with('message', 'Transaction updated.');
    }

    public function destroy(Transaction $transaction): RedirectResponse
    {
        $this->service->delete($transaction);

        return redirect()
            ->route('transactions.index')
            ->with('type', 'success')
            ->with('message', 'Transaction deleted.');
    }
}
