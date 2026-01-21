import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { FlashToaster } from '@/Components/FlashToaster';
import { Link, usePage } from '@inertiajs/react';
import { useMemo, useState, type PropsWithChildren, type ReactNode } from 'react';
import type { PageProps } from '@/types';

type AppLayoutProps = PropsWithChildren<{
    header?: ReactNode;
}>;

type NavItem = {
    label: string;
    routeName: string;
};

const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', routeName: 'dashboard' },
    { label: 'Accounts', routeName: 'accounts.index' },
    { label: 'Categories', routeName: 'categories.index' },
    { label: 'Transactions', routeName: 'transactions.index' },
    { label: 'Reports', routeName: 'reports.index' },
    { label: 'Pages', routeName: 'facebook.pages' },
    { label: 'Inbox', routeName: 'facebook.inbox' },
    { label: 'Webhook Events', routeName: 'facebook.webhook-events' },
];

export default function AppLayout({ header, children }: AppLayoutProps) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const navLinks = useMemo(() => {
        const router = route();

        return NAV_ITEMS.map((item) => {
            const available = router.has(item.routeName);
            return {
                ...item,
                href: available ? route(item.routeName) : '#',
                active: available ? router.current(item.routeName) : false,
                disabled: !available,
            };
        });
    }, []);

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-muted text-foreground">
            <FlashToaster />
            <nav className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-primary" />
                                </Link>
                            </div>

                            <div className="hidden items-center space-x-2 sm:flex">
                                {navLinks.map((item) => (
                                    <NavLink
                                        key={item.routeName}
                                        href={item.href}
                                        active={item.active}
                                        className={
                                            item.disabled
                                                ? 'pointer-events-none opacity-50'
                                                : ''
                                        }
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-card px-3 py-2 text-sm font-medium leading-4 text-muted-foreground transition duration-150 ease-in-out hover:text-foreground focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition duration-150 ease-in-out hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {navLinks.map((item) => (
                            <ResponsiveNavLink
                                key={item.routeName}
                                href={item.href}
                                active={item.active}
                                className={
                                    item.disabled
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }
                            >
                                {item.label}
                            </ResponsiveNavLink>
                        ))}
                    </div>

                    <div className="border-t border-border pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-foreground">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-card text-foreground shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
