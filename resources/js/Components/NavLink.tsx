import { Link, type InertiaLinkProps } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';

type NavLinkProps = PropsWithChildren<
    InertiaLinkProps & {
        active?: boolean;
    }
>;

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: NavLinkProps) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-primary text-foreground focus:border-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground focus:border-border focus:text-foreground') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
