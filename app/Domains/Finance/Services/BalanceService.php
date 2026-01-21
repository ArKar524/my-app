<?php

namespace App\Domains\Finance\Services;

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class BalanceService
{
    /**
     * Build an account statement with running balance and summary totals.
     */
    public function accountStatement(
        Account $account,
        ?string $startDate = null,
        ?string $endDate = null,
    ): array {
        $start = $startDate ? Carbon::parse($startDate)->toDateString() : null;
        $end = $endDate ? Carbon::parse($endDate)->toDateString() : null;

        $startingBalance = (float) $account->opening_balance;

        if ($start) {
            $priorTransactions = $this->baseQuery($account)
                ->whereDate('occurred_at', '<', $start)
                ->get();

            foreach ($priorTransactions as $transaction) {
                $startingBalance += $this->signedAmount($transaction, $account->id);
            }
        }

        $transactions = $this->baseQuery($account)
            ->when($start, fn (Builder $query) => $query->whereDate('occurred_at', '>=', $start))
            ->when($end, fn (Builder $query) => $query->whereDate('occurred_at', '<=', $end))
            ->with(['category:id,name,type', 'account:id,name', 'toAccount:id,name'])
            ->orderBy('occurred_at')
            ->orderBy('id')
            ->get();

        $runningBalance = $startingBalance;
        $summary = [
            'income' => 0.0,
            'expense' => 0.0,
            'transfer_in' => 0.0,
            'transfer_out' => 0.0,
            'net' => 0.0,
        ];

        $rows = $transactions->map(function (Transaction $transaction) use (&$runningBalance, &$summary, $account) {
            $signed = $this->signedAmount($transaction, $account->id);
            $runningBalance += $signed;

            $this->accumulateSummary($summary, $transaction, $signed);

            return [
                'id' => $transaction->id,
                'type' => $transaction->type->value,
                'amount' => (string) $transaction->amount,
                'signed_amount' => $signed,
                'description' => $transaction->description,
                'occurred_at' => $transaction->occurred_at?->toDateString(),
                'account' => $transaction->account?->only(['id', 'name']),
                'to_account' => $transaction->toAccount?->only(['id', 'name']),
                'category' => $transaction->category?->only(['id', 'name', 'type']),
                'running_balance' => $runningBalance,
            ];
        });

        $summary['net'] = $summary['income'] + $summary['transfer_in'] - $summary['expense'] - $summary['transfer_out'];

        return [
            'starting_balance' => $startingBalance,
            'ending_balance' => $runningBalance,
            'summary' => $summary,
            'transactions' => $rows,
        ];
    }

    protected function baseQuery(Account $account): Builder
    {
        return Transaction::query()
            ->where(function (Builder $query) use ($account) {
                $query->where('account_id', $account->id)
                    ->orWhere('to_account_id', $account->id);
            });
    }

    protected function signedAmount(Transaction $transaction, int $accountId): float
    {
        return match ($transaction->type) {
            TransactionType::Income => $transaction->account_id === $accountId ? (float) $transaction->amount : 0.0,
            TransactionType::Expense => $transaction->account_id === $accountId ? -(float) $transaction->amount : 0.0,
            TransactionType::Transfer => $transaction->account_id === $accountId
                ? -(float) $transaction->amount
                : ($transaction->to_account_id === $accountId ? (float) $transaction->amount : 0.0),
        };
    }

    protected function accumulateSummary(array &$summary, Transaction $transaction, float $signedAmount): void
    {
        match ($transaction->type) {
            TransactionType::Income => $summary['income'] += $transaction->amount,
            TransactionType::Expense => $summary['expense'] += $transaction->amount,
            TransactionType::Transfer => $signedAmount >= 0
                ? $summary['transfer_in'] += $transaction->amount
                : $summary['transfer_out'] += $transaction->amount,
        };
    }
}
