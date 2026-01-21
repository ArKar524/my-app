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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import type { PageProps } from '@/types';
import { useMemo, useState } from 'react';

type Account = {
    id: number;
    name: string;
    type: string;
    currency_code: string;
    opening_balance: string;
    current_balance: string;
    created_at?: string;
};

type AccountsPageProps = PageProps<{
    accounts: {
        data: Account[];
        current_page: number;
        per_page: number;
        total: number;
    };
}>;

const ACCOUNT_TYPES = [
    { value: 'general', label: 'General' },
    { value: 'cash', label: 'Cash' },
    { value: 'bank', label: 'Bank' },
    { value: 'card', label: 'Card' },
];

export default function AccountsIndex() {
    const { accounts } = usePage<AccountsPageProps>().props;
    const [editAccount, setEditAccount] = useState<Account | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({
        name: '',
        type: 'general',
        currency_code: 'USD',
        opening_balance: 0,
    });

    const editForm = useForm({
        name: '',
        type: 'general',
        currency_code: 'USD',
    });

    const columns: DataTableColumn<Account>[] = useMemo(
        () => [
            { key: 'name', header: 'Name' },
            {
                key: 'type',
                header: 'Type',
                render: (row) => (
                    <Badge variant="secondary" className="capitalize">
                        {row.type}
                    </Badge>
                ),
            },
            { key: 'currency_code', header: 'Currency' },
            {
                key: 'current_balance',
                header: 'Current Balance',
                render: (row) =>
                    new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: row.currency_code,
                    }).format(Number(row.current_balance)),
            },
            {
                key: 'opening_balance',
                header: 'Opening',
                render: (row) =>
                    new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: row.currency_code,
                    }).format(Number(row.opening_balance)),
            },
            {
                key: 'actions',
                header: '',
                render: (row) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="secondary"
                            onClick={() => router.get(route('accounts.statement', row.id))}
                        >
                            Statement
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditAccount(row);
                                editForm.setData({
                                    name: row.name,
                                    type: row.type,
                                    currency_code: row.currency_code,
                                });
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(route('accounts.destroy', row.id), {
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
        page: accounts.current_page,
        perPage: accounts.per_page,
        total: accounts.total,
        onPageChange: (page) =>
            router.get(
                route('accounts.index'),
                { page },
                { preserveState: true, preserveScroll: true },
            ),
    };

    const submitCreate: React.FormEventHandler = (e) => {
        e.preventDefault();

        createForm.post(route('accounts.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setCreateOpen(false);
            },
        });
    };

    const submitEdit: React.FormEventHandler = (e) => {
        e.preventDefault();
        if (!editAccount) return;

        editForm.put(route('accounts.update', editAccount.id), {
            preserveScroll: true,
            onSuccess: () => setEditAccount(null),
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-foreground">
                        Accounts
                    </h1>
                    <Button onClick={() => setCreateOpen(true)}>Add account</Button>
                </div>
            }
        >
            <Head title="Accounts" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <DataTable
                    data={accounts.data}
                    columns={columns}
                    pagination={pagination}
                    emptyMessage="Create your first account to start tracking transactions."
                />
            </div>

            <FormDialog
                title="New account" 
                submitLabel="Create"
                cancelLabel="Cancel"
                onSubmit={submitCreate}
                open={createOpen}
                onOpenChange={setCreateOpen}
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                        />
                        {createForm.errors.name && (
                            <p className="text-sm text-destructive">
                                {createForm.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            value={createForm.data.type}
                            onValueChange={(value) => createForm.setData('type', value)}
                        >
                            <SelectTrigger id="type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACCOUNT_TYPES.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {createForm.errors.type && (
                            <p className="text-sm text-destructive">
                                {createForm.errors.type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="currency_code">Currency</Label>
                        <Input
                            id="currency_code"
                            value={createForm.data.currency_code}
                            onChange={(e) =>
                                createForm.setData('currency_code', e.target.value.toUpperCase())
                            }
                            maxLength={3}
                        />
                        {createForm.errors.currency_code && (
                            <p className="text-sm text-destructive">
                                {createForm.errors.currency_code}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="opening_balance">Opening balance</Label>
                        <Input
                            id="opening_balance"
                            type="number"
                            step="0.01"
                            value={createForm.data.opening_balance}
                            onChange={(e) =>
                                createForm.setData(
                                    'opening_balance',
                                    Number(e.target.value ?? 0),
                                )
                            }
                        />
                        {createForm.errors.opening_balance && (
                            <p className="text-sm text-destructive">
                                {createForm.errors.opening_balance}
                            </p>
                        )}
                    </div>
                </div>
            </FormDialog>

            <FormDialog
                title="Edit account" 
                submitLabel="Save changes"
                cancelLabel="Cancel"
                onSubmit={submitEdit}
                open={!!editAccount}
                onOpenChange={(open) => !open && setEditAccount(null)}
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="edit-name">Name</Label>
                        <Input
                            id="edit-name"
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                        />
                        {editForm.errors.name && (
                            <p className="text-sm text-destructive">
                                {editForm.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="edit-type">Type</Label>
                        <Select
                            value={editForm.data.type}
                            onValueChange={(value) => editForm.setData('type', value)}
                        >
                            <SelectTrigger id="edit-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACCOUNT_TYPES.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {editForm.errors.type && (
                            <p className="text-sm text-destructive">
                                {editForm.errors.type}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="edit-currency_code">Currency</Label>
                        <Input
                            id="edit-currency_code"
                            value={editForm.data.currency_code}
                            onChange={(e) =>
                                editForm.setData(
                                    'currency_code',
                                    e.target.value.toUpperCase(),
                                )
                            }
                            maxLength={3}
                        />
                        {editForm.errors.currency_code && (
                            <p className="text-sm text-destructive">
                                {editForm.errors.currency_code}
                            </p>
                        )}
                    </div>
                </div>
            </FormDialog>
        </AppLayout>
    );
}
