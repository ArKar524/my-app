<?php

namespace App\Domains\Finance\Services;

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Account;
use App\Domains\Finance\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class TransactionService
{
    public function create(array $data): Transaction
    {
        return DB::transaction(function () use ($data) {
            $transaction = Transaction::create([
                ...$data,
                'user_id' => $data['user_id'] ?? Auth::id(),
                'created_by' => $data['created_by'] ?? Auth::id(),
            ]);

            $this->applyBalanceEffect($transaction, 'add');

            return $transaction;
        });
    }

    public function update(Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($transaction, $data) {
            $this->applyBalanceEffect($transaction, 'remove');

            $transaction->update($data);

            $transaction->refresh();

            $this->applyBalanceEffect($transaction, 'add');

            return $transaction;
        });
    }

    public function delete(Transaction $transaction): void
    {
        DB::transaction(function () use ($transaction) {
            $this->applyBalanceEffect($transaction, 'remove');
            $transaction->delete();
        });
    }

    protected function applyBalanceEffect(Transaction $transaction, string $mode): void
    {
        $multiplier = $mode === 'add' ? 1 : -1;
        $amount = (float) $transaction->amount;

        $fromAccount = Account::lockForUpdate()->findOrFail($transaction->account_id);

        switch ($transaction->type) {
            case TransactionType::Income:
                $fromAccount->current_balance += ($mode === 'add' ? $amount : -$amount);
                $fromAccount->save();
                break;
            case TransactionType::Expense:
                $fromAccount->current_balance -= ($mode === 'add' ? $amount : -$amount);
                $fromAccount->save();
                break;
            case TransactionType::Transfer:
                if (!$transaction->to_account_id) {
                    throw new InvalidArgumentException('Transfer requires to_account_id');
                }
                $toAccount = Account::lockForUpdate()->findOrFail($transaction->to_account_id);

                $fromAccount->current_balance -= ($mode === 'add' ? $amount : -$amount);
                $toAccount->current_balance += ($mode === 'add' ? $amount : -$amount);

                $fromAccount->save();
                $toAccount->save();
                break;
        }
    }
}
