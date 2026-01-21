import * as React from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const badgeVariants: Record<BadgeVariant, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input text-foreground',
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

export function Badge({
    className,
    variant = 'default',
    ...props
}: BadgeProps) {
    return (
        <div
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                badgeVariants[variant],
                className,
            )}
            {...props}
        />
    );
}
