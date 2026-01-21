import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import { FilterActions, FilterBar, DateRangeFilter } from '@/Components/FilterBar';
import type { PageProps } from '@/types';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

type Account = {
    id: number;
    name: string;
    currency_code: string;
    opening_balance: string;
    current_balance: string;
};

type TransactionRow = {
    id: number;
    type: string;
    amount: string;
    signed_amount: number;
    description?: string | null;
    occurred_at: string;
    category?: { id: number; name: string; type: string } | null;
    to_account?: { id: number; name: string } | null;
    running_balance: number;
};

type StatementPageProps = PageProps<{
    account: Account;
    transactions: TransactionRow[];
    summary: {
        income: number;
        expense: number;
        transfer_in: number;
        transfer_out: number;
        net: number;
    };
    starting_balance: number;
    ending_balance: number;
    filters: {
        start_date: string;
        end_date: string;
    };
}>;

const formatMoney = (value: number | string, currency: string) =>
    new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    }).format(Number(value));

export default function AccountStatement() {
    const { account, transactions, summary, starting_balance, ending_balance, filters } =
        usePage<StatementPageProps>().props;

    const form = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
    });

    const columns: DataTableColumn<TransactionRow>[] = useMemo(
        () => [
            { key: 'occurred_at', header: 'Date' },
            { key: 'description', header: 'Description' },
            {
                key: 'type',
                header: 'Type',
                render: (row) => (
                    <Badge
                        variant={
                            row.type === 'income'
                                ? 'secondary'
                                : row.type === 'expense'
                                ? 'destructive'
                                : 'outline'
                        }
                        className="capitalize"
                    >
                        {row.type}
                    </Badge>
                ),
            },
            {
                key: 'category',
                header: 'Category',
                render: (row) => row.category?.name ?? '-',
            },
            {
                key: 'to_account',
                header: 'Counterparty',
                render: (row) => (row.to_account ? row.to_account.name : '-'),
            },
            {
                key: 'signed_amount',
                header: 'Amount',
                className: 'text-right',
                render: (row) => (
                    <span
                        className={cn(
                            'font-medium',
                            row.signed_amount >= 0 ? 'text-green-600' : 'text-destructive',
                        )}
                    >
                        {formatMoney(row.signed_amount, account.currency_code)}
                    </span>
                ),
            },
            {
                key: 'running_balance',
                header: 'Running Balance',
                className: 'text-right',
                render: (row) => formatMoney(row.running_balance, account.currency_code),
            },
        ],
        [account.currency_code],
    );

    const submitFilters: React.FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('accounts.statement', account.id),
            {
                start_date: form.data.start_date || undefined,
                end_date: form.data.end_date || undefined,
            },
            { preserveScroll: true },
        );
    };

    const resetFilters = () => {
        form.setData({ start_date: '', end_date: '' });
        router.get(route('accounts.statement', account.id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Account statement</p>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-foreground">
                            {account.name}
                        </h1>
                        <Badge variant="outline">{account.currency_code}</Badge>
                    </div>
                </div>
            }
        >
            <Head title={`${account.name} Statement`} />

            <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard
                        label="Starting balance"
                        value={formatMoney(starting_balance, account.currency_code)}
                    />
                    <SummaryCard
                        label="Income"
                        value={formatMoney(summary.income, account.currency_code)}
                    />
                    <SummaryCard
                        label="Expense"
                        value={formatMoney(summary.expense, account.currency_code)}
                    />
                    <SummaryCard
                        label="Transfers in"
                        value={formatMoney(summary.transfer_in, account.currency_code)}
                    />
                    <SummaryCard
                        label="Transfers out"
                        value={formatMoney(summary.transfer_out, account.currency_code)}
                    />
                    <SummaryCard
                        label="Net change"
                        value={formatMoney(summary.net, account.currency_code)}
                    />
                    <SummaryCard
                        label="Ending balance"
                        value={formatMoney(ending_balance, account.currency_code)}
                        highlight
                    />
                </div>

                <form onSubmit={submitFilters} className="space-y-4">
                    <FilterBar
                        actions={
                            <FilterActions
                                onReset={resetFilters}
                                submitLabel="Apply filters"
                            />
                        }
                    >
                        <DateRangeFilter
                            from={form.data.start_date}
                            to={form.data.end_date}
                            onChange={({ from, to }) =>
                                form.setData({ start_date: from, end_date: to })
                            }
                        />
                    </FilterBar>
                </form>

                <DataTable
                    data={transactions}
                    columns={columns}
                    emptyMessage="No transactions in this range."
                />

                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Opening: {formatMoney(account.opening_balance, account.currency_code)}
                    </div>
                    <Button variant="outline" onClick={() => router.get(route('accounts.index'))}>
                        Back to accounts
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

type SummaryCardProps = {
    label: string;
    value: string;
    highlight?: boolean;
};

function SummaryCard({ label, value, highlight = false }: SummaryCardProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm',
                highlight && 'border-primary',
            )}
        >
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-lg font-semibold text-foreground">{value}</span>
        </div>
    );
}
