import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type SecondaryButtonProps = PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement>
>;

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: SecondaryButtonProps) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-md border border-border bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-secondary-foreground shadow-sm transition duration-150 ease-in-out hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
                    disabled ? 'opacity-60' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
