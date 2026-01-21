import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Spinner } from '@/Components/ui/spinner';
import EmptyState from '@/Components/EmptyState';
import ErrorState from '@/Components/ErrorState';
import type { ReactNode } from 'react';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    render?: (row: T) => ReactNode;
    className?: string;
};

export type PaginationConfig = {
    page: number;
    perPage: number;
    total: number;
    onPageChange?: (page: number) => void;
};

type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    isLoading?: boolean;
    error?: string;
    emptyMessage?: string;
    caption?: ReactNode;
    pagination?: PaginationConfig;
    onRetry?: () => void;
};

function Pagination({ page, perPage, total, onPageChange }: PaginationConfig) {
    const pageCount = Math.max(1, Math.ceil(total / perPage));

    const handleChange = (next: number) => {
        if (!onPageChange) return;
        if (next < 1 || next > pageCount) return;
        onPageChange(next);
    };

    return (
        <div className="flex items-center justify-between border-t border-border px-3 py-3 text-sm text-muted-foreground">
            <div>
                Page {page} of {pageCount} ({total} total)
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => handleChange(page - 1)}
                    disabled={page <= 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    onClick={() => handleChange(page + 1)}
                    disabled={page >= pageCount}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

export default function DataTable<T>({
    data,
    columns,
    isLoading,
    error,
    emptyMessage = 'No records found.',
    caption,
    pagination,
    onRetry,
}: DataTableProps<T>) {
    if (error) {
        return (
            <ErrorState
                message={error}
                onRetry={onRetry}
                className="min-h-[240px]"
            />
        );
    }

    if (!isLoading && data.length === 0) {
        return (
            <EmptyState
                title="Nothing here yet"
                description={emptyMessage}
                className="min-h-[240px]"
            />
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="w-full overflow-x-auto">
                <Table className="min-w-full">
                    {caption && <TableCaption>{caption}</TableCaption>}
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                                        <Spinner />
                                        <span>Loading...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((column) => (
                                        <TableCell key={column.key} className={column.className}>
                                            {column.render ? column.render(row) : (row as any)[column.key]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            {pagination && <Pagination {...pagination} />}
        </div>
    );
}
