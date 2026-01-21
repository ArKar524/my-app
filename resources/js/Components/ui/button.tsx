import * as React from 'react';
import { cn } from '@/lib/utils';

export type ButtonVariant =
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
    primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    outline:
        'border border-input bg-background hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    ghost:
        'hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background',
};

const baseClasses =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 px-4 py-2';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', type = 'button', ...props }, ref) => {
        return (
            <button
                type={type}
                className={cn(baseClasses, variantClasses[variant], className)}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';
