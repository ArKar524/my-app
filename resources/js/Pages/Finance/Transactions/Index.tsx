import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import DataTable, {
    type DataTableColumn,
    type PaginationConfig,
} from '@/Components/DataTable';
import FormDialog from '@/Components/FormDialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import type { PageProps } from '@/types';
import { useMemo, useState } from 'react';
import { DatePicker } from '@/Components/ui/date-picker';
import { format, parseISO } from 'date-fns';

type AccountOption = { id: number; name: string };
type CategoryOption = { id: number; name: string; type: 'income' | 'expense' };
type TransactionRow = {
    id: number;
    type: string;
    amount: string;
    description?: string;
    occurred_at: string;
    account?: AccountOption;
    to_account?: AccountOption | null;
    category?: CategoryOption | null;
};

type TransactionsPageProps = PageProps<{
    transactions: {
        data: TransactionRow[];
        current_page: number;
        per_page: number;
        total: number;
    };
    accounts: AccountOption[];
    categories: CategoryOption[];
    transactionTypes: string[];
}>;

const formatMoney = (amount: string) =>
    new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
    }).format(Number(amount));

export default function TransactionsIndex() {
    const { transactions, accounts, categories, transactionTypes } =
        usePage<TransactionsPageProps>().props;

    const [editItem, setEditItem] = useState<TransactionRow | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({
        type: 'income',
        account_id: accounts[0]?.id ?? '',
        to_account_id: '',
        category_id: '',
        amount: '',
        description: '',
        occurred_at: new Date().toISOString().slice(0, 10),
    });

    const editForm = useForm({
        type: 'income',
        account_id: '',
        to_account_id: '',
        category_id: '',
        amount: '',
        description: '',
        occurred_at: new Date().toISOString().slice(0, 10),
    });

    const columns: DataTableColumn<TransactionRow>[] = useMemo(
        () => [
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
                key: 'amount',
                header: 'Amount',
                render: (row) => formatMoney(row.amount),
            },
            {
                key: 'account',
                header: 'Account',
                render: (row) => row.account?.name ?? '-',
            },
            {
                key: 'to_account',
                header: 'To Account',
                render: (row) => row.to_account?.name ?? '-',
            },
            {
                key: 'category',
                header: 'Category',
                render: (row) => row.category?.name ?? '-',
            },
            { key: 'occurred_at', header: 'Date' },
            {
                key: 'actions',
                header: '',
                render: (row) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditItem(row);
                                editForm.setData({
                                    type: row.type,
                                    account_id: row.account?.id ?? '',
                                    to_account_id: row.to_account?.id ?? '',
                                    category_id: row.category?.id ?? '',
                                    amount: Number(row.amount),
                                    description: row.description ?? '',
                                    occurred_at: row.occurred_at,
                                });
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(route('transactions.destroy', row.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Delete
                        </Button>
                    </div>
                ),
                className: 'w-48 text-right',
            },
        ],
        [editForm],
    );

    const pagination: PaginationConfig = {
        page: transactions.current_page,
        perPage: transactions.per_page,
        total: transactions.total,
        onPageChange: (page) =>
            router.get(route('transactions.index'), { page }, { preserveState: true, preserveScroll: true }),
    };

    const submitCreate: React.FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route('transactions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit: React.FormEventHandler = (e) => {
        e.preventDefault();
        if (!editItem) return;

        editForm.put(route('transactions.update', editItem.id), {
            preserveScroll: true,
            onSuccess: () => setEditItem(null),
        });
    };

    const categoryOptionsFor = (type: string) =>
        categories.filter((c) =>
            type === 'transfer' ? false : c.type === type,
        );

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-foreground">
                        Transactions
                    </h1>
                    <Button onClick={() => setCreateOpen(true)}>Add transaction</Button>
                </div>
            }
        >
            <Head title="Transactions" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <DataTable
                    data={transactions.data}
                    columns={columns}
                    pagination={pagination}
                    emptyMessage="Add transactions to start tracking your ledger."
                />
            </div>

            <FormDialog
                title="New transaction"
                submitLabel="Create"
                cancelLabel="Cancel"
                onSubmit={submitCreate}
                open={createOpen}
                onOpenChange={setCreateOpen}
            >
                <TransactionFormFields
                    form={createForm}
                    accounts={accounts}
                    categories={categories}
                    transactionTypes={transactionTypes}
                    categoryOptionsFor={categoryOptionsFor}
                />
            </FormDialog>

            <FormDialog
                title="Edit transaction"
                submitLabel="Save changes"
                cancelLabel="Cancel"
                onSubmit={submitEdit}
                open={!!editItem}
                onOpenChange={(open) => !open && setEditItem(null)}
            >
                <TransactionFormFields
                    form={editForm}
                    accounts={accounts}
                    categories={categories}
                    transactionTypes={transactionTypes}
                    categoryOptionsFor={categoryOptionsFor}
                />
            </FormDialog>
        </AppLayout>
    );
}

type FormFieldsProps = {
    form: ReturnType<typeof useForm<any>>;
    accounts: AccountOption[];
    categories: CategoryOption[];
    transactionTypes: string[];
    categoryOptionsFor: (type: string) => CategoryOption[];
};

function TransactionFormFields({
    form,
    accounts,
    transactionTypes,
    categoryOptionsFor,
}: FormFieldsProps) {
    const showToAccount = form.data.type === 'transfer';
    const showCategory = form.data.type !== 'transfer';
    const selectedDate = form.data.occurred_at
        ? parseISO(String(form.data.occurred_at))
        : undefined;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <Label htmlFor="type">Type</Label>
                <Select
                    id="type"
                    value={form.data.type}
                    onChange={(e) => form.setData('type', e.target.value)}
                >
                    {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </Select>
                {form.errors.type && (
                    <p className="text-sm text-destructive">{form.errors.type}</p>
                )}
            </div>

            <div className="space-y-1">
                <Label htmlFor="account_id">Account</Label>
                <Select
                    id="account_id"
                    value={form.data.account_id}
                    onChange={(e) => form.setData('account_id', Number(e.target.value))}
                >
                    {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                            {acc.name}
                        </option>
                    ))}
                </Select>
                {form.errors.account_id && (
                    <p className="text-sm text-destructive">{form.errors.account_id}</p>
                )}
            </div>

            {showToAccount && (
                <div className="space-y-1">
                    <Label htmlFor="to_account_id">To Account</Label>
                    <Select
                        id="to_account_id"
                        value={form.data.to_account_id}
                        onChange={(e) =>
                            form.setData('to_account_id', Number(e.target.value))
                        }
                    >
                        <option value="">Select account</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.name}
                            </option>
                        ))}
                    </Select>
                    {form.errors.to_account_id && (
                        <p className="text-sm text-destructive">
                            {form.errors.to_account_id}
                        </p>
                    )}
                </div>
            )}

            {showCategory && (
                <div className="space-y-1">
                    <Label htmlFor="category_id">Category</Label>
                    <Select
                        id="category_id"
                        value={form.data.category_id}
                        onChange={(e) =>
                            form.setData('category_id', Number(e.target.value))
                        }
                    >
                        <option value="">Select category</option>
                        {categoryOptionsFor(form.data.type).map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </Select>
                    {form.errors.category_id && (
                        <p className="text-sm text-destructive">
                            {form.errors.category_id}
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-1">
                <Label htmlFor="amount">Amount</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={form.data.amount}
                    onChange={(e) => form.setData('amount', e.target.value)}
                />
                {form.errors.amount && (
                    <p className="text-sm text-destructive">{form.errors.amount}</p>
                )}
            </div>

            <div className="space-y-1">
                <Label htmlFor="occurred_at">Date</Label>
                <DatePicker
                    value={selectedDate}
                    onChange={(date) =>
                        form.setData(
                            'occurred_at',
                            date ? format(date, 'yyyy-MM-dd') : '',
                        )
                    }
                />
                {form.errors.occurred_at && (
                    <p className="text-sm text-destructive">
                        {form.errors.occurred_at}
                    </p>
                )}
            </div>

            <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Input
                    id="description"
                    value={form.data.description}
                    onChange={(e) => form.setData('description', e.target.value)}
                />
                {form.errors.description && (
                    <p className="text-sm text-destructive">
                        {form.errors.description}
                    </p>
                )}
            </div>
        </div>
    );
}
