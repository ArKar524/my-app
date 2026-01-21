<?php

namespace App\Domains\Finance\Services;

use App\Domains\Finance\Enums\TransactionType;
use App\Domains\Finance\Models\Transaction;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ReportService
{
    public function dailySummary(?string $startDate, ?string $endDate, ?int $accountId = null): Collection
    {
        $query = $this->baseQuery($startDate, $endDate, $accountId);

        $dateExpr = $this->dateExpression();

        $query->select([
            DB::raw("$dateExpr as date"),
            DB::raw("SUM(CASE WHEN type = '".TransactionType::Income->value."' THEN amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN type = '".TransactionType::Expense->value."' THEN amount ELSE 0 END) as expense"),
        ]);

        if ($accountId) {
            $accountId = (int) $accountId;
            $query->selectRaw("SUM(CASE WHEN type = ? AND to_account_id = $accountId THEN amount ELSE 0 END) as transfer_in", [
                TransactionType::Transfer->value,
            ]);
            $query->selectRaw("SUM(CASE WHEN type = ? AND account_id = $accountId THEN amount ELSE 0 END) as transfer_out", [
                TransactionType::Transfer->value,
            ]);
        } else {
            $query->selectRaw("0 as transfer_in");
            $query->selectRaw("SUM(CASE WHEN type = '".TransactionType::Transfer->value."' THEN amount ELSE 0 END) as transfer_out");
        }

        return $query
            ->groupBy(DB::raw($dateExpr))
            ->orderBy(DB::raw($dateExpr))
            ->get()
            ->map(function ($row) {
                $income = (float) $row->income;
                $expense = (float) $row->expense;
                $transferIn = (float) $row->transfer_in;
                $transferOut = (float) $row->transfer_out;

                return [
                    'date' => $row->date,
                    'income' => $income,
                    'expense' => $expense,
                    'transfer_in' => $transferIn,
                    'transfer_out' => $transferOut,
                    'net' => $income - $expense + $transferIn - $transferOut,
                ];
            });
    }

    public function monthlySummary(?string $startDate, ?string $endDate, ?int $accountId = null): Collection
    {
        $query = $this->baseQuery($startDate, $endDate, $accountId);

        $monthExpr = $this->monthExpression();

        $query->select([
            DB::raw("$monthExpr as month"),
            DB::raw("SUM(CASE WHEN type = '".TransactionType::Income->value."' THEN amount ELSE 0 END) as income"),
            DB::raw("SUM(CASE WHEN type = '".TransactionType::Expense->value."' THEN amount ELSE 0 END) as expense"),
        ]);

        if ($accountId) {
            $accountId = (int) $accountId;
            $query->selectRaw("SUM(CASE WHEN type = ? AND to_account_id = $accountId THEN amount ELSE 0 END) as transfer_in", [
                TransactionType::Transfer->value,
            ]);
            $query->selectRaw("SUM(CASE WHEN type = ? AND account_id = $accountId THEN amount ELSE 0 END) as transfer_out", [
                TransactionType::Transfer->value,
            ]);
        } else {
            $query->selectRaw("0 as transfer_in");
            $query->selectRaw("SUM(CASE WHEN type = '".TransactionType::Transfer->value."' THEN amount ELSE 0 END) as transfer_out");
        }

        return $query
            ->groupBy(DB::raw($monthExpr))
            ->orderBy(DB::raw($monthExpr))
            ->get()
            ->map(function ($row) {
                $income = (float) $row->income;
                $expense = (float) $row->expense;
                $transferIn = (float) $row->transfer_in;
                $transferOut = (float) $row->transfer_out;

                return [
                    'month' => $row->month,
                    'income' => $income,
                    'expense' => $expense,
                    'transfer_in' => $transferIn,
                    'transfer_out' => $transferOut,
                    'net' => $income - $expense + $transferIn - $transferOut,
                ];
            });
    }

    public function categoryTotals(?string $startDate, ?string $endDate, ?int $accountId = null): Collection
    {
        $query = $this->baseQuery($startDate, $endDate, $accountId)
            ->whereIn('transactions.type', [TransactionType::Income->value, TransactionType::Expense->value])
            ->whereNotNull('transactions.category_id')
            ->join('categories', 'transactions.category_id', '=', 'categories.id');

        return $query
            ->select([
                'categories.id as category_id',
                'categories.name as category_name',
                'categories.type as category_type',
                DB::raw('SUM(transactions.amount) as total'),
            ])
            ->groupBy('categories.id', 'categories.name', 'categories.type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'category_id' => (int) $row->category_id,
                'category_name' => $row->category_name,
                'category_type' => $row->category_type,
                'total' => (float) $row->total,
            ]);
    }

    protected function baseQuery(?string $startDate, ?string $endDate, ?int $accountId): Builder
    {
        return Transaction::query()
            ->when($startDate, fn (Builder $query) => $query->whereDate('occurred_at', '>=', $startDate))
            ->when($endDate, fn (Builder $query) => $query->whereDate('occurred_at', '<=', $endDate))
            ->when($accountId, function (Builder $query) use ($accountId) {
                $query->where(function (Builder $inner) use ($accountId) {
                    $inner->where('account_id', $accountId)
                        ->orWhere('to_account_id', $accountId);
                });
            });
    }

    protected function dateExpression(): string
    {
        $driver = DB::getDriverName();
        return $driver === 'sqlite' ? "DATE(occurred_at)" : "DATE(occurred_at)";
    }

    protected function monthExpression(): string
    {
        $driver = DB::getDriverName();
        return $driver === 'sqlite'
            ? "strftime('%Y-%m', occurred_at)"
            : "DATE_FORMAT(occurred_at, '%Y-%m')";
    }
}
