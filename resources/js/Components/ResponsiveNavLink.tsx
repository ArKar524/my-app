import { Link, type InertiaLinkProps } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

type ResponsiveNavLinkProps = PropsWithChildren<
    InertiaLinkProps & {
        active?: boolean;
    }
>;

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: ResponsiveNavLinkProps) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-primary bg-primary/10 text-foreground focus:border-primary focus:bg-primary/15 focus:text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground focus:border-border focus:bg-muted focus:text-foreground'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
