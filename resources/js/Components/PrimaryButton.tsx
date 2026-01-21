import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

type PrimaryButtonProps = PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement>
>;

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground transition duration-150 ease-in-out hover:bg-primary/90 focus:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background active:bg-primary/80 ${
                    disabled ? 'opacity-60' : ''
                } ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
