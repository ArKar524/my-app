import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import DataTable, {
    type DataTableColumn,
    type PaginationConfig,
} from '@/Components/DataTable';
import FormDialog from '@/Components/FormDialog';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import type { PageProps } from '@/types';
import { useMemo, useState } from 'react';

type Category = {
    id: number;
    name: string;
    type: 'income' | 'expense';
    created_at?: string;
};

type CategoriesPageProps = PageProps<{
    categories: {
        data: Category[];
        current_page: number;
        per_page: number;
        total: number;
    };
}>;

const CATEGORY_TYPES = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
];

export default function CategoriesIndex() {
    const { categories } = usePage<CategoriesPageProps>().props;
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({
        name: '',
        type: 'income' as Category['type'],
    });

    const editForm = useForm({
        name: '',
        type: 'income' as Category['type'],
    });

    const columns: DataTableColumn<Category>[] = useMemo(
        () => [
            { key: 'name', header: 'Name' },
            {
                key: 'type',
                header: 'Type',
                render: (row) => (
                    <Badge
                        variant={row.type === 'income' ? 'secondary' : 'destructive'}
                        className="capitalize"
                    >
                        {row.type}
                    </Badge>
                ),
            },
            {
                key: 'actions',
                header: '',
                render: (row) => (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditCategory(row);
                                editForm.setData({
                                    name: row.name,
                                    type: row.type,
                                });
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() =>
                                router.delete(route('categories.destroy', row.id), {
                                    preserveScroll: true,
                                })
                            }
                        >
                            Delete
                        </Button>
                    </div>
                ),
                className: 'w-40 text-right',
            },
        ],
        [editForm],
    );

    const pagination: PaginationConfig = {
        page: categories.current_page,
        perPage: categories.per_page,
        total: categories.total,
        onPageChange: (page) =>
            router.get(
                route('categories.index'),
                { page },
                { preserveState: true, preserveScroll: true },
            ),
    };

    const submitCreate: React.FormEventHandler = (e) => {
        e.preventDefault();
        createForm.post(route('categories.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit: React.FormEventHandler = (e) => {
        e.preventDefault();
        if (!editCategory) return;

        editForm.put(route('categories.update', editCategory.id), {
            preserveScroll: true,
            onSuccess: () => setEditCategory(null),
        });
    };

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-foreground">
                        Categories
                    </h1>
                    <Button onClick={() => setCreateOpen(true)}>Add category</Button>
                </div>
            }
        >
            <Head title="Categories" />

            <div className="px-4 py-8 sm:px-6 lg:px-8">
                <DataTable
                    data={categories.data}
                    columns={columns}
                    pagination={pagination}
                    emptyMessage="Create categories to organize your transactions."
                />
            </div>

            <FormDialog
                title="New category"
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
                            <p className="text-sm text-destructive">{createForm.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="type">Type</Label>
                        <Select
                            id="type"
                            value={createForm.data.type}
                            onChange={(e) =>
                                createForm.setData('type', e.target.value as Category['type'])
                            }
                        >
                            {CATEGORY_TYPES.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        {createForm.errors.type && (
                            <p className="text-sm text-destructive">{createForm.errors.type}</p>
                        )}
                    </div>
                </div>
            </FormDialog>

            <FormDialog
                title="Edit category"
                submitLabel="Save changes"
                cancelLabel="Cancel"
                onSubmit={submitEdit}
                open={!!editCategory}
                onOpenChange={(open) => !open && setEditCategory(null)}
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
                            <p className="text-sm text-destructive">{editForm.errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="edit-type">Type</Label>
                        <Select
                            id="edit-type"
                            value={editForm.data.type}
                            onChange={(e) =>
                                editForm.setData('type', e.target.value as Category['type'])
                            }
                        >
                            {CATEGORY_TYPES.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        {editForm.errors.type && (
                            <p className="text-sm text-destructive">{editForm.errors.type}</p>
                        )}
                    </div>
                </div>
            </FormDialog>
        </AppLayout>
    );
}
