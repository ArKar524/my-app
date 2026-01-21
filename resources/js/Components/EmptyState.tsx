import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type EmptyStateProps = {
    title?: string;
    description?: string;
    action?: ReactNode;
    className?: string;
};

export default function EmptyState({
    title = 'No data',
    description = 'There is nothing to display yet.',
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex h-full min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card p-6 text-center text-muted-foreground',
                className,
            )}
        >
            <div className="text-lg font-semibold text-foreground">{title}</div>
            <div className="max-w-md text-sm">{description}</div>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
