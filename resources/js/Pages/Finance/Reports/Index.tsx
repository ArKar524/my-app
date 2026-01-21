import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import DataTable, { type DataTableColumn } from '@/Components/DataTable';
import { Badge } from '@/Components/ui/badge';
import { FilterActions, FilterBar, DateRangeFilter } from '@/Components/FilterBar';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

type SummaryRow = {
    date?: string;
    month?: string;
    income: number;
    expense: number;
    transfer_in: number;
    transfer_out: number;
    net: number;
};

type CategoryRow = {
    category_id: number;
    category_name: string;
    category_type: string;
    total: number;
};

type ReportsPageProps = PageProps<{
    daily: SummaryRow[];
    monthly: SummaryRow[];
    categoryTotals: CategoryRow[];
    accounts: { id: number; name: string }[];
    filters: {
        start_date: string;
        end_date: string;
        account_id: number | '' | null;
    };
}>;

const formatMoney = (value: number, currency = 'USD') =>
    new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    }).format(value);

export default function ReportsIndex() {
    const { daily, monthly, categoryTotals, accounts, filters } =
        usePage<ReportsPageProps>().props;

    const form = useForm({
        start_date: filters.start_date || '',
        end_date: filters.end_date || '',
        account_id: filters.account_id ? Number(filters.account_id) : '',
    });

    const dailyColumns: DataTableColumn<SummaryRow>[] = useMemo(
        () => [
            { key: 'date', header: 'Date' },
            { key: 'income', header: 'Income', render: (row) => formatMoney(row.income) },
            { key: 'expense', header: 'Expense', render: (row) => formatMoney(row.expense) },
            {
                key: 'transfer_in',
                header: 'Transfer In',
                render: (row) => formatMoney(row.transfer_in),
            },
            {
                key: 'transfer_out',
                header: 'Transfer Out',
                render: (row) => formatMoney(row.transfer_out),
            },
            {
                key: 'net',
                header: 'Net',
                render: (row) => (
                    <span
                        className={cn(
                            'font-medium',
                            row.net >= 0 ? 'text-green-600' : 'text-destructive',
                        )}
                    >
                        {formatMoney(row.net)}
                    </span>
                ),
            },
        ],
        [],
    );

    const monthlyColumns: DataTableColumn<SummaryRow>[] = useMemo(
        () => [
            { key: 'month', header: 'Month' },
            { key: 'income', header: 'Income', render: (row) => formatMoney(row.income) },
            { key: 'expense', header: 'Expense', render: (row) => formatMoney(row.expense) },
            {
                key: 'transfer_in',
                header: 'Transfer In',
                render: (row) => formatMoney(row.transfer_in),
            },
            {
                key: 'transfer_out',
                header: 'Transfer Out',
                render: (row) => formatMoney(row.transfer_out),
            },
            {
                key: 'net',
                header: 'Net',
                render: (row) => (
                    <span
                        className={cn(
                            'font-medium',
                            row.net >= 0 ? 'text-green-600' : 'text-destructive',
                        )}
                    >
                        {formatMoney(row.net)}
                    </span>
                ),
            },
        ],
        [],
    );

    const categoryColumns: DataTableColumn<CategoryRow>[] = useMemo(
        () => [
            {
                key: 'category_name',
                header: 'Category',
                render: (row) => (
                    <div className="flex items-center gap-2">
                        <Badge
                            variant={row.category_type === 'income' ? 'secondary' : 'destructive'}
                            className="capitalize"
                        >
                            {row.category_type}
                        </Badge>
                        <span>{row.category_name}</span>
                    </div>
                ),
            },
            {
                key: 'total',
                header: 'Total',
                render: (row) => formatMoney(row.total),
                className: 'text-right',
            },
        ],
        [],
    );

    const submitFilters: React.FormEventHandler = (e) => {
        e.preventDefault();

        router.get(
            route('reports.index'),
            {
                start_date: form.data.start_date || undefined,
                end_date: form.data.end_date || undefined,
                account_id: form.data.account_id || undefined,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = () => {
        form.setData({
            start_date: '',
            end_date: '',
            account_id: '',
        });
        router.get(route('reports.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const totals = {
        income: daily.reduce((sum, row) => sum + row.income, 0),
        expense: daily.reduce((sum, row) => sum + row.expense, 0),
        transfer_in: daily.reduce((sum, row) => sum + row.transfer_in, 0),
        transfer_out: daily.reduce((sum, row) => sum + row.transfer_out, 0),
    };
    const net = totals.income - totals.expense + totals.transfer_in - totals.transfer_out;

    return (
        <AppLayout
            header={
                <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">Finance insights</p>
                    <h1 className="text-xl font-semibold text-foreground">Reports</h1>
                </div>
            }
        >
            <Head title="Reports" />
            <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={submitFilters} className="space-y-4">
                    <FilterBar
                        actions={<FilterActions onReset={resetFilters} submitLabel="Apply filters" />}
                    >
                        <DateRangeFilter
                            from={form.data.start_date}
                            to={form.data.end_date}
                            onChange={({ from, to }) => form.setData({ start_date: from, end_date: to })}
                        />
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-foreground">Account</label>
                            <Select
                                value={form.data.account_id ? String(form.data.account_id) : ''}
                                onValueChange={(value) =>
                                    form.setData('account_id', value ? Number(value) : '')
                                }
                            >
                                <SelectTrigger id='accounts'>
                                    <SelectValue placeholder="All accounts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All accounts</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </FilterBar>
                </form>

                <div className="grid gap-4 md:grid-cols-4">
                    <SummaryCard label="Income" value={formatMoney(totals.income)} />
                    <SummaryCard label="Expense" value={formatMoney(totals.expense)} />
                    <SummaryCard label="Transfers in" value={formatMoney(totals.transfer_in)} />
                    <SummaryCard label="Transfers out" value={formatMoney(totals.transfer_out)} />
                    <SummaryCard label="Net change" value={formatMoney(net)} highlight />
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Daily summary</h2>
                    <DataTable
                        data={daily}
                        columns={dailyColumns}
                        emptyMessage="No transactions for the selected range."
                    />
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Monthly summary</h2>
                    <DataTable
                        data={monthly}
                        columns={monthlyColumns}
                        emptyMessage="No monthly totals yet."
                    />
                </div>

                <div className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Category totals</h2>
                    <DataTable
                        data={categoryTotals}
                        columns={categoryColumns}
                        emptyMessage="No categories to show."
                    />
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
